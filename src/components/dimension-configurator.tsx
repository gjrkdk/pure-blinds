"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/pricing/calculator";

interface DimensionConfiguratorProps {
  productId: string;
  productName: string;
}

interface FieldErrors {
  width?: string;
  height?: string;
}

export default function DimensionConfigurator({
  productId,
  productName,
}: DimensionConfiguratorProps) {
  const router = useRouter();

  // State management
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [debouncedWidth] = useDebounce(width, 400);
  const [debouncedHeight] = useDebounce(height, 400);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [addedToCart, setAddedToCart] = useState(false);

  // Cart store
  const addItem = useCartStore((state) => state.addItem);
  const addSample = useCartStore((state) => state.addSample);
  const hasSample = useCartStore((state) => state.hasSample(productId));

  // Client-side validation (immediate, no debounce)
  const validateField = (
    name: "width" | "height",
    value: string,
  ): string | undefined => {
    if (value === "") return undefined;

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return "Voer een geheel getal in";
    if (numValue < 10) return "Minimaal 10 cm";
    if (numValue > 200) return "Maximaal 200 cm";

    return undefined;
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWidth(value);
    setAddedToCart(false);

    const validationError = validateField("width", value);
    setFieldErrors((prev) => ({
      ...prev,
      width: validationError,
    }));
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeight(value);
    setAddedToCart(false);

    const validationError = validateField("height", value);
    setFieldErrors((prev) => ({
      ...prev,
      height: validationError,
    }));
  };

  // Debounced API call
  useEffect(() => {
    let ignore = false;

    const fetchPrice = async () => {
      // Only fetch if both values are valid
      const widthNum = parseInt(debouncedWidth, 10);
      const heightNum = parseInt(debouncedHeight, 10);

      if (
        isNaN(widthNum) ||
        isNaN(heightNum) ||
        widthNum < 10 ||
        widthNum > 200 ||
        heightNum < 10 ||
        heightNum > 200
      ) {
        // Invalid values - clear price but don't show error
        if (!ignore) {
          setPrice(null);
          setError(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/pricing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            width: widthNum,
            height: heightNum,
          }),
        });

        const data = await response.json();

        if (!ignore) {
          if (response.ok) {
            setPrice(data.priceInCents);
            setError(null);
            setFieldErrors({});
          } else if (response.status === 400) {
            // Parse Zod field errors from details array
            if (data.details && Array.isArray(data.details)) {
              const errors: FieldErrors = {};
              data.details.forEach(
                (detail: { path: string[]; message: string }) => {
                  const field = detail.path[0] as "width" | "height";
                  if (field === "width" || field === "height") {
                    errors[field] = detail.message;
                  }
                },
              );
              setFieldErrors(errors);
            }
            setPrice(null);
          } else if (response.status === 404) {
            setError("Productprijs niet beschikbaar");
            setPrice(null);
          } else {
            setError("Kan prijs niet berekenen");
            setPrice(null);
          }
        }
      } catch {
        if (!ignore) {
          setError("Kan prijs niet berekenen");
          setPrice(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPrice();

    return () => {
      ignore = true;
    };
  }, [debouncedWidth, debouncedHeight, productId]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (price === null || loading || Object.keys(fieldErrors).length > 0)
      return;

    addItem({
      productId,
      productName,
      options: {
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      },
      priceInCents: price,
    });

    setAddedToCart(true);
  };

  // Reset form to initial state (called by "Nog een toevoegen")
  const handleResetForm = () => {
    setWidth("");
    setHeight("");
    setPrice(null);
    setError(null);
    setFieldErrors({});
    setAddedToCart(false);
  };

  // Handle add sample to cart
  const handleAddSample = () => {
    addSample({ productId, productName });
  };

  // Determine if Add to Cart button should be enabled
  const canAddToCart =
    price !== null &&
    !loading &&
    Object.keys(fieldErrors).length === 0 &&
    !addedToCart;

  return (
    <div className="space-y-6">
      {/* Input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Width input */}
        <div>
          <label
            htmlFor="width"
            className="block text-sm font-medium text-foreground mb-2 rounded-lg"
          >
            Breedte (cm)
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            id="width"
            value={width}
            onChange={handleWidthChange}
            aria-invalid={!!fieldErrors.width}
            aria-describedby={fieldErrors.width ? "width-error" : undefined}
            className={`w-full px-4 py-3 border text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors bg-white rounded-lg ${
              fieldErrors.width ? "border-red-500" : "border-border"
            }`}
            placeholder="bijv. 100"
          />
          {fieldErrors.width && (
            <p id="width-error" className="text-red-500 text-sm mt-1">
              {fieldErrors.width}
            </p>
          )}
        </div>

        {/* Height input */}
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Hoogte (cm)
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            id="height"
            value={height}
            onChange={handleHeightChange}
            aria-invalid={!!fieldErrors.height}
            aria-describedby={fieldErrors.height ? "height-error" : undefined}
            className={`w-full px-4 py-3 border text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors bg-white rounded-lg ${
              fieldErrors.height ? "border-red-500" : "border-border"
            }`}
            placeholder="bijv. 150"
          />
          {fieldErrors.height && (
            <p id="height-error" className="text-red-500 text-sm mt-1">
              {fieldErrors.height}
            </p>
          )}
        </div>
      </div>

      {/* Price display */}
      <div className="mt-6">
        {loading ? (
          <p className="text-2xl font-semibold text-muted">Berekenen...</p>
        ) : error ? (
          <p className="text-2xl font-semibold text-red-500">{error}</p>
        ) : price !== null ? (
          <div>
            <p className="text-3xl font-semibold text-foreground">
              {formatPrice(price)}<span className="text-base font-normal text-muted ml-1">incl. 21% BTW</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Voer afmetingen in om de prijs te zien
          </p>
        )}
      </div>

      {/* Add to Cart button area */}
      <div className="mt-6 space-y-3">
        {addedToCart ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/winkelwagen")}
              className="w-full bg-accent text-accent-foreground py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-80 rounded-lg"
            >
              Naar winkelwagen &rarr;
            </button>
            <button
              onClick={handleResetForm}
              className="w-full bg-neutral-100 text-foreground py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-80 rounded-lg"
            >
              Nog een toevoegen
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="w-full bg-accent text-accent-foreground py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed border-border rounded-lg"
          >
            Toevoegen
          </button>
        )}

        {/* Sample button */}
        {hasSample ? (
          <button
            onClick={() => router.push("/winkelwagen")}
            className="w-full bg-accent text-accent-foreground py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-80 rounded-lg"
          >
            Bekijk winkelwagen &rarr;
          </button>
        ) : (
          <button
            onClick={handleAddSample}
            className="w-full border border-border bg-white text-foreground py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-80 rounded-lg"
          >
            Kleurstaal bestellen
          </button>
        )}
      </div>
    </div>
  );
}
