/**
 * Centralized Cakto Payment Gateway Configuration
 * All checkout URLs and plan details managed in one place
 */

export const CAKTO_CHECKOUT_URLS = {
  pet_gold: 'https://pay.cakto.com.br/f72gob9_634441',
  pet_platinum: 'https://pay.cakto.com.br/qym84js_634453',
  pet_platinum_anual: 'https://pay.cakto.com.br/3997ify_634474',
} as const;

export type CaktoPlanId = keyof typeof CAKTO_CHECKOUT_URLS;

export const PLAN_DETAILS = {
  pet_gold: {
    id: 'pet_gold',
    name: 'Pet Gold',
    price: 79.90,
    period: 'mês',
    checkoutUrl: CAKTO_CHECKOUT_URLS.pet_gold,
  },
  pet_platinum: {
    id: 'pet_platinum',
    name: 'Pet Platinum',
    price: 149.90,
    period: 'mês',
    checkoutUrl: CAKTO_CHECKOUT_URLS.pet_platinum,
  },
  pet_platinum_anual: {
    id: 'pet_platinum_anual',
    name: 'Pet Platinum Anual',
    price: 1348.50,
    period: 'ano',
    checkoutUrl: CAKTO_CHECKOUT_URLS.pet_platinum_anual,
  },
} as const;

/**
 * Validates if a plan ID has a valid checkout URL
 */
export const isCheckoutAvailable = (planId: string): boolean => {
  return planId in CAKTO_CHECKOUT_URLS && 
    CAKTO_CHECKOUT_URLS[planId as CaktoPlanId]?.length > 0;
};

/**
 * Opens Cakto checkout in a new tab
 * @param planId - The plan identifier (pet_gold, pet_platinum, pet_platinum_anual)
 * @returns boolean - true if successful, false if invalid plan
 */
export const openCaktoCheckout = (planId: CaktoPlanId): boolean => {
  const url = CAKTO_CHECKOUT_URLS[planId];
  
  if (!url) {
    console.error(`[Payment] Invalid plan ID: ${planId}`);
    return false;
  }
  
  console.log(`[Payment] Opening checkout for plan: ${planId}`);
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};

/**
 * Gets the checkout URL for a plan without opening
 */
export const getCheckoutUrl = (planId: string): string | null => {
  if (!isCheckoutAvailable(planId)) {
    return null;
  }
  return CAKTO_CHECKOUT_URLS[planId as CaktoPlanId];
};
