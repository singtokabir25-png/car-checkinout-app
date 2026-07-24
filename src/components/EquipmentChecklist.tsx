"use client";

import { EQUIPMENT_ITEMS } from "@/lib/validations/transaction";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

interface EquipmentChecklistProps {
  value: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
}

export function EquipmentChecklist({ value, onChange }: EquipmentChecklistProps) {
  const toggle = (id: string) => {
    onChange({ ...value, [id]: !value[id] });
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Equipment &amp; Condition Check
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EQUIPMENT_ITEMS.map((item) => {
          const checked = !!value[item.id];
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => toggle(item.id)}
              aria-pressed={checked}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition",
                checked
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border",
                  checked ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                )}
              >
                {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
