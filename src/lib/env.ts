import { z } from "zod";

export type ShopifyProductMap = Record<
  string,
  { productId: string; variantId: string }
>;

const envSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z.string().min(1, "SHOPIFY_STORE_DOMAIN is required"),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z
    .string()
    .min(1, "SHOPIFY_ADMIN_ACCESS_TOKEN is required"),
  SHOPIFY_API_VERSION: z.string().default("2026-01"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SHOPIFY_PRODUCT_MAP: z
    .string()
    .min(1, "SHOPIFY_PRODUCT_MAP is required")
    .transform((val) => JSON.parse(val))
    .pipe(
      z.record(
        z.string(),
        z.object({
          productId: z.string().startsWith("gid://shopify/Product/"),
          variantId: z.string().startsWith("gid://shopify/ProductVariant/"),
        }),
      ),
    ),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  CONTACT_EMAIL: z.string().email().default("robin@raamdeluxe.nl"),
});

export type Env = z.infer<typeof envSchema>;

// Lazy singleton — env is validated on first access at runtime, not at
// module-evaluation / build time.  This prevents CI builds from failing
// when server-only secrets (e.g. RESEND_API_KEY) are unavailable.
let _env: z.infer<typeof envSchema> | null = null;

function getEnv(): z.infer<typeof envSchema> {
  if (typeof window !== "undefined") return {} as z.infer<typeof envSchema>;
  if (!_env) _env = envSchema.parse(process.env);
  return _env;
}

const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getEnv(), prop, receiver);
  },
});

export default env;
