
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ChatSidebar: React.FC = () => {
    const { chatMessages, sendChatMessage, isGeneratingChat } = useAppContext();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSend = () => {
        if (!input.trim() || isGeneratingChat) return;
        sendChatMessage(input);
        setInput('');
    };

    return (
        <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl z-20 h-full overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-800/20 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-white uppercase tracking-wider text-sm">AI デザイン相談</h2>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-neutral-800 text-neutral-300 rounded-tl-none border border-neutral-700'
                            }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold">
                                {msg.role === 'user' ? (
                                    <><span className="flex-1">あなた</span> <User className="w-3 h-3" /></>
                                ) : (
                                    <><Bot className="w-3 h-3" /> <span>AI デザイナー</span></>
                                )}
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {isGeneratingChat && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-800 text-neutral-400 p-3 rounded-2xl rounded-tl-none border border-neutral-700 flex items-center gap-2 text-sm italic">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            考え中...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-neutral-800/30 border-t border-neutral-800">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="デザインについて相談する..."
                        className="w-full bg-neutral-950 text-white text-sm rounded-xl p-3 pr-12 border border-neutral-700 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-neutral-600"
                        rows={3}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGeneratingChat}
                        className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-[10px] text-neutral-600 text-center">
                    Shift + Enter で改行できます
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;
