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
    prompt: `Photorealistic 8K ultra-detailed hero image, 16:9 aspect ratio. Modern premium pet shop interior 
    with Brazilian aesthetic and contemporary design. Natural warm golden hour lighting streaming through 
    floor-to-ceiling windows. Clean minimalist reception desk with white marble surface and modern computer.
    Colorful premium pet accessories beautifully organized on wooden shelves. Professional grooming station 
    visible in background with chrome fixtures. Friendly young Brazilian female staff member with warm smile 
    wearing teal uniform. Beautiful healthy golden retriever sitting calmly at reception, looking at camera.
    Plants adding greenery. Shot with Sony A7R IV, 35mm f/1.4 lens, professional lighting setup.
    Magazine-quality commercial photography, editorial style. NO text, NO logos, NO watermarks, 
    NO artificial elements. Authentic natural scene only.`,
  },
  {
    filename: "system-dashboard.jpg",
    path: "src/assets/system-dashboard.jpg",
    aspectRatio: "16:9",
    prompt: `Hyperrealistic 8K product photography mockup, 16:9 aspect ratio. MacBook Pro 16-inch on 
    clean modern wooden desk displaying a pet management SaaS dashboard interface. Screen shows: 
    clean minimalist UI with soft cyan and green gradient accents, calendar view with appointments,
    revenue charts with smooth curves, client list section. Dashboard aesthetic matches modern fintech apps.
    Professional home office setting: ceramic coffee cup, small succulent plant, leather notebook, 
    iPhone nearby. Soft natural window light creating gentle shadows. Slight bokeh on background.
    Shot with Canon 5D Mark IV, 50mm f/1.8 lens. Product photography style like Apple marketing.
    NO readable text on screen, aesthetic UI elements only. NO watermarks, NO logos.`,
  },
  {
    filename: "happy-clients.jpg",
    path: "src/assets/happy-clients.jpg",
    aspectRatio: "4:3",
    prompt: `Ultra-realistic 8K lifestyle photography, 4:3 aspect ratio. Happy Brazilian family at modern 
    pet shop reception area. Scene composition: Mother (30s), father (30s), and young daughter (8 years old) 
    with their adorable cream-colored labrador puppy. Professional female staff member in teal uniform 
    showing them pet care information on tablet. Modern bright pet shop interior with natural wood elements
    and green plants. Everyone with genuine warm smiles, natural candid poses, authentic interaction.
    Warm ambient lighting, shallow depth of field focusing on family. Shot with Canon 5D Mark IV, 
    85mm f/1.2 portrait lens. Lifestyle commercial photography like stock photography premium tier.
    Ultra detailed facial features, authentic emotions, natural skin tones. NO text, NO logos, 
    NO artificial poses.`,
  },
  {
    filename: "vet-care.jpg",
    path: "src/assets/vet-care.jpg",
    aspectRatio: "4:3",
    prompt: `Hyperrealistic 8K medical photography, 4:3 aspect ratio. Young female Brazilian veterinarian 
    (late 20s) gently examining an adorable beagle puppy on examination table. Vet wearing crisp white 
    coat with silver stethoscope, kind compassionate expression, carefully checking puppy's ear.
    Modern veterinary clinic examination room: stainless steel table, medical cabinets with subtle blur,
    professional medical equipment visible but not overwhelming. Puppy calm and trusting, looking at vet.
    Clean bright environment with professional studio-quality soft lighting. Focus on care and compassion.
    Shot with Sony A7R IV, 50mm f/1.4 macro lens. Editorial healthcare photography quality.
    Ultra detailed textures (fur, fabric, medical equipment). NO text, NO logos, NO watermarks.
    Professional medical setting with warm human connection.`,
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
