import { GraphqlQueryError } from '@shopify/shopify-api';
import { createAdminClient } from '@/lib/shopify/client';
import { CartItem } from '@/lib/cart/types';

const DRAFT_ORDER_CREATE = `#graphql
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        invoiceUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a Shopify Draft Order from cart items
 *
 * @param items - Array of cart items with pricing and dimensions
 * @returns Object with invoiceUrl for Shopify checkout redirect
 * @throws Error if items empty, API call fails, or userErrors present
 */
export async function createDraftOrder(items: CartItem[]): Promise<{ invoiceUrl: string }> {
  // Validate non-empty cart
  if (!items || items.length === 0) {
    throw new Error('Cart is empty');
  }

  const client = createAdminClient();

  try {
    const response = await client.request(DRAFT_ORDER_CREATE, {
      variables: {
        input: {
          lineItems: items.map(item => ({
            // Include dimensions in title for clear order display
            title: `${item.productName} - ${item.options.width}cm x ${item.options.height}cm`,
            // Locked custom pricing (not variant-based)
            originalUnitPriceWithCurrency: {
              amount: (item.priceInCents / 100).toFixed(2),
              currencyCode: "EUR"
            },
            quantity: item.quantity,
            // Store dimensions as custom attributes for fulfillment
            customAttributes: [
              { key: "width", value: item.options.width.toString() },
              { key: "height", value: item.options.height.toString() }
            ]
          }))
        }
      },
      retries: 2
    });

    // Check for validation errors from Shopify mutation
    const userErrors = response.data?.draftOrderCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      const errorMessages = userErrors.map((e: { field?: string[]; message: string }) => e.message).join(', ');
      throw new Error(`Shopify validation error: ${errorMessages}`);
    }

    // Verify invoiceUrl exists in response
    const invoiceUrl = response.data?.draftOrderCreate?.draftOrder?.invoiceUrl;
    if (!invoiceUrl) {
      throw new Error('No invoice URL returned from Shopify');
    }

    return { invoiceUrl };

  } catch (error) {
    // Handle GraphQL-level errors (network, auth, rate limit)
    if (error instanceof GraphqlQueryError) {
      console.error('GraphQL Error:', error.body?.errors);
      throw new Error('Shopify API error');
    }
    // Re-throw other errors (validation, missing invoiceUrl)
    throw error;
  }
}
