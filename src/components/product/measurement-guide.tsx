"use client";

import { useState } from "react";
import Link from "next/link";

export default function MeasurementGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
          >
            <path d="M21 15V6" />
            <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path d="M12 12H3" />
            <path d="M16 6H3" />
            <path d="M12 18H3" />
          </svg>
          <span className="text-sm font-medium text-foreground">
            Hoe meet ik mijn raam op?
          </span>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-foreground transition-transform duration-300"
          style={{
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? "60rem" : "0" }}
      >
        <div className="border-t border-border px-5 pb-5 pt-4">
          {/* In de dag */}
          <h4 className="text-sm font-semibold text-foreground">
            In de dag (binnen het kozijn)
          </h4>
          <ol className="mt-2 space-y-1.5">
            <li className="flex gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">1.</span>
              Meet de binnenbreedte op 3 punten — noteer de kleinste maat (mm).
            </li>
            <li className="flex gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">2.</span>
              Meet de binnenhoogte op 3 punten — noteer de kleinste maat (mm).
            </li>
            <li className="flex gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">3.</span>
              Controleer of er min. 6 cm diepte is in het kozijn.
            </li>
          </ol>

          {/* Op de dag */}
          <h4 className="mt-5 text-sm font-semibold text-foreground">
            Op de dag (op de muur/plafond)
          </h4>
          <ol className="mt-2 space-y-1.5">
            <li className="flex gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">1.</span>
              Meet de gewenste breedte — tel aan elke zijde min. 5 cm op.
            </li>
            <li className="flex gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">2.</span>
              Meet de hoogte vanaf het montagepunt tot de gewenste onderkant.
            </li>
            <li className="flex gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">3.</span>
              Controleer of de wand boven het kozijn geschikt is voor
              bevestiging.
            </li>
          </ol>

          <Link
            href="/inmeetinstructies"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted transition-colors"
          >
            Volledige meetinstructies bekijken
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
