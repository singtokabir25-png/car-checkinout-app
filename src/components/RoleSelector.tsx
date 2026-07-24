"use client";

import { cn } from "@/lib/utils/cn";
import { Briefcase, User, UserCheck } from "lucide-react";
import type { UserRole } from "@/types/database";

const ROLES: { value: UserRole; label: string; hint: string; icon: React.ElementType }[] = [
  { value: "employee", label: "Employee", hint: "Staff performing the inspection", icon: Briefcase },
  { value: "customer", label: "Customer", hint: "Dropping off / picking up your vehicle", icon: User },
  { value: "Depositor", label: "Depositor", hint: "Vehicle depositor", icon: UserCheck },
];

interface RoleSelectorProps {
  value: UserRole | undefined;
  onChange: (role: UserRole) => void;
  error?: string;
}

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Who are you checking in as?
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ROLES.map(({ value: roleValue, label, hint, icon: Icon }) => {
          const selected = value === roleValue;
          return (
            <button
              key={roleValue}
              type="button"
              onClick={() => onChange(roleValue)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition",
                "hover:border-blue-400 hover:bg-blue-50/50 active:scale-[0.98]",
                selected
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                  : "border-slate-200 bg-white"
              )}
            >
              <Icon
                className={cn("h-6 w-6", selected ? "text-blue-600" : "text-slate-400")}
              />
              <span className="font-semibold text-slate-900">{label}</span>
              <span className="text-xs text-slate-500">{hint}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
