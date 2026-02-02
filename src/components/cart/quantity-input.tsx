'use client';

interface QuantityInputProps {
  quantity: number;
  onUpdate: (quantity: number) => void;
}

export function QuantityInput({ quantity, onUpdate }: QuantityInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') return;

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;

    const clamped = Math.max(1, Math.min(999, parsed));
    onUpdate(clamped);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
    <div className="inline-flex items-center border border-border">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
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
        className="h-8 w-10 border-x border-border bg-transparent text-center text-sm text-foreground"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= 999}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
