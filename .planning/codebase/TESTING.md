# Testing Patterns

**Analysis Date:** 2026-02-01

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vitest.config.ts`
- Test environment: jsdom (browser environment emulation)
- Globals enabled: `globals: true` allows using `describe`, `it`, `expect` without imports

**Assertion Library:**
- Vitest's built-in expect API (compatible with Jest assertions)

**React Testing Library:**
- @testing-library/react 16.3.2 for component testing
- @testing-library/dom 10.4.1 for DOM queries
- @testing-library/jest-dom 6.9.1 for DOM matchers

**Run Commands:**
```bash
npm run test              # Run all tests once
npm run test -- --watch  # Watch mode (if configured)
npm run test -- --coverage  # Coverage report (if configured)
```

## Test File Organization

**Location:**
- Co-located with implementation files (same directory)
- Pattern: `ComponentName.test.tsx` or `utility.test.ts`

**Naming:**
- Test files use `.test.tsx` or `.test.ts` extension
- Mirror the name of the file being tested

**Example:**
- Component: `src/components/cart/cart-summary.tsx`
- Test: `src/components/cart/cart-summary.test.tsx`

**Current Test Coverage:**
Only one test file found in codebase:
- `src/components/cart/cart-summary.test.tsx` (1.8KB) - Tests CartSummary component checkout flow

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  beforeEach(() => {
    // Test setup/cleanup
  });

  it('describes what should happen', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**Patterns from `src/components/cart/cart-summary.test.tsx`:**

**Setup/Teardown:**
```typescript
beforeEach(() => {
  // Reset cart store before each test
  useCartStore.setState({ items: [] });

  // Mock fetch to prevent real API calls
  global.fetch = vi.fn();

  // Mock window.location.href to prevent actual navigation
  delete (window as any).location;
  (window as any).location = { href: '' };
});
```

**AAA Pattern (Arrange, Act, Assert):**
```typescript
it('clears cart after successful checkout redirect', async () => {
  // Arrange: Mock successful checkout response
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ invoiceUrl: 'https://shop.myshopify.com/checkout/123' }),
  });

  // Pre-populate cart with test data
  useCartStore.getState().addItem({
    productId: 'test-product',
    productName: 'Test Product',
    options: { width: 100, height: 100 },
    priceInCents: 1000,
  });

  // Verify initial state
  expect(useCartStore.getState().items).toHaveLength(1);

  // Act: Render component and trigger action
  render(<CartSummary />);
  const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
  fireEvent.click(checkoutButton);

  // Assert: Wait for async operation and verify final state
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({ method: 'POST' })
    );
  });

  // Assert cart is cleared after successful checkout
  expect(useCartStore.getState().items).toHaveLength(0);
});
```

## Mocking

**Framework:** Vitest's `vi` module

**Patterns:**

**Mocking Global Functions:**
```typescript
// Mock fetch API
global.fetch = vi.fn();

// Mock browser API (window.location)
delete (window as any).location;
(window as any).location = { href: '' };
```

**Mocking Responses:**
```typescript
(global.fetch as any).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ invoiceUrl: 'https://shop.myshopify.com/checkout/123' }),
});
```

**What to Mock:**
- External API calls (fetch requests)
- Browser APIs that can't run in jsdom (window.location.href for navigation)
- Third-party libraries that have side effects
- Zustand store state for isolated component testing

**What NOT to Mock:**
- Component render logic
- User interactions (use `fireEvent` or user-event instead)
- Business logic functions (test them directly)
- React hooks from React library itself

## Fixtures and Factories

**Test Data:**
No dedicated fixture files found. Test data created inline within test cases.

**Example from `cart-summary.test.tsx`:**
```typescript
// Pre-populate cart with one item
useCartStore.getState().addItem({
  productId: 'test-product',
  productName: 'Test Product',
  options: { width: 100, height: 100 },
  priceInCents: 1000,
});
```

**Location:**
Test utilities would go in `src/lib/testing/` directory (not yet created but recommended)

## Coverage

**Requirements:** No coverage target enforced

**View Coverage:**
```bash
npm run test -- --coverage
```

**Gap:** Coverage configuration likely needs to be added to vitest.config.ts if coverage reports are desired.

## Test Types

**Unit Tests:**
- Scope: Individual functions and components
- Approach: Test with mocked dependencies
- Examples: Pricing calculator, cart utilities
- Status: Not yet implemented in codebase (opportunity for expansion)

**Integration Tests:**
- Scope: Component + store + API interaction
- Approach: Render component, interact with UI, verify store updates and API calls
- Examples: `CartSummary.test.tsx` tests checkout flow end-to-end
- Pattern: Pre-populate state, render component, trigger action, wait for async, assert results

**E2E Tests:**
- Framework: Not used
- Opportunity: Could use Playwright or Cypress for full application testing

## Common Patterns

**Async Testing:**
```typescript
it('clears cart after successful checkout redirect', async () => {
  // ... setup and act ...

  // Wait for async operations to complete
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({ method: 'POST' })
    );
  });

  // Assert state after async operation
  expect(useCartStore.getState().items).toHaveLength(0);
});
```

**Component Rendering:**
```typescript
import { render, screen } from '@testing-library/react';

// Render component
render(<CartSummary />);

// Query by semantic role
const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });

// Verify element properties
expect(checkoutButton).not.toBeDisabled();
```

**User Interactions:**
```typescript
import { fireEvent } from '@testing-library/react';

// Simulate click event
fireEvent.click(checkoutButton);

// Test will catch resulting side effects (fetch calls, store updates)
```

**Store Testing:**
```typescript
// Direct store access for setup
useCartStore.setState({ items: [] });

// Direct store access for verification
expect(useCartStore.getState().items).toHaveLength(0);
```

## Vitest Configuration

**Config File:** `vitest.config.ts`

**Key Settings:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Enabled Features:**
- React plugin for JSX transformation
- jsdom environment for browser API simulation
- Global test functions (describe, it, expect) without imports
- Path alias resolution matching tsconfig.json

## Testing Best Practices Observed

1. **Reset state between tests** - Each test gets clean Zustand store state
2. **Mock external dependencies** - Fetch API mocked to prevent real network calls
3. **Query by semantic role** - Using `screen.getByRole()` instead of id/class selectors
4. **Use waitFor for async** - Properly handling asynchronous state updates
5. **Type annotations in tests** - Even test code includes TypeScript types
6. **Comments describe test intent** - Clear explanations of what each test verifies

## Testing Gaps and Opportunities

**Unit Test Coverage:**
- Pricing calculator functions (`calculatePrice`, `normalizeDimension`) - not tested
- Cart store methods (`addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotalPrice`, `getItemCount`) - not tested
- Utility functions (`generateCartItemId`, `generateOptionsSignature`) - not tested
- Validators (Zod schemas) - not tested

**Component Testing:**
- Individual cart components (`cart-icon`, `cart-item`, `quantity-input`) - not tested
- `DimensionConfigurator` component - not tested
- `RemoveDialog` component - not tested

**API Route Testing:**
- `/api/pricing` route - not tested
- `/api/health` route - not tested
- `/api/checkout` route - not tested (only components that call it are tested)

**Recommendation:** Expand test coverage to include unit tests for core business logic (pricing, cart operations) and component tests for UI interactions.

---

*Testing analysis: 2026-02-01*
