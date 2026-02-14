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
      className="max-w-sm border border-border p-8 shadow-sm backdrop:bg-foreground/40"
    >
      <h2 id="remove-dialog-title" className="text-base font-medium text-foreground">
        Verwijderen uit winkelwagen?
      </h2>
      <p id="remove-dialog-description" className="mt-2 text-sm text-muted">
        {productName} verwijderen uit uw winkelwagen?
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          Annuleren
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 bg-foreground px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-80"
        >
          Verwijderen
        </button>
      </div>
    </dialog>
  );
}
