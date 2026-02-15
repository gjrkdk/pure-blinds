'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  image: string       // Main/primary product image
  images?: string[]   // Additional gallery images
  alt: string         // Alt text for images (product name)
}

export default function ProductImageGallery({
  image,
  images,
  alt,
}: ProductImageGalleryProps) {
  // Combine all images into a single array: main image is always first
  const allImages = [image, ...(images || [])]

  // Track the currently selected image index (default: 0)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Fallback: if image is falsy, render placeholder
  if (!image) {
    return (
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lifted">
        <span className="text-sm text-muted">Productafbeelding</span>
      </div>
    )
  }

  return (
    <div>
      {/* Main/hero image */}
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-white shadow-lifted">
        <Image
          src={allImages[selectedIndex]}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>

      {/* Thumbnail row - only show if there are 2+ total images */}
      {allImages.length >= 2 && (
        <div className="mt-3 flex gap-2">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-16 h-12 overflow-hidden rounded-lg bg-white transition-opacity ${
                index === selectedIndex
                  ? 'ring-2 ring-accent ring-offset-1'
                  : 'opacity-60 hover:opacity-100 cursor-pointer'
              }`}
            >
              <Image
                src={img}
                alt={`${alt} - weergave ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
