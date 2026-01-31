import { z } from "zod";

const envSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z.string().min(1, "SHOPIFY_STORE_DOMAIN is required"),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z
    .string()
    .min(1, "SHOPIFY_ADMIN_ACCESS_TOKEN is required"),
  SHOPIFY_API_VERSION: z.string().default("2026-01"),
  SHOPIFY_PRODUCT_ID: z.string().min(1, "SHOPIFY_PRODUCT_ID is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

const env = envSchema.parse(process.env);

export default env;
