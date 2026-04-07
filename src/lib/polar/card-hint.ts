/**
 * Polar / Stripe expose brand + last4 only (no full PAN). We show a short hint:
 * first digit from card brand (Visa→4, etc.) + masked middle + last4.
 * Never show expiry or CVC (not in API).
 */
export function brandHeuristicFirstDigit(brand: string): string {
  const b = brand.toLowerCase()
  if (b.includes("visa")) return "4"
  if (b.includes("master")) return "5"
  if (b.includes("amex") || b.includes("american")) return "3"
  if (b.includes("discover")) return "6"
  if (b.includes("unionpay")) return "6"
  if (b.includes("diners")) return "3"
  if (b.includes("jcb")) return "3"
  return "•"
}

export function formatCardDisplay(brand: string, last4: string): string {
  const first = brandHeuristicFirstDigit(brand)
  return `${first} ···· ···· ${last4}`
}
