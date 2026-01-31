'use client';

interface QuantityInputProps {
  quantity: number;
  onUpdate: (quantity: number) => void;
}

export function QuantityInput({ quantity, onUpdate }: QuantityInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') return; // Allow empty during typing

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;

    // Enforce min 1, max 999
    const clamped = Math.max(1, Math.min(999, parsed));
    onUpdate(clamped);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Reset to current quantity if input is empty or invalid
    if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
      e.target.value = quantity.toString();
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdate(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < 999) {
      onUpdate(quantity + 1);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quantity}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label="Quantity"
        className="h-8 w-12 rounded border border-gray-300 text-center text-sm"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= 999}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
