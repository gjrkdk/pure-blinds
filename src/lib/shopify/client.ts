import "@shopify/shopify-api/adapters/web-api";
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";
import env from "@/lib/env";

const shopify = shopifyApi({
  apiKey: "not-needed-for-custom-app",
  apiSecretKey: "not-needed-for-custom-app",
  scopes: [],
  hostName: env.SHOPIFY_STORE_DOMAIN,
  apiVersion: env.SHOPIFY_API_VERSION as ApiVersion,
  isEmbeddedApp: false,
  isCustomStoreApp: true,
  adminApiAccessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN,
});

export function createAdminClient() {
  const session = new Session({
    id: "offline-session",
    shop: env.SHOPIFY_STORE_DOMAIN,
    state: "state",
    isOnline: false,
    accessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  });

  return new shopify.clients.Graphql({ session });
}
