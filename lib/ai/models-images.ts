/**
 * Modèles d'images pour mAI Studio
 * Providers : FranceStudent, AI Horde
 * 
 * @version 0.0.2
 */

// Catégorie de provider pour les images
export type ImageModelCategory = "francestudent" | "ai-horde";

// Type d'un modèle d'image
export type ImageModel = {
  id: string;
  name: string;
  provider: ImageModelCategory;
  performance?: number;
  eta?: number;
};

// Modèle d'image par défaut
export const DEFAULT_IMAGE_MODEL = "gpt-image-2";

// ──────────────────────────────────────────────
// MODÈLES D'IMAGES FRANCESTUDENT
// ──────────────────────────────────────────────
export const franceStudentImageModels: ImageModel[] = [
  {
    id: "gpt-image-1.5",
    name: "GPT Image 1.5",
    provider: "francestudent",
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    provider: "francestudent",
  },
];

// ──────────────────────────────────────────────
// MODÈLES D'IMAGES AI HORDE
// ──────────────────────────────────────────────
export const aiHordeImageModels: ImageModel[] = [
  { id: "2DN", name: "2DN", provider: "ai-horde", performance: 325_822.9 },
  { id: "526Mix-Animated", name: "526Mix Animated", provider: "ai-horde" },
  { id: "AAM XL", name: "AAM XL", provider: "ai-horde", performance: 300_491.8 },
  { id: "AbsoluteReality", name: "Absolute Reality", provider: "ai-horde", performance: 523_543.3 },
  { id: "Abyss OrangeMix", name: "Abyss OrangeMix", provider: "ai-horde" },
  { id: "AbyssOrangeMix-AfterDark", name: "Abyss OrangeMix AfterDark", provider: "ai-horde", performance: 186_414.2 },
  { id: "ACertainThing", name: "A Certain Thing", provider: "ai-horde" },
  { id: "AIO Pixel Art", name: "AIO Pixel Art", provider: "ai-horde" },
  { id: "AlbedoBase XL 3.1", name: "AlbedoBase XL 3.1", provider: "ai-horde", performance: 452_522.5 },
  { id: "AlbedoBase XL (SDXL)", name: "AlbedoBase XL (SDXL)", provider: "ai-horde", performance: 533_291.7 },
  { id: "AMPonyXL", name: "AM Pony XL", provider: "ai-horde", performance: 875_207.2 },
  { id: "Analog Diffusion", name: "Analog Diffusion", provider: "ai-horde" },
  { id: "Analog Madness", name: "Analog Madness", provider: "ai-horde" },
  { id: "Animagine XL", name: "Animagine XL", provider: "ai-horde" },
  { id: "Anime Illust Diffusion XL", name: "Anime Illust Diffusion XL", provider: "ai-horde" },
  { id: "Anime Pencil Diffusion", name: "Anime Pencil Diffusion", provider: "ai-horde" },
  { id: "Anygen", name: "Anygen", provider: "ai-horde" },
  { id: "AnyLoRA", name: "AnyLoRA", provider: "ai-horde" },
  { id: "Anything Diffusion", name: "Anything Diffusion", provider: "ai-horde" },
  { id: "Anything Diffusion Inpainting", name: "Anything Diffusion Inpainting", provider: "ai-horde" },
  { id: "Anything v3", name: "Anything v3", provider: "ai-horde", performance: 765_453.1 },
  { id: "Anything v5", name: "Anything v5", provider: "ai-horde" },
  { id: "App Icon Diffusion", name: "App Icon Diffusion", provider: "ai-horde" },
  { id: "Art Of Mtg", name: "Art Of MTG", provider: "ai-horde" },
  { id: "Aurora", name: "Aurora", provider: "ai-horde" },
  { id: "A-Zovya RPG Inpainting", name: "A-Zovya RPG Inpainting", provider: "ai-horde" },
  { id: "Babes", name: "Babes", provider: "ai-horde" },
  { id: "BB95 Furry Mix", name: "BB95 Furry Mix", provider: "ai-horde" },
  { id: "BB95 Furry Mix v14", name: "BB95 Furry Mix v14", provider: "ai-horde", performance: 606_978.6 },
  { id: "BigASP", name: "BigASP", provider: "ai-horde" },
  { id: "Blank Canvas XL", name: "Blank Canvas XL", provider: "ai-horde", performance: 87_006.2 },
  { id: "BlenderMix Pony", name: "BlenderMix Pony", provider: "ai-horde" },
  { id: "BweshMix", name: "BweshMix", provider: "ai-horde" },
  { id: "CamelliaMix 2.5D", name: "CamelliaMix 2.5D", provider: "ai-horde" },
  { id: "Cetus-Mix", name: "Cetus Mix", provider: "ai-horde" },
  { id: "Cheese Daddys Landscape Mix", name: "Cheese Daddys Landscape Mix", provider: "ai-horde" },
  { id: "Cheyenne", name: "Cheyenne", provider: "ai-horde" },
  { id: "ChilloutMix", name: "ChilloutMix", provider: "ai-horde" },
  { id: "Comic-Diffusion", name: "Comic Diffusion", provider: "ai-horde" },
  { id: "Counterfeit", name: "Counterfeit", provider: "ai-horde", performance: 613_896.5 },
  { id: "CyberRealistic Pony", name: "CyberRealistic Pony", provider: "ai-horde", performance: 5_619_261.3 },
  { id: "CyriousMix", name: "CyriousMix", provider: "ai-horde" },
  { id: "Dan Mumford Style", name: "Dan Mumford Style", provider: "ai-horde" },
  { id: "Dark Sushi Mix", name: "Dark Sushi Mix", provider: "ai-horde" },
  { id: "Deliberate", name: "Deliberate", provider: "ai-horde", performance: 628_586.7 },
  { id: "Deliberate 3.0", name: "Deliberate 3.0", provider: "ai-horde" },
  { id: "Deliberate Inpainting", name: "Deliberate Inpainting", provider: "ai-horde" },
  { id: "Double Exposure Diffusion", name: "Double Exposure Diffusion", provider: "ai-horde" },
  { id: "Dreamlike Diffusion", name: "Dreamlike Diffusion", provider: "ai-horde" },
  { id: "DreamLikeSamKuvshinov", name: "DreamLike Sam Kuvshinov", provider: "ai-horde" },
  { id: "Dreamshaper", name: "Dreamshaper", provider: "ai-horde", performance: 544_339.1 },
  { id: "DreamShaper Inpainting", name: "DreamShaper Inpainting", provider: "ai-horde" },
  { id: "DreamShaper XL", name: "DreamShaper XL", provider: "ai-horde" },
  { id: "DucHaiten", name: "DucHaiten", provider: "ai-horde" },
  { id: "DucHaiten Classic Anime", name: "DucHaiten Classic Anime", provider: "ai-horde" },
  { id: "DucHaiten GameArt (Unreal) Pony", name: "DucHaiten GameArt Pony", provider: "ai-horde" },
  { id: "Dungeons and Diffusion", name: "Dungeons and Diffusion", provider: "ai-horde" },
  { id: "Dungeons n Waifus", name: "Dungeons n Waifus", provider: "ai-horde" },
  { id: "Edge Of Realism", name: "Edge Of Realism", provider: "ai-horde", performance: 554_527.8 },
  { id: "Eimis Anime Diffusion", name: "Eimis Anime Diffusion", provider: "ai-horde" },
  { id: "Elysium Anime", name: "Elysium Anime", provider: "ai-horde" },
  { id: "Epic Diffusion", name: "Epic Diffusion", provider: "ai-horde" },
  { id: "Epic Diffusion Inpainting", name: "Epic Diffusion Inpainting", provider: "ai-horde" },
  { id: "Ether Real Mix", name: "Ether Real Mix", provider: "ai-horde" },
  { id: "Experience", name: "Experience", provider: "ai-horde" },
  { id: "ExpMix Line", name: "ExpMix Line", provider: "ai-horde" },
  { id: "FaeTastic", name: "FaeTastic", provider: "ai-horde" },
  { id: "Fantasy Card Diffusion", name: "Fantasy Card Diffusion", provider: "ai-horde" },
  { id: "Flat-2D Animerge", name: "Flat 2D Animerge", provider: "ai-horde" },
  { id: "Flux.1-Schnell fp8 (Compact)", name: "Flux.1 Schnell FP8", provider: "ai-horde", performance: 99_833.4 },
  { id: "Furry Epoch", name: "Furry Epoch", provider: "ai-horde", performance: 984_337 },
  { id: "Fustercluck", name: "Fustercluck", provider: "ai-horde" },
  { id: "Galena Redux", name: "Galena Redux", provider: "ai-horde" },
  { id: "Ghibli Diffusion", name: "Ghibli Diffusion", provider: "ai-horde" },
  { id: "GhostMix", name: "GhostMix", provider: "ai-horde" },
  { id: "Grapefruit Hentai", name: "Grapefruit Hentai", provider: "ai-horde", performance: 1_159_942.8 },
  { id: "GTA5 Artwork Diffusion", name: "GTA5 Artwork Diffusion", provider: "ai-horde" },
  { id: "HASDX", name: "HASDX", provider: "ai-horde" },
  { id: "Hassaku XL", name: "Hassaku XL", provider: "ai-horde", performance: 474_191.3 },
  { id: "Healy's Anime Blend", name: "Healy's Anime Blend", provider: "ai-horde" },
  { id: "Hentai Diffusion", name: "Hentai Diffusion", provider: "ai-horde", performance: 179_401.9 },
  { id: "HolyMix ILXL", name: "HolyMix ILXL", provider: "ai-horde" },
  { id: "HRL", name: "HRL", provider: "ai-horde" },
  { id: "ICBINP - I Can't Believe It's Not Photography", name: "ICBINP", provider: "ai-horde", performance: 574_787.2 },
  { id: "ICBINP XL", name: "ICBINP XL", provider: "ai-horde" },
  { id: "iCoMix", name: "iCoMix", provider: "ai-horde" },
  { id: "iCoMix Inpainting", name: "iCoMix Inpainting", provider: "ai-horde" },
  { id: "Illuminati Diffusion", name: "Illuminati Diffusion", provider: "ai-horde" },
  { id: "Inkpunk Diffusion", name: "Inkpunk Diffusion", provider: "ai-horde" },
  { id: "Jim Eidomode", name: "Jim Eidomode", provider: "ai-horde" },
  { id: "Juggernaut XL", name: "Juggernaut XL", provider: "ai-horde", performance: 703_639.3 },
  { id: "KaynegIllustriousXL", name: "Kayneg Illustrious XL", provider: "ai-horde", performance: 321_119 },
  { id: "Lawlas's yiff mix", name: "Lawlas's Yiff Mix", provider: "ai-horde" },
  { id: "Liberty", name: "Liberty", provider: "ai-horde" },
  { id: "Lyriel", name: "Lyriel", provider: "ai-horde" },
  { id: "majicMIX realistic", name: "MajicMIX Realistic", provider: "ai-horde" },
  { id: "MeinaMix", name: "MeinaMix", provider: "ai-horde" },
  { id: "MHXL - Aventis Horizon", name: "MHXL Aventis Horizon", provider: "ai-horde" },
  { id: "Midjourney PaintArt", name: "Midjourney PaintArt", provider: "ai-horde" },
  { id: "Mistoon Anime", name: "Mistoon Anime", provider: "ai-horde" },
  { id: "ModernArt Diffusion", name: "ModernArt Diffusion", provider: "ai-horde" },
  { id: "MoonMix Fantasy", name: "MoonMix Fantasy", provider: "ai-horde" },
  { id: "Movie Diffusion", name: "Movie Diffusion", provider: "ai-horde", performance: 955_433.5 },
  { id: "NatViS", name: "NatViS", provider: "ai-horde" },
  { id: "Neurogen", name: "Neurogen", provider: "ai-horde" },
  { id: "NeverEnding Dream", name: "NeverEnding Dream", provider: "ai-horde" },
  { id: "NEW ERA", name: "NEW ERA", provider: "ai-horde" },
  { id: "noobEvo", name: "NoobEvo", provider: "ai-horde" },
  { id: "noob_v_pencil XL", name: "Noob v Pencil XL", provider: "ai-horde" },
  { id: "Nova Anime XL", name: "Nova Anime XL", provider: "ai-horde", performance: 688_364.5 },
  { id: "Nova Furry Pony", name: "Nova Furry Pony", provider: "ai-horde" },
  { id: "NTR MIX IL-Noob XL", name: "NTR MIX IL-Noob XL", provider: "ai-horde", performance: 383_355.9 },
  { id: "Pastel Mix", name: "Pastel Mix", provider: "ai-horde" },
  { id: "Perfect World", name: "Perfect World", provider: "ai-horde" },
  { id: "Photon", name: "Photon", provider: "ai-horde" },
  { id: "Poison", name: "Poison", provider: "ai-horde" },
  { id: "Pony Diffusion XL", name: "Pony Diffusion XL", provider: "ai-horde" },
  { id: "Pony Realism", name: "Pony Realism", provider: "ai-horde" },
  { id: "PPP", name: "PPP", provider: "ai-horde" },
  { id: "Prefect Pony", name: "Prefect Pony", provider: "ai-horde" },
  { id: "Pretty 2.5D", name: "Pretty 2.5D", provider: "ai-horde" },
  { id: "Project Unreal Engine 5", name: "Project Unreal Engine 5", provider: "ai-horde" },
  { id: "Quiet Goodnight XL", name: "Quiet Goodnight XL", provider: "ai-horde", performance: 340_067.3 },
  { id: "Qwen-Image_fp8", name: "Qwen Image FP8", provider: "ai-horde" },
  { id: "RealBiter", name: "RealBiter", provider: "ai-horde" },
  { id: "Real Dos Mix", name: "Real Dos Mix", provider: "ai-horde" },
  { id: "Realism Engine", name: "Realism Engine", provider: "ai-horde" },
  { id: "Realistic Vision", name: "Realistic Vision", provider: "ai-horde" },
  { id: "Realistic Vision Inpainting", name: "Realistic Vision Inpainting", provider: "ai-horde" },
  { id: "Reliberate", name: "Reliberate", provider: "ai-horde" },
  { id: "Rev Animated", name: "Rev Animated", provider: "ai-horde" },
  { id: "RPG", name: "RPG", provider: "ai-horde" },
  { id: "Sci-Fi Diffusion", name: "Sci-Fi Diffusion", provider: "ai-horde" },
  { id: "SD-Silicon", name: "SD Silicon", provider: "ai-horde" },
  { id: "SDXL 1.0", name: "SDXL 1.0", provider: "ai-horde" },
  { id: "Something", name: "Something", provider: "ai-horde" },
  { id: "Stable Cascade 1.0", name: "Stable Cascade 1.0", provider: "ai-horde" },
  { id: "stable_diffusion", name: "Stable Diffusion", provider: "ai-horde", performance: 401_456.1 },
  { id: "stable_diffusion_2.1", name: "Stable Diffusion 2.1", provider: "ai-horde" },
  { id: "stable_diffusion_inpainting", name: "Stable Diffusion Inpainting", provider: "ai-horde" },
  { id: "SwamPonyXL", name: "SwamPony XL", provider: "ai-horde" },
  { id: "ToonYou", name: "ToonYou", provider: "ai-horde" },
  { id: "TUNIX Pony", name: "TUNIX Pony", provider: "ai-horde" },
  { id: "Uhmami", name: "Uhmami", provider: "ai-horde" },
  { id: "Ultraspice", name: "Ultraspice", provider: "ai-horde" },
  { id: "Unstable Diffusers XL", name: "Unstable Diffusers XL", provider: "ai-horde" },
  { id: "Unstable Ink Dream", name: "Unstable Ink Dream", provider: "ai-horde" },
  { id: "URPM", name: "URPM", provider: "ai-horde" },
  { id: "Vector Art", name: "Vector Art", provider: "ai-horde" },
  { id: "WAI-ANI-NSFW-PONYXL", name: "WAI-ANI NSFW Pony XL", provider: "ai-horde", performance: 616_087.5 },
  { id: "WAI-CUTE Pony", name: "WAI-CUTE Pony", provider: "ai-horde" },
  { id: "waifu_diffusion", name: "Waifu Diffusion", provider: "ai-horde", performance: 167_649.2 },
  { id: "WAI-NSFW-illustrious-SDXL", name: "WAI-NSFW Illustrious SDXL", provider: "ai-horde", performance: 1_093_021.8 },
  { id: "Western Animation Diffusion", name: "Western Animation Diffusion", provider: "ai-horde" },
  { id: "White Pony Diffusion 4", name: "White Pony Diffusion 4", provider: "ai-horde", performance: 513_231.9 },
  { id: "Woop-Woop Photo", name: "Woop-Woop Photo", provider: "ai-horde" },
  { id: "Yiffy", name: "Yiffy", provider: "ai-horde" },
  { id: "ZavyChromaXL", name: "ZavyChroma XL", provider: "ai-horde" },
  { id: "Zeipher Female Model", name: "Zeipher Female Model", provider: "ai-horde", performance: 424_019.6 },
  { id: "Z-Image-Turbo", name: "Z-Image Turbo", provider: "ai-horde", performance: 620_806.7 },
];

// ──────────────────────────────────────────────
// AGRÉGATION
// ──────────────────────────────────────────────

// Tous les modèles d'images combinés
export const allImageModels: ImageModel[] = [
  ...franceStudentImageModels,
  ...aiHordeImageModels,
];

// Retourne tous les modèles d'images
export function getImageModels(): ImageModel[] {
  return allImageModels;
}

// Retourne le modèle d'image par défaut
export function getDefaultImageModel(): ImageModel {
  return (
    allImageModels.find((m) => m.id === DEFAULT_IMAGE_MODEL) ??
    franceStudentImageModels[0]
  );
}

// Retourne les modèles d'images par provider
export function getImageModelsByProvider(
  provider: ImageModelCategory
): ImageModel[] {
  return allImageModels.filter((m) => m.provider === provider);
}
