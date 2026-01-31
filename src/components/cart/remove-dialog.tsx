'use client';

import { useEffect, useRef } from 'react';

interface RemoveDialogProps {
  productName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveDialog({
  productName,
  isOpen,
  onConfirm,
  onCancel,
}: RemoveDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Close if clicking on backdrop (outside dialog content)
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onCancel();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="remove-dialog-title"
      aria-describedby="remove-dialog-description"
      onClick={handleBackdropClick}
      className="max-w-sm rounded-lg p-6 shadow-lg backdrop:bg-black/50"
    >
      <h2 id="remove-dialog-title" className="mb-2 text-lg font-semibold">
        Remove from cart?
      </h2>
      <p id="remove-dialog-description" className="mb-6 text-sm text-gray-600">
        Remove {productName} from your cart?
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    </dialog>
  );
}
