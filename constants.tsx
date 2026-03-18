
import { PlantData, ExteriorData, BuildingMainCategory } from './types';

export const PLANT_MASTER: PlantData[] = [
  { id: 'p1', name: 'ドウダンツツジ', en: 'Enkianthus perulatus shrub', type: 'shrub', color: '#F87171', height: 1.5, width: 1.0 }, 
  { id: 'p2', name: 'シラカシ', en: 'Quercus myrsinifolia evergreen tree', type: 'tree', color: '#15803D', height: 3.0, width: 2.0 },
  { id: 'p3', name: 'イロハモミジ', en: 'Japanese maple tree', type: 'tree', color: '#F97316', height: 3.5, width: 3.0 },
  { id: 'p4', name: 'アオキ', en: 'Aucuba japonica shrub', type: 'shrub', color: '#16A34A', height: 1.2, width: 1.0 },
  { id: 'p5', name: 'ウメ', en: 'Japanese apricot plum tree', type: 'tree', color: '#F9A8D4', height: 3.0, width: 3.0 },
  { id: 'p6', name: 'ジンチョウゲ', en: 'Daphne odora shrub', type: 'shrub', color: '#FBCFE8', height: 1.0, width: 0.8 },
  { id: 'p7', name: 'アセビ', en: 'Japanese andromeda shrub', type: 'shrub', color: '#FFFFFF', height: 1.5, width: 1.2 },
  { id: 'p8', name: 'クロマツ', en: 'Japanese black pine tree', type: 'tree', color: '#14532D', height: 4.0, width: 3.5 },
  { id: 'p9', name: 'クチナシ', en: 'Gardenia shrub', type: 'shrub', color: '#FEF9C3', height: 0.8, width: 0.6 },
  { id: 'p10', name: 'サツキ', en: 'Satsuki azalea shrub', type: 'shrub', color: '#EC4899', height: 0.6, width: 0.5 },
  { id: 'p11', name: 'スギ', en: 'Japanese cedar tree', type: 'tree', color: '#166534', height: 5.0, width: 2.5 },
  { id: 'p12', name: 'アラカシ', en: 'Quercus glauca oak tree', type: 'tree', color: '#15803D', height: 3.0, width: 2.5 },
  { id: 'p13', name: 'アカマツ', en: 'Japanese Red pine tree', type: 'tree', color: '#7F1D1D', height: 4.0, width: 3.0 },
  { id: 'p14', name: 'サザンカ', en: 'Sasanqua camellia tree', type: 'tree', color: '#DB2777', height: 2.5, width: 1.5 },
  { id: 'p15', name: 'モクセイ', en: 'Orange osmanthus tree', type: 'tree', color: '#FB923C', height: 3.0, width: 2.0 },
  { id: 'p16', name: 'ソメイヨシノ', en: 'Yoshino cherry blossom tree', type: 'tree', color: '#FBCFE8', height: 5.0, width: 6.0 },
];

export const EXTERIOR_CATEGORIES: ExteriorData[] = [
  {
    id: 'building_mass',
    name: '建物 (配置確認用)',
    en: 'Modern residential house building structure, simple white geometric mass, architectural volume',
    icon: '🏠',
    defaultSize: { w: 5.0, h: 5.0 },
    category: 'building',
    maker: 'Generic'
  },
  { 
    id: 'carport_sc', 
    name: 'カーポートSC (1台)', 
    en: 'LIXIL Carport SC, minimalist flat aluminum roof carport, stylish modern design, black and silver metallic finish', 
    icon: '🚗', 
    defaultSize: { w: 2.7, h: 5.0 },
    category: 'carport',
    maker: 'LIXIL'
  },
  { 
    id: 'carport_fugo', 
    name: 'フーゴF (2台)', 
    en: 'LIXIL Fugo F, wide flat roof carport for 2 cars, modern style, silver frame, polycarbonate roof', 
    icon: '🚙', 
    defaultSize: { w: 5.4, h: 5.0 },
    category: 'carport',
    maker: 'LIXIL'
  },
  { 
    id: 'carport_efrooge', 
    name: 'エフルージュ FIRST', 
    en: 'YKK AP Efrooge FIRST, flat roof carport, sharp edges, modern simple design, platinum sten color', 
    icon: '🚗', 
    defaultSize: { w: 2.7, h: 5.1 },
    category: 'carport',
    maker: 'YKKAP'
  },
  { 
    id: 'carport_gport', 
    name: 'ジーポート Pro', 
    en: 'YKK AP G-Port Pro, heavy duty folded steel roof carport, robust industrial design, typhoon resistant', 
    icon: '🚛', 
    defaultSize: { w: 3.0, h: 5.5 },
    category: 'carport',
    maker: 'YKKAP'
  },
  { 
    id: 'carport_f2', 
    name: 'カーポート FII', 
    en: 'Sankyo Aluminum Carport FII, ultra minimalist sophisticated design, flat roof with integrated beam', 
    icon: '🏎️', 
    defaultSize: { w: 2.9, h: 5.0 },
    category: 'carport',
    maker: 'Sankyo'
  },
  { 
    id: 'carport_beams', 
    name: 'ビームス', 
    en: 'Sankyo Aluminum Beams, premium design carport, black folded plates, ceiling material, luxury garage feel', 
    icon: '🚘', 
    defaultSize: { w: 3.0, h: 5.5 },
    category: 'carport',
    maker: 'Sankyo'
  },
  { 
    id: 'deck_kirara', 
    name: '樹ら楽ステージ', 
    en: 'LIXIL Kirara Stage, artificial wood deck terrace, warm brown natural wood texture, outdoor living space', 
    icon: '🪑', 
    defaultSize: { w: 3.6, h: 1.8 },
    category: 'deck',
    maker: 'LIXIL'
  },
  { 
    id: 'deck_rewood', 
    name: 'リウッドデッキ 200', 
    en: 'YKK AP ReWood Deck 200, durable artificial wood deck, realistic wood grain, red brown color', 
    icon: '🪵', 
    defaultSize: { w: 3.6, h: 2.0 },
    category: 'deck',
    maker: 'YKKAP'
  },
  { 
    id: 'deck_hitotoki', 
    name: 'ひとと木2', 
    en: 'Sankyo Aluminum Hitotoki 2, artificial wood deck, comfortable garden terrace, soft texture', 
    icon: '🧘', 
    defaultSize: { w: 3.6, h: 1.8 },
    category: 'deck',
    maker: 'Sankyo'
  },
  { 
    id: 'fence_ab', 
    name: 'フェンスAB', 
    en: 'LIXIL Fence AB, horizontal slit aluminum fence, privacy screen, modern exterior wall, shine gray color', 
    icon: '🚧', 
    defaultSize: { w: 2.0, h: 0.1 },
    category: 'fence',
    maker: 'LIXIL'
  },
  { 
    id: 'fence_lucious', 
    name: 'ルシアス フェンス', 
    en: 'YKK AP Lucious Fence, wood grain laminated aluminum fence, natural look, horizontal planks', 
    icon: '🧱', 
    defaultSize: { w: 2.0, h: 0.1 },
    category: 'fence',
    maker: 'YKKAP'
  },
  { 
    id: 'fence_shatrena', 
    name: 'シャトレナII', 
    en: 'Sankyo Aluminum Shatrena II, stylish aluminum fence, wood texture accent, modern exterior boundary', 
    icon: '🛡️', 
    defaultSize: { w: 2.0, h: 0.1 },
    category: 'fence',
    maker: 'Sankyo'
  },
  { 
    id: 'light_bisai', 
    name: '美彩 ポールライト', 
    en: 'LIXIL Bisai Pole Light, slim cylindrical garden light, warm led illumination, night garden atmosphere, stylish lighting', 
    icon: '💡', 
    defaultSize: { w: 0.3, h: 0.3 },
    category: 'light',
    maker: 'LIXIL'
  },
  { 
    id: 'light_exterior', 
    name: 'エクステリアライト', 
    en: 'YKK AP Exterior Light, simple modern garden post light, led pathway lighting', 
    icon: '🕯️', 
    defaultSize: { w: 0.3, h: 0.3 },
    category: 'light',
    maker: 'YKKAP'
  },
  { 
    id: 'light_wonder', 
    name: 'ワンダーライト', 
    en: 'Sankyo Aluminum Wonder Light, garden spot light, up-lighting trees, dramatic night scene', 
    icon: '🔦', 
    defaultSize: { w: 0.3, h: 0.3 },
    category: 'light',
    maker: 'Sankyo'
  },
  { 
    id: 'tile_graceland', 
    name: 'グレイスランド', 
    en: 'LIXIL Graceland tiles, 300mm square slate texture pathway, gray stone paving, entrance approach', 
    icon: '⬜', 
    defaultSize: { w: 1.0, h: 3.0 },
    category: 'paving',
    maker: 'LIXIL'
  },
  { 
    id: 'paving_inter', 
    name: 'インターロッキング', 
    en: 'Permeable interlocking concrete pavers, geometric pattern pathway, beige and grey brick texture', 
    icon: '🧱', 
    defaultSize: { w: 1.0, h: 3.0 },
    category: 'paving',
    maker: 'Generic'
  },
  { 
    id: 'paving_stone', 
    name: '石張り (乱形)', 
    en: 'Natural random stone paving, crazy paving quartz stone, yellow and pink warm tones, elegant garden path', 
    icon: '🪨', 
    defaultSize: { w: 1.0, h: 3.0 },
    category: 'paving',
    maker: 'Generic'
  },
];

export const BUILDING_TASTES = {
  japanese: {
    label: '和風系',
    styles: [
      { id: 'pure_japanese', name: '純和風', prompt: 'Traditional Japanese house exterior, curved kawara tile roof, wooden engawa veranda, deep eaves and overhangs, lattice wooden screens, natural wood and white plaster walls, Japanese garden with stone lantern and maple trees, peaceful zen atmosphere.' },
      { id: 'wa_modern', name: '和モダン', prompt: 'Contemporary Japanese modern house exterior, flat roof with deep overhang, combination of dark wood siding and white plaster, large glass panels, modern interpretation of traditional lattice, minimalist Japanese courtyard garden, clean geometric forms, elegant and sophisticated.' },
      { id: 'sukiya', name: '数寄屋風', prompt: 'Sukiya-style Japanese architecture exterior, asymmetrical design, delicate wooden structure, thatched or shingled roof, bamboo fence, roji garden path with stepping stones, moss-covered stone lantern, understated elegance, muted natural colors, refined rustic aesthetic.' }
    ]
  },
  western: {
    label: '洋風系',
    styles: [
      { id: 'scandinavian', name: '北欧 (スカンジナビアン)', prompt: 'Scandinavian house exterior, simple gabled roof, white or light gray wooden cladding, large windows for maximum daylight, red or black accents on doors and trim, minimalist design, pine trees surrounding, Nordic landscape, clean and functional aesthetic.' },
      { id: 'mediterranean', name: '南欧 (プロヴァンス)', prompt: 'Mediterranean villa exterior, white stucco walls, terracotta roof tiles, wooden shutters in blue or green, arched windows and doorways, wrought iron balcony railings, climbing bougainvillea, courtyard with fountain, olive trees and cypress, bright sunny day, warm and inviting Provencal atmosphere.' },
      { id: 'british', name: 'ブリティッシュ', prompt: 'British Georgian house exterior, red brick facade, symmetrical design, white sash windows with pediments, black painted front door with brass knocker, decorative stone quoins, chimney stacks, manicured English garden with hedges, wrought iron fence, overcast English sky, dignified and classic atmosphere.' },
      { id: 'french', name: 'フレンチ', prompt: 'French chateau style house exterior, limestone facade, mansard roof with dormer windows, tall symmetrical windows with decorative iron balconies, ornate stone carvings, formal French garden with geometric hedges and fountain, gravel courtyard, elegant and aristocratic atmosphere.' },
      { id: 'california', name: 'アメリカン (カリフォルニア)', prompt: 'California ranch style house exterior, single story with low-pitched roof, white stucco walls, large windows, outdoor living space with pool, palm trees and succulent landscaping, wooden deck, relaxed and open atmosphere, blue sky.' },
      { id: 'brooklyn', name: 'アメリカン (ブルックリン)', prompt: 'Brooklyn brownstone exterior, historic red-brown sandstone facade, ornate cornice and window lintels, stoop entrance with iron railings, fire escape on facade, tree-lined street, urban neighborhood atmosphere, overcast day.' }
    ]
  },
  modern: {
    label: 'モダン系',
    styles: [
      { id: 'simple_modern', name: 'シンプルモダン', prompt: 'Minimalist modern house exterior, geometric cubic forms, flat roof, white rendered walls and glass curtain walls, cantilevered volumes, clean lines with no ornamentation, reflecting pool, minimal landscaping, stark and sculptural aesthetic.' },
      { id: 'natural_modern', name: 'ナチュラルモダン', prompt: 'Natural modern house exterior, combination of white walls and warm wood cladding, large windows framing garden views, flat or gently sloped roof, natural stone accents, native plant landscaping, wooden deck, harmonious blend with nature, warm and welcoming atmosphere.' },
      { id: 'industrial', name: 'インダストリアル', prompt: 'Industrial style building exterior, concrete and steel construction, large steel-framed windows, corrugated metal siding accents, exposed structural elements, loading dock style entrance, converted warehouse aesthetic, urban setting, raw and utilitarian atmosphere.' },
      { id: 'mid_century', name: 'ミッドセンチュリー', prompt: 'Mid-century modern house exterior, post-and-beam construction, flat or butterfly roof with deep overhangs, walls of glass, integration with landscape, stone and wood materials, carport with angled supports, atomic age design details, Palm Springs aesthetic.' }
    ]
  }
};
