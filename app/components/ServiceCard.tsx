"use client";

import { useState } from "react";

interface ServiceCardProps {
  name: string;
  description: string;
  price: number;
  duration: string;
  popular?: boolean;
  onToggle?: (added: boolean) => void;
}

export default function ServiceCard({
  name,
  description,
  price,
  duration,
  popular = false,
  onToggle,
}: ServiceCardProps) {
  const [added, setAdded] = useState(false);

  const handleToggle = () => {
    const next = !added;
    setAdded(next);
    onToggle?.(next);
  };

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 ${
        added
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-border bg-surface-card"
      }`}
    >
      {popular && (
        <span className="absolute -top-2.5 left-4 badge badge-primary text-[10px]">
          <span className="material-icons-round text-[10px]">local_fire_department</span>
          Popular
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[15px] text-text-primary">{name}</h4>
          <p className="text-[13px] text-text-secondary mt-1 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[15px] font-bold text-text-primary">
              ₹{price}
            </span>
            <span className="text-[12px] text-text-tertiary flex items-center gap-1">
              <span className="material-icons-round text-[12px]">schedule</span>
              {duration}
            </span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`shrink-0 mt-1 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            added
              ? "gradient-primary text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
              : "border-2 border-border-strong text-text-secondary hover:border-primary hover:text-primary"
          }`}
        >
          <span className="material-icons-round text-[18px]">
            {added ? "check" : "add"}
          </span>
        </button>
      </div>
    </div>
  );
}
