'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { useCartStore } from '@/lib/cart/store'

interface DimensionConfiguratorProps {
  productId: string
  productName: string
}

interface FieldErrors {
  width?: string
  height?: string
}

export default function DimensionConfigurator({ productId, productName }: DimensionConfiguratorProps) {
  // State management
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [debouncedWidth] = useDebounce(width, 400)
  const [debouncedHeight] = useDebounce(height, 400)
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [addedFeedback, setAddedFeedback] = useState(false)

  // Cart store
  const addItem = useCartStore((state) => state.addItem)

  // Client-side validation (immediate, no debounce)
  const validateField = (name: 'width' | 'height', value: string): string | undefined => {
    if (value === '') return undefined

    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return 'Enter a whole number'
    if (numValue < 10) return 'Minimum 10cm'
    if (numValue > 200) return 'Maximum 200cm'

    return undefined
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWidth(value)

    const validationError = validateField('width', value)
    setFieldErrors(prev => ({
      ...prev,
      width: validationError
    }))
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHeight(value)

    const validationError = validateField('height', value)
    setFieldErrors(prev => ({
      ...prev,
      height: validationError
    }))
  }

  // Debounced API call
  useEffect(() => {
    let ignore = false

    const fetchPrice = async () => {
      // Only fetch if both values are valid
      const widthNum = parseInt(debouncedWidth, 10)
      const heightNum = parseInt(debouncedHeight, 10)

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
          setPrice(null)
          setError(null)
        }
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            width: widthNum,
            height: heightNum
          })
        })

        const data = await response.json()

        if (!ignore) {
          if (response.ok) {
            setPrice(data.priceInCents)
            setError(null)
            setFieldErrors({})
          } else if (response.status === 400) {
            // Parse Zod field errors from details array
            if (data.details && Array.isArray(data.details)) {
              const errors: FieldErrors = {}
              data.details.forEach((detail: { path: string[]; message: string }) => {
                const field = detail.path[0] as 'width' | 'height'
                if (field === 'width' || field === 'height') {
                  errors[field] = detail.message
                }
              })
              setFieldErrors(errors)
            }
            setPrice(null)
          } else {
            setError('Unable to calculate price')
            setPrice(null)
          }
        }
      } catch (err) {
        if (!ignore) {
          setError('Unable to calculate price')
          setPrice(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchPrice()

    return () => {
      ignore = true
    }
  }, [debouncedWidth, debouncedHeight])

  // Format price for display
  const formatPrice = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (price === null || loading || Object.keys(fieldErrors).length > 0) return

    addItem({
      productId,
      productName,
      options: {
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      },
      priceInCents: price,
    })

    // Show feedback for 2 seconds
    setAddedFeedback(true)
    setTimeout(() => {
      setAddedFeedback(false)
    }, 2000)
  }

  // Determine if Add to Cart button should be enabled
  const canAddToCart = price !== null && !loading && Object.keys(fieldErrors).length === 0 && !addedFeedback

  return (
    <div className="space-y-6">
      {/* Input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Width input */}
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
            Width (cm)
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            id="width"
            value={width}
            onChange={handleWidthChange}
            aria-invalid={!!fieldErrors.width}
            aria-describedby={fieldErrors.width ? 'width-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.width ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 100"
          />
          {fieldErrors.width && (
            <p id="width-error" className="text-red-600 text-sm mt-1">
              {fieldErrors.width}
            </p>
          )}
        </div>

        {/* Height input */}
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            id="height"
            value={height}
            onChange={handleHeightChange}
            aria-invalid={!!fieldErrors.height}
            aria-describedby={fieldErrors.height ? 'height-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.height ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 150"
          />
          {fieldErrors.height && (
            <p id="height-error" className="text-red-600 text-sm mt-1">
              {fieldErrors.height}
            </p>
          )}
        </div>
      </div>

      {/* Price display */}
      <div className="mt-6">
        {loading ? (
          <p className="text-2xl font-semibold text-gray-600">Calculating...</p>
        ) : error ? (
          <p className="text-2xl font-semibold text-red-600">{error}</p>
        ) : price !== null ? (
          <div>
            <p className="text-sm text-gray-600 mb-1">Price</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(price)}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Enter dimensions to see price</p>
        )}
      </div>

      {/* Add to Cart button */}
      <div className="mt-6">
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addedFeedback ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
