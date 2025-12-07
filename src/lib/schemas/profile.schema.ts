import { z } from "zod";

// Schema de validação para o perfil do Pet Shop
export const petShopProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido (formato: 00.000.000/0000-00)")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido (formato: (00) 00000-0000)")
    .optional()
    .or(z.literal("")),
  
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  
  address: z
    .string()
    .min(5, "Endereço deve ter no mínimo 5 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  
  city: z
    .string()
    .min(2, "Cidade deve ter no mínimo 2 caracteres")
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  state: z
    .string()
    .length(2, "Use a sigla do estado (ex: SP)")
    .regex(/^[A-Z]{2}$/, "Use apenas letras maiúsculas")
    .optional()
    .or(z.literal("")),
  
  hours: z
    .string()
    .max(200, "Horário deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  
  description: z
    .string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  logo_url: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
});

export type PetShopProfileFormData = z.infer<typeof petShopProfileSchema>;

// Função auxiliar para formatar CNPJ
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

// Função auxiliar para formatar telefone
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};
