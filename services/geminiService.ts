
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiKey } from "../utils/api";

/**
 * Sends a text prompt to Gemini (Chat/Advice) with history.
 */
export const chatWithGemini = async (
  messages: { role: 'user' | 'model' | 'system', text: string }[]
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API_KEY_ERROR");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: "You are an expert landscape designer. Provide helpful, professional advice about garden layout, plant selection, and exterior design in Japanese."
    });

    // Convert messages to history format
    // Filter out system messages as they are set in systemInstruction
    const history = messages
      .filter(m => m.role !== 'system')
      .slice(0, -1) // All except last one
      .map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.text }]
      }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[geminiService] chatWithGemini エラー:', message);
    console.debug('[geminiService] chatWithGemini エラー詳細:', error);
    if (message === "API_KEY_ERROR" || message?.includes("403") || message?.includes("API key") || message?.includes("permission") || message?.includes("key")) {
      throw new Error("API_KEY_ERROR");
    }
    throw new Error(message);
  }
};

/**
 * Sends a text prompt to Gemini (Chat/Advice).
 */
export const generateTextResponse = async (
  userPrompt: string,
  systemPrompt: string = ""
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API_KEY_ERROR");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini Text API Error:", error);
    if (error.message === "API_KEY_ERROR" || error.message?.includes("403") || error.message?.includes("permission") || error.message?.includes("key")) {
      throw new Error("API_KEY_ERROR");
    }
    return `エラーが発生しました: ${(error as Error).message}`;
  }
};

/**
 * Generates an image based on a prompt and an optional reference image.
 */
export const generateImageResponse = async (
  prompt: string,
  referenceImageBase64?: string | null,
  modelName: string = 'gemini-3-flash-preview'
): Promise<string | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API_KEY_ERROR");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the user-selected model directly - user has full control
    const model = genAI.getGenerativeModel({ model: modelName });

    const parts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [];
    if (referenceImageBase64) {
      const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      });
      parts.push({
        text: `[STRUCTURAL CONSTRAINT] The following reference image is a strict spatial blueprint. 
            Render each element exactly within its designated transparent or white overlay zone. 
            Respect the scale, orientation, and relative positions of all marked objects. 
            Do not shift, remove, or reposition any outlined structure. 
            Transform this plan into a photorealistic visualization based on this prompt: ${prompt}`
      });
    } else {
      parts.push({ text: prompt });
    }

    const result = await model.generateContent(parts as any);
    const response = await result.response;

    // Check for standard text response first
    // Note: Gemini standard models return text. If the model happens to return image data in parts (unlikely for standard endpoints), we check it.
    // Since official Image Generation usually requires specific handling (Imagen), this might just return text description.
    // For now we return null if no image data found, consistent with previous fallback.

    // Attempt to find inline data in candidates (if supported by experimental models)
    if (response.candidates && response.candidates.length > 0) {
      const contentParts = response.candidates[0].content?.parts;
      if (contentParts) {
        for (const part of contentParts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }

    return null;
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    if (error.message === "API_KEY_ERROR" || error.message?.includes("403") || error.message?.includes("permission") || error.message?.includes("key")) {
      throw new Error("API_KEY_ERROR");
    }
    throw error;
  }
};

/**
 * Refines a prompt for better image generation results.
 */
export const refinePrompt = async (currentPrompt: string): Promise<string> => {
  const prompt = `Convert this technical description into a vivid, high-quality architectural photography prompt in English. 
    Focus on materiality, textures, light play (shadows and reflections), and overall atmosphere. 
    Ensure it remains strictly tied to the specific sizes and rotations mentioned.
    
    Original Description: "${currentPrompt}"`;

  return await generateTextResponse(prompt, "You are a professional architectural visualizer. Create highly detailed prompts that result in award-winning renders.");
};

/**
 * Detects the bounding box of the main building.
 */
export const detectBuildingArea = async (imageBase64: string, modelName: string = 'gemini-3-flash-preview'): Promise<{ x: number, y: number, width: number, height: number } | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API_KEY_ERROR");

    // Use the user-selected model directly - user has full control via AI Settings
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const promptText = `この画像は敷地図（配置図）です。
画像内にある「建物」の外形（フットプリント）を検出してください。
重要な注意点:
- 「敷地境界線」「道路境界線」「隣地境界線」は建物ではありません。これらは無視してください。
- 「申請建築物」「建物」「住宅」などと書かれた矩形が建物です。
- 通常、敷地の中央付近にある太い線で囲まれた矩形エリアが建物です。
- 庭、駐車スペース、敷地内通路は建物ではありません。

建物の境界ボックスを、画像全体に対する**パーセンテージ（0〜100）**で返してください。
JSON形式: { "x": 左端のX座標%, "y": 上端のY座標%, "width": 幅%, "height": 高さ% }`;

    const parts = [
      { inlineData: { mimeType: "image/png", data: base64Data } },
      { text: promptText }
    ];

    const result = await model.generateContent(parts as any);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Building Detect Error:", error);
    if (error.message === "API_KEY_ERROR" || error.message?.includes("403") || error.message?.includes("permission") || error.message?.includes("key")) {
      throw new Error("API_KEY_ERROR");
    }
    return null;
  }
};
