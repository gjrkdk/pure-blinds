'use client';

import { useState } from 'react';
import { CartItem as CartItemType } from '@/lib/cart/types';
import { useCartStore } from '@/lib/cart/store';
import { QuantityInput } from './quantity-input';
import { RemoveDialog } from './remove-dialog';
import { formatPrice } from '@/lib/pricing/calculator';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

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
      <div className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">{item.productName}</h3>
          <p className="mt-1 text-sm text-muted">
            {item.options.width} &times; {item.options.height} cm
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {formatPrice(item.priceInCents)} per stuk
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
          <div className="flex items-center gap-3">
            <QuantityInput
              quantity={item.quantity}
              onUpdate={handleQuantityUpdate}
            />
            <button
              type="button"
              onClick={handleRemoveClick}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Verwijderen
            </button>
          </div>

          <div className="ml-auto text-sm font-medium text-foreground sm:ml-0">
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
