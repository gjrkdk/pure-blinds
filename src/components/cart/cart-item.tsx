'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/lib/cart/types';
import { useCartStore } from '@/lib/cart/store';
import { getProduct } from '@/lib/product/catalog';
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

  const isSample = item.type === "sample";
  const lineTotal = item.priceInCents * item.quantity;
  const product = getProduct(item.productId);

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
            {product?.image ? (
              <Image
                src={product.image}
                alt={item.productName}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted/20" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">
              {isSample ? `Kleurstaal — ${item.productName}` : item.productName}
            </h3>
            {!isSample && item.options && (
              <p className="mt-1 text-sm text-muted">
                {item.options.width} &times; {item.options.height} cm
              </p>
            )}
            <p className="mt-0.5 text-sm text-muted">
              {formatPrice(item.priceInCents)}{!isSample && " per stuk"} incl. BTW
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
          <div className="flex items-center gap-3">
            {!isSample && (
              <QuantityInput
                quantity={item.quantity}
                onUpdate={handleQuantityUpdate}
              />
            )}
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
