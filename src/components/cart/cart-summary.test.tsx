import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CartSummary } from './cart-summary';
import { useCartStore } from '@/lib/cart/store';

describe('CartSummary', () => {
  beforeEach(() => {
    // Reset cart store before each test
    useCartStore.setState({ items: [] });

    // Mock fetch to prevent real API calls
    global.fetch = vi.fn();

    // Mock window.location.href to prevent actual navigation
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('clears cart after successful checkout redirect', async () => {
    // Mock successful checkout response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoiceUrl: 'https://shop.myshopify.com/checkout/123' }),
    });

    // Pre-populate cart with one item
    useCartStore.getState().addItem({
      productId: 'test-product',
      productName: 'Test Product',
      options: { width: 100, height: 100 },
      priceInCents: 1000,
    });

    // Verify cart has 1 item before checkout
    expect(useCartStore.getState().items).toHaveLength(1);

    // Render component
    render(<CartSummary />);

    // Click checkout button
    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutButton);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/checkout',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // Assert cart is cleared after successful checkout
    // This WILL FAIL in RED phase because clearCart() is not called in handleCheckout
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
