export const GENRES = [
    {
        id: 'cyberpunk',
        name: 'Cyber City',
        prompt: 'a futuristic cyberpunk mega-city featuring a neon-soaked skyline with towering holograms under a rainy night sky',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        color: 0xcd00ff // Neon Purple
    },
    {
        id: 'nature',
        name: 'Deep Nature',
        prompt: 'a majestic mountain vista overlooking dense emerald forests bathed in a warm golden hour glow',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        color: 0x228b22 // Forest Green
    },
    {
        id: 'space',
        name: 'Cosmos',
        prompt: 'an expansive cosmic nebula with radiant star fields and drifting galactic dust shown on an epic cinematic scale',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
        color: 0x000080 // Navy Blue
    },
    {
        id: 'abstract',
        name: 'Abstract',
        prompt: '3D abstract geometry featuring fluid organic forms and translucent glass textures in a sleek minimal design',
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
        color: 0xffa500 // Orange
    },
    {
        id: 'cars',
        name: 'Supercars',
        prompt: 'a supercar moving at high speed captured in a wide angle shot with glossy reflections',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
        color: 0xdc143c // Crimson Red
    },
    {
        id: 'zen',
        name: 'Zen Garden',
        prompt: 'a serene Japanese zen garden with falling cherry blossoms and tranquil water features',
        image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
        color: 0xffb7c5 // Cherry Blossom Pink
    },
    {
        id: 'ocean',
        name: 'Ocean Depths',
        prompt: 'a vibrant coral reef teeming with colorful tropical marine life in crystal-clear blue water pierced by shimmering sunbeams',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
        color: 0x00ced1 // Dark Turquoise
    },
    {
        id: 'fantasy',
        name: 'Fantasy Realm',
        prompt: 'an enchanted fantasy realm featuring floating sky islands and glowing mystical auroras',
        image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
        color: 0x9370db // Medium Purple
    },
    {
        id: 'pastel',
        name: 'Pastel Dreamscape',
        prompt: 'a dreamy minimalist landscape with ethereal diffuse light and serene abstract skies',
        image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=800&q=80',
        color: 0xb0e0e6 // Powder Blue
    },
    {
        id: 'cozyinterior',
        name: 'Cozy Interior',
        prompt: 'a cozy hygge room with warm sunlit windows and plush soft textures featuring layered pillows',
        image: 'https://plus.unsplash.com/premium_photo-1674815329488-c4fc6bf4ced8',
        color: 0xd2691e // Chocolate/Warm Brown
    },
    {
        id: 'lofi',
        name: 'Lo-fi Study Vibes',
        prompt: 'a study table with cozy lighting while raining outside featuring a warm lamp glow and a steaming mug',
        image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80',
        color: 0x483d8b // Dark Slate Blue
    },
    {
        id: 'goldenhour',
        name: 'Golden Hour City',
        prompt: 'an urban skyline bathed in rich warm sunlight with cinematic lens flares over a calm atmospheric cityscape',
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
        color: 0xff8c00 // Dark Orange
    },
    {
        id: 'sky',
        name: 'Sky & Clouds',
        prompt: 'majestic rolling clouds during a vibrant sunrise creating an expansive celestial atmosphere',
        image: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800&q=80',
        color: 0x87ceeb // Sky Blue
    },
    {
        id: 'terrain',
        name: 'Rough Terrain',
        prompt: 'rocky canyon landscapes with rugged cliffs and raw geological textures showing desert badlands',
        image: 'https://images.unsplash.com/photo-1546514355-7fdc90ccbd03?w=800&q=80',
        color: 0xa0522d // Sienna
    },
    {
        id: 'stilllife',
        name: 'Still Life',
        prompt: 'a classic still life composition with an arranged flowerpot on a white background with dramatic chiaroscuro lighting',
        image: 'https://images.unsplash.com/photo-1588263823647-ce3546d42bfe?w=800&q=80',
        color: 0x8b4513 // Saddle Brown
    },
    {
        id: 'iridescence',
        name: 'Iridescence',
        prompt: 'holographic iridescent textures with shimmering pearl colors and liquid metal reflections',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
        color: 0x00ffff // Cyan
    },
    {
        id: 'flora',
        name: 'Lush Flora',
        prompt: 'an exotic botanical garden with intricate leaf patterns and vibrant blooming flowers',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
        color: 0x32cd32 // Lime Green
    }
];

export const PROMPT_COLLECTIONS = {
    LIGHTING: [
        'illuminated by bioluminescent lighting',
        'bathed in harsh cinematic spotlight',
        'with vibrant radiant neon glow',
        'under a warm golden hour sun',
        'with soft volumetric light rays',
        'featuring high-contrast chiaroscuro'
    ],
    ATMOSPHERE: [
        'shrouded in mysterious thick fog',
        'during a heavy tropical rainstorm',
        'filled with sparkling dust particles',
        'with ethereal floating embers',
        'in a serene and silent void',
        'surrounded by a chaotic energy'
    ],
    CAMERA: [
        'captured through a wide-angle lens',
        'viewed through a 35mm film camera',
        'with high-end macro photography detail',
        'shot on an anamorphic lens with flares',
        'with a deep depth of field',
        'using a low-angle heroic perspective'
    ],
    DETAIL: [
        'with intricate mechanical greeble',
        'featuring liquid metal reflections',
        'with slight chromatic aberration',
        'including ornate golden filigree',
        'with hyper-realistic surface textures',
        'showing weathered and aged patina'
    ]
};

export const FEATURED_TAGS = [
    "Cinematic Noir // High Contrast",
    "Vogue Editorial // Soft Flow",
    "Cyberpunk Void // Neon Bloom",
    "Classic Minimalist // Pure Forms",
    "Surrealism // Liquid Metal",
    "8mm Retro // Grainy Texture",
    "Hyper-Detail // Mechanical",
    "Ethereal // Gossamer Light"
];

export const NEGATIVE_PROMPT = "low quality, blurry, distorted, grainy, text, watermark, signature, deformed, ugly, bad anatomy, out of focus";

export const STYLES = [
    {
        id: 'minimal',
        name: 'Minimalist',
        prompt: 'a clean minimalist vector art composition with crisp lines and flat muted colors depicting',
        keywords: 'negative space, whitespace, simple geometric forms, clean edges',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'
    },
    {
        id: 'oil',
        name: 'Oil Paint',
        prompt: 'a thick impasto oil painting with rich textured brush strokes and traditional artistic depth of',
        keywords: 'canvas texture, heavy paint, classic art, painterly',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80'
    },
    {
        id: 'neon',
        name: 'Neon Glow',
        prompt: 'a synthwave style digital artwork with highly saturated neon cyber colors on a dark background of',
        keywords: 'fluorescent, glowing, synthwave aesthetic, 80s palette',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
    },
    {
        id: 'sketch',
        name: 'Tech Sketch',
        prompt: 'a precise technical blueprint schematic drawn with fine white drafting lines on a black background of',
        keywords: 'diagram, engineering, architectural drawing, layout',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80'
    },
    {
        id: 'clay',
        name: '3D Clay',
        prompt: 'a handcrafted 3D claymation render with matte soft surfaces and studio lighting looking like a stop-motion model of',
        keywords: 'plasticine, soft lighting, miniature, tactile',
        image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80'
    },
    {
        id: 'noir',
        name: 'Film Noir',
        prompt: 'a dramatic black and white film noir photograph with stark high contrast and deep shadows of',
        keywords: 'monochrome, moody, shadow play, cinematic suspense',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80'
    },
    {
        id: 'watercolor',
        name: 'Watercolor',
        prompt: 'a dreamy watercolor painting with flowing wet pigments and soft bleeding paper edges of',
        keywords: 'painting, fluid, artistic, paper texture',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80'
    },
    {
        id: 'pixel',
        name: 'Pixel Art',
        prompt: 'a nostalgic 16-bit pixel art scene with distinct blocks and a retro video game aesthetic of',
        keywords: 'low-res, blocks, 8-bit, nostalgic',
        image: 'https://images.unsplash.com/photo-1671750764695-10c7f164844c'
    },
    {
        id: 'anime',
        name: 'Anime Aesthetic',
        prompt: 'a high-quality anime key visual with vivid radiant colors and dramatic lighting in the style of Makoto Shinkai depicting',
        keywords: 'manga style, vibrant, expressive, colorful',
        image: 'https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14'
    },
    {
        id: 'photoreal',
        name: 'Photorealistic',
        prompt: 'an ultra-realistic 8K photograph with sharp focus and volumetric lighting using a high-end camera to capture',
        keywords: 'hyper-detailed, documentary, raw photo, masterwork',
        image: 'https://images.unsplash.com/photo-1690626826406-c2fc0d344551'
    },
    {
        id: 'voxel',
        name: 'Voxel Art',
        prompt: 'an isometric voxel art render made of cubic 3D blocks with bright playful colors of',
        keywords: 'minecraft style, cubic, 3D blocks, isometric',
        image: 'https://images.unsplash.com/photo-1743306947426-06d3d970e58f'
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        prompt: 'a wide-angle cinematic movie shot with a bold color grade and anamorphic lens flares of',
        keywords: 'hollywood look, epic, feature film, high production',
        image: 'https://images.unsplash.com/photo-1610847455028-9e55e62bac33'
    },
    {
        id: 'glitch',
        name: 'Glitch Effect',
        prompt: 'a distorted digital glitch art piece with data corruption and chromatic aberration artifacts of',
        keywords: 'digital error, noise, distortion, psychedelic',
        image: 'https://images.unsplash.com/photo-1634368998864-8984df61cdda'
    },
    {
        id: 'lowpoly',
        name: 'Low Poly',
        prompt: 'a low-poly 3D computer render with faceted geometric shapes and flat shading of',
        keywords: 'triangles, vertices, computer graphics, retro 3D',
        image: 'https://images.unsplash.com/photo-1643143596361-a39511490214'
    },
    {
        id: 'bwphoto',
        name: 'B&W Photo',
        prompt: 'a vintage black and white photograph with heavy film grain and high contrast monochrome tones of',
        keywords: 'retro, analog, classic photography, silver gelatin',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'
    },
    {
        id: 'classicpaint',
        name: 'Classic Painting',
        prompt: 'a classical fine art painting with visible acrylic brushwork and a traditional museum composition of',
        keywords: 'baroque, masterpiece, ornate, historical',
        image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80'
    },
    {
        id: 'graphic',
        name: 'Graphic Design',
        prompt: 'a modern graphic design poster with bold vector shapes and strong typography elements of',
        keywords: 'poster art, Swiss design, flat, geometric',
        image: 'https://images.unsplash.com/photo-1586974087421-2ba56dab378c'
    },
    {
        id: 'hassalblad',
        name: 'Hassalblad',
        prompt: 'a medium-format photograph shot on a Hasselblad X2D 100C with a 90mm lens showing creamy bokeh and hyper-realistic details of',
        keywords: 'superlative quality, medium format, creamy bokeh, studio',
        image: 'https://images.unsplash.com/photo-1699229483394-f6eda2c50262'
    },
    {
        id: 'ink',
        name: 'Ink Wash',
        prompt: 'a traditional sumi-e ink wash painting with monochromatic flowing strokes and negative space of',
        keywords: 'zen, calligraphy, brush strokes, black ink',
        image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&q=80'
    },
    {
        id: 'modernist',
        name: 'Modernist',
        prompt: 'a mid-century modernist Bauhaus artwork with geometric abstraction and primary colors of',
        keywords: 'abstract, Bauhaus, primary colors, functional art',
        image: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80'
    }
];

export const COLOR_BIASES = [
    { id: null, name: 'None', color: 'bg-gray-600', border: 'border-white/30' },
    { id: 'red', name: 'Red', color: 'bg-red-600', border: '' },
    { id: 'blue', name: 'Blue', color: 'bg-blue-600', border: '' },
    { id: 'gold', name: 'Gold', color: 'bg-yellow-500', border: '' },
    { id: 'black and white', name: 'B&W', color: 'bg-black', border: 'border-white' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-600', border: '' },
    { id: 'green', name: 'Green', color: 'bg-green-600', border: '' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-600', border: '' }
];

export const PROMPT_TEMPLATES = [
    '{style_prompt} {genre_prompt}, {style_keywords}, emphasizing {color} tones, {random_modifier}',
    '{style_tag} {style_prompt} {genre_prompt} in a {random_modifier} atmosphere',
    '{style_prompt} {genre_prompt} with {style_keywords} and {random_modifier}',
    '{genre_prompt} reimagined as {style_prompt}, {style_keywords}, {random_modifier}',
    'A masterpiece {genre_prompt}, style of {style_prompt}, {style_keywords}, {color} palette, {random_modifier}'
];

export const RATIOS = [
    { id: '9:16', label: 'MOBILE (9:16)', width: 1080, height: 1920 },
    { id: '16:9', label: 'DESKTOP (16:9)', width: 1920, height: 1080 },
    { id: '21:9', label: 'ULTRAWIDE (21:9)', width: 2560, height: 1080 },
    { id: '1:1', label: 'SQUARE (1:1)', width: 1024, height: 1024 }
];

export const DAILY_LIMIT = 10;
export const STORAGE_KEY = '_sys_compute_quota';
export const ARCHIVE_KEY = '_sys_asset_archive';
