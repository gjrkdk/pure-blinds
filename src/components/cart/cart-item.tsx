'use client';

import { useState } from 'react';
import { CartItem as CartItemType } from '@/lib/cart/types';
import { useCartStore } from '@/lib/cart/store';
import { QuantityInput } from './quantity-input';
import { RemoveDialog } from './remove-dialog';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleQuantityUpdate = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRemoveClick = () => {
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    removeItem(item.id);
    setIsRemoveDialogOpen(false);
  };

  const handleCancelRemove = () => {
    setIsRemoveDialogOpen(false);
  };

  const lineTotal = item.priceInCents * item.quantity;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.productName}</h3>
          <p className="text-sm text-gray-600">
            {item.options.width}cm × {item.options.height}cm
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {formatPrice(item.priceInCents)} each
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <div className="flex items-center gap-3">
            <QuantityInput
              quantity={item.quantity}
              onUpdate={handleQuantityUpdate}
            />
            <button
              type="button"
              onClick={handleRemoveClick}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="ml-auto font-semibold text-gray-900 sm:ml-0">
            {formatPrice(lineTotal)}
          </div>
        </div>
      </div>

      <RemoveDialog
        productName={item.productName}
        isOpen={isRemoveDialogOpen}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </>
  );
}
