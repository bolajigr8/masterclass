/**
 * BACKEND ONLY — this file must never be imported from any client component.
 * All pricing is determined here. The frontend never sends or receives amounts.
 */

export const PRODUCT_TYPES = {
  SINGLE_MASTERCLASS: 'Single Masterclass',
  FIRESIDE_CHAT_SERIES: 'Fireside Chat Series',
  DEVELOPER_BOOTCAMP: 'Developer Bootcamp',
  ONE_ON_ONE_JAAS_CONSULTING: '1-on-1 JaaS Consulting',
} as const

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]

// Prices in Naira (NGN)
const PRICING_MAP: Record<ProductType, number> = {
  [PRODUCT_TYPES.SINGLE_MASTERCLASS]: 250_000,
  [PRODUCT_TYPES.FIRESIDE_CHAT_SERIES]: 95_000,
  [PRODUCT_TYPES.DEVELOPER_BOOTCAMP]: 450_000,
  [PRODUCT_TYPES.ONE_ON_ONE_JAAS_CONSULTING]: 180_000,
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

export function isValidProductType(
  productType: string,
): productType is ProductType {
  return (Object.values(PRODUCT_TYPES) as string[]).includes(productType)
}

export function getAllProductTypes(): ProductType[] {
  return Object.values(PRODUCT_TYPES)
}
