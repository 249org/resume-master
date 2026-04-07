/**
 * Marketing copy for checkout cards (safe for client). Prices are indicative—Polar
 * checkout shows the real amount from your dashboard.
 */
export const POLAR_PLAN_DETAILS = [
  {
    slug: 'Pro',
    label: 'Pro',
    price: '$19',
    period: '/ month',
    description: 'Full power for an active job search.',
    popular: true,
    features: [
      'Unlimited resume projects',
      'Deeper ATS & keyword analysis',
      'AI review & rewrite suggestions',
      'Export to PDF',
      'Job description match reports',
    ],
  },
  {
    slug: 'Basic',
    label: 'Basic',
    price: '$9',
    period: '/ month',
    description: 'Essential tools to improve your resume.',
    popular: false,
    features: [
      'ATS-style resume scans',
      'Resume builder access',
      'Standard templates',
      'Limited exports per month',
    ],
  },
  {
    slug: 'Free',
    label: 'Free',
    price: '$0',
    period: '',
    description: 'Try core features at no cost.',
    popular: false,
    features: [
      'Basic ATS-style resume scan',
      '1 resume builder project',
      'Standard templates',
      'Limited exports per month',
    ],
  },
] as const

export type PolarCheckoutSlug = (typeof POLAR_PLAN_DETAILS)[number]['slug']

/** Polar product IDs are UUIDs; reject placeholders so checkout does not call the API with junk. */
const POLAR_PRODUCT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidPolarProductId(id: string): boolean {
  return POLAR_PRODUCT_ID_RE.test(id.trim())
}

/**
 * Products wired to Polar Checkout (Better Auth). **Only includes products whose
 * IDs are set in the environment** — copy IDs from Polar → Products in your
 * dashboard (Sandbox vs Production must match `POLAR_ENV`).
 *
 * Do not use placeholder UUIDs: Polar will return "Product does not exist."
 */
/**
 * Map a Polar product UUID to our plan label when the ID is listed in env.
 * Used to show plan names from customer state (which only includes `product_id`).
 */
export function resolvePolarProductLabelById(productId: string): string | null {
  const id = productId.trim().toLowerCase()
  const entries: { slug: PolarCheckoutSlug; envId: string | undefined }[] = [
    { slug: 'Pro', envId: process.env.POLAR_PRODUCT_PRO_ID?.trim().toLowerCase() },
    {
      slug: 'Basic',
      envId: process.env.POLAR_PRODUCT_BASIC_ID?.trim().toLowerCase(),
    },
    { slug: 'Free', envId: process.env.POLAR_PRODUCT_FREE_ID?.trim().toLowerCase() },
  ]
  for (const { slug, envId } of entries) {
    if (envId && envId === id) {
      const row = POLAR_PLAN_DETAILS.find((p) => p.slug === slug)
      return row?.label ?? slug
    }
  }
  return null
}

/** Checkout tier slug when `product_id` matches `POLAR_PRODUCT_*_ID` in env. */
export function resolvePolarProductSlugById(
  productId: string,
): PolarCheckoutSlug | null {
  const id = productId.trim().toLowerCase()
  const entries: { slug: PolarCheckoutSlug; envId: string | undefined }[] = [
    { slug: 'Pro', envId: process.env.POLAR_PRODUCT_PRO_ID?.trim().toLowerCase() },
    {
      slug: 'Basic',
      envId: process.env.POLAR_PRODUCT_BASIC_ID?.trim().toLowerCase(),
    },
    { slug: 'Free', envId: process.env.POLAR_PRODUCT_FREE_ID?.trim().toLowerCase() },
  ]
  for (const { slug, envId } of entries) {
    if (envId && envId === id) return slug
  }
  return null
}

export function getCheckoutProductsForAuth(): { productId: string; slug: string }[] {
  const pro = process.env.POLAR_PRODUCT_PRO_ID?.trim()
  const basic = process.env.POLAR_PRODUCT_BASIC_ID?.trim()
  const free = process.env.POLAR_PRODUCT_FREE_ID?.trim()

  const out: { productId: string; slug: string }[] = []
  const add = (id: string | undefined, slug: 'Pro' | 'Basic' | 'Free') => {
    if (!id) return
    if (!isValidPolarProductId(id)) {
      console.warn(
        `[polar] Ignoring POLAR_PRODUCT_${slug.toUpperCase()}_ID — not a valid UUID: ${id}`,
      )
      return
    }
    out.push({ productId: id, slug })
  }
  add(pro, 'Pro')
  add(basic, 'Basic')
  add(free, 'Free')
  return out
}
