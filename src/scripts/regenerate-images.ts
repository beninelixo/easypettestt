/**
 * Script para regenerar imagens do sistema usando IA
 * 
 * Este script define as configurações de prompts para gerar 4 imagens principais:
 * 1. Hero - Imagem principal do site
 * 2. Dashboard - Tela do sistema
 * 3. Clientes felizes - Pet shop com clientes satisfeitos
 * 4. Cuidado veterinário - Profissional cuidando de um pet
 * 
 * Use a página /admin/regenerate-images para executar a geração
 */

import { supabase } from "@/integrations/supabase/client";

export interface ImageConfig {
  filename: string;
  path: string;
  prompt: string;
  aspectRatio: string;
}

export const images: ImageConfig[] = [
  {
    filename: "hero-petshop.jpg",
    path: "src/assets/hero-petshop.jpg",
    aspectRatio: "16:9",
    prompt: `Ultra high resolution 16:9 hero image. Professional modern pet shop interior with warm lighting. 
    Showcase: Clean reception desk with modern computer, colorful pet accessories on organized shelves, 
    grooming station visible in background. Friendly staff member smiling at camera. 
    Beautiful golden retriever sitting calmly at reception. Bright natural lighting through large windows. 
    Professional photography, high-end commercial quality, welcoming atmosphere. 
    Colors: warm tones, clean white surfaces, pops of blue and green from pet products. 
    Ultra detailed, 8K quality, magazine-worthy composition.`,
  },
  {
    filename: "system-dashboard.jpg",
    path: "src/assets/system-dashboard.jpg",
    aspectRatio: "16:9",
    prompt: `Ultra high resolution 16:9 image. Modern laptop displaying a professional pet management dashboard. 
    Screen shows: clean UI with calendar view, appointment cards, colorful charts with pet statistics, 
    sidebar with navigation menu. Professional workspace setting with coffee cup, notepad, and phone nearby. 
    Soft natural lighting from window. Dashboard has modern design with blue/purple gradient accents. 
    Visible elements: today's schedule, revenue graphs, client list with pet photos. 
    Ultra realistic, professional product photography, 8K quality, sharp details, bokeh background.`,
  },
  {
    filename: "happy-clients.jpg",
    path: "src/assets/happy-clients.jpg",
    aspectRatio: "4:3",
    prompt: `Ultra high resolution 4:3 image. Happy diverse family at modern pet shop reception. 
    Scene: Smiling mother, father, and young daughter with their happy labrador puppy. 
    Professional staff member showing them something on tablet. Bright, clean, modern pet shop interior. 
    Everyone genuine smiling, natural poses. Warm and welcoming atmosphere. 
    Professional commercial photography, natural lighting, shallow depth of field focusing on family. 
    Colors: warm and inviting, professional grade image. Ultra detailed faces, 8K quality, 
    authentic emotions, lifestyle photography style.`,
  },
  {
    filename: "vet-care.jpg",
    path: "src/assets/vet-care.jpg",
    aspectRatio: "4:3",
    prompt: `Ultra high resolution 4:3 image. Professional veterinarian gently examining cute beagle puppy. 
    Scene: Vet in clean white coat with stethoscope, kind smile, carefully checking puppy. 
    Modern veterinary clinic examination room with medical equipment visible but not overwhelming. 
    Puppy looking calm and trusting. Clean, bright environment with soft professional lighting. 
    Focus on care and compassion. Medical professionalism meets warmth. 
    High-end commercial photography, 8K quality, shallow depth of field, detailed textures, 
    professional medical setting, magazine-worthy composition.`,
  },
];

export async function generateImage(config: ImageConfig): Promise<string> {
  console.log(`🎨 Gerando imagem: ${config.filename}`);
  console.log(`📝 Aspect ratio: ${config.aspectRatio}`);
  console.log(`💭 Prompt: ${config.prompt.substring(0, 100)}...`);

  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: { prompt: config.prompt },
  });

  if (error) {
    throw new Error(`Erro ao gerar imagem: ${error.message}`);
  }

  if (!data?.imageUrl) {
    throw new Error("Nenhuma URL de imagem retornada");
  }

  console.log(`✅ Imagem gerada com sucesso: ${config.filename}`);
  return data.imageUrl;
}
