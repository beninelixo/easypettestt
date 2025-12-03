import { supabase } from "@/integrations/supabase/client";

export interface ImageConfig {
  filename: string;
  path: string;
  prompt: string;
  aspectRatio: string;
  key: string;
}

export const images: ImageConfig[] = [
  {
    filename: "hero-petshop.jpg",
    path: "src/assets/hero-petshop.jpg",
    key: "hero-petshop",
    aspectRatio: "16:9",
    prompt: `[PHOTOREALISM 8K] Modern premium Brazilian pet shop interior. Golden hour lighting through floor-to-ceiling windows. Sleek white marble reception desk. Young Brazilian female staff in teal uniform with warm smile. Beautiful golden retriever sitting calmly. Premium pet products on wooden shelves. Plants adding greenery. Shot with Sony A7R V, 35mm f/1.4. Magazine editorial quality. NO text, NO logos, NO watermarks.`,
  },
  {
    filename: "system-dashboard.jpg",
    path: "src/assets/system-dashboard.jpg",
    key: "system-dashboard",
    aspectRatio: "16:9",
    prompt: `[PHOTOREALISM 8K] Young Brazilian female business owner in home office analyzing pet shop dashboard on ultrawide curved monitor. Clean minimalist desk with MacBook, coffee cup, succulent plant. Soft morning light through sheer curtains. Casual-professional attire. Confident satisfied expression. Shot with Canon EOS R5, 35mm f/1.4. Lifestyle editorial style. NO readable text on screens, NO logos, NO watermarks.`,
  },
  {
    filename: "happy-clients.jpg",
    path: "src/assets/happy-clients.jpg",
    key: "happy-clients",
    aspectRatio: "16:9",
    prompt: `[PHOTOREALISM 8K] Happy Brazilian family at premium pet shop. Mother, father, daughter (8 years) playing with fluffy white Samoyed dog. Genuine expressions of joy. Modern interior with white walls, natural wood accents. Staff member smiling in background. Warm golden hour lighting. Shot with Nikon Z9, 50mm f/1.2. Lifestyle commercial photography. NO text, NO logos, NO watermarks.`,
  },
  {
    filename: "vet-care.jpg",
    path: "src/assets/vet-care.jpg",
    key: "vet-care",
    aspectRatio: "16:9",
    prompt: `[PHOTOREALISM 8K] Compassionate Brazilian female veterinarian in pristine white coat examining adorable orange tabby cat. Modern veterinary clinic with stainless steel table, medical equipment. Cat owner watching with relieved smile. Clean clinical environment with professional lighting. Shot with Sony A1, 85mm f/1.4. Healthcare editorial style. NO text, NO logos, NO watermarks.`,
  }
];

export async function generateImage(config: ImageConfig): Promise<string> {
  console.log(`🎨 Gerando imagem: ${config.filename}`);
  console.log(`📝 Prompt: ${config.prompt.substring(0, 100)}...`);

  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: { prompt: config.prompt }
  });

  if (error) {
    console.error(`❌ Erro ao gerar ${config.filename}:`, error);
    throw error;
  }

  if (!data?.imageUrl) {
    throw new Error(`Nenhuma imagem retornada para ${config.filename}`);
  }

  console.log(`✅ Imagem gerada: ${config.filename}`);
  return data.imageUrl;
}
