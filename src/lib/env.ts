import { z } from "zod";

export type ShopifyProductMap = Record<string, { productId: string; variantId: string }>;

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
        })
      )
    ),
});

export type Env = z.infer<typeof envSchema>;

const env = envSchema.parse(process.env);

export default env;
