/**
 * BACKEND ONLY — this file must never be imported from any client component.
 * All pricing is determined here. The frontend never sends or receives amounts.
 *
 * Product names here MUST exactly match the frontend plan names and
 * validations.ts DISPLAY_PRICES keys.
 */

export const PRODUCT_TYPES = {
  VIRTUAL_MASTERCLASS: 'Virtual Masterclass',
  SIGNATURE_LIVE_MASTERCLASS: 'Signature Live Masterclass',
  PRIVATE_JAAS_CONSULTING: 'Private JaaS Consulting',
} as const

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]

/** Prices in Naira (NGN) — single source of truth for all backend validation */
const PRICING_MAP: Record<ProductType, number> = {
  [PRODUCT_TYPES.VIRTUAL_MASTERCLASS]: 150_000, // ₦150,000 / $260
  [PRODUCT_TYPES.SIGNATURE_LIVE_MASTERCLASS]: 450_000, // ₦450,000 / $650
  [PRODUCT_TYPES.PRIVATE_JAAS_CONSULTING]: 350_000, // ₦350,000 / $500+
}

/**
 * Each product type has a fixed access tier — no separate selector needed.
 * The product itself determines how the user accesses the event.
 */
export const ACCESS_TIER_MAP: Record<
  ProductType,
  'virtual' | 'full' | 'consulting'
> = {
  [PRODUCT_TYPES.VIRTUAL_MASTERCLASS]: 'virtual',
  [PRODUCT_TYPES.SIGNATURE_LIVE_MASTERCLASS]: 'full',
  [PRODUCT_TYPES.PRIVATE_JAAS_CONSULTING]: 'consulting',
}

/**
 * Returns the Naira price for a given product type, or null if invalid.
 */
export function getPrice(productType: string): number | null {
  if (!isValidProductType(productType)) return null
  return PRICING_MAP[productType]
}

/**
 * Returns the Kobo price (Naira × 100) for Paystack, or null if invalid.
 */
export function getPriceInKobo(productType: string): number | null {
  const nairaPrice = getPrice(productType)
  return nairaPrice !== null ? nairaPrice * 100 : null
}

/**
 * Returns the access tier derived from the product type.
 */
export function getAccessTier(
  productType: string,
): 'virtual' | 'full' | 'consulting' | null {
  if (!isValidProductType(productType)) return null
  return ACCESS_TIER_MAP[productType]
}

export function isValidProductType(
  productType: string,
): productType is ProductType {
  return (Object.values(PRODUCT_TYPES) as string[]).includes(productType)
}

export function getAllProductTypes(): ProductType[] {
  return Object.values(PRODUCT_TYPES)
}
