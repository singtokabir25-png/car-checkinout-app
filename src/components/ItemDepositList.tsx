"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ItemDeposit } from "@/lib/validations/transaction";

interface ItemDepositListProps {
  value: ItemDeposit[];
  onChange: (value: ItemDeposit[]) => void;
}

function makeEmptyItem(): ItemDeposit {
  return { id: crypto.randomUUID(), itemName: "", quantity: 1, note: "" };
}

export function ItemDepositList({ value, onChange }: ItemDepositListProps) {
  const addRow = () => onChange([...value, makeEmptyItem()]);

  const removeRow = (id: string) => onChange(value.filter((row) => row.id !== id));

  const updateRow = (id: string, patch: Partial<ItemDeposit>) =>
    onChange(value.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">รายการของฝาก</label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          เพิ่มรายการ
        </button>
      </div>

      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">
          ยังไม่มีรายการของฝาก — กด "เพิ่มรายการ" หากมีของฝากไว้
        </p>
      )}

      <div className="space-y-2">
        {value.map((row, index) => (
          <div key={row.id} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_2fr]">
              <div>
                <input
                  value={row.itemName}
                  onChange={(e) => updateRow(row.id, { itemName: e.target.value })}
                  placeholder="ชื่อของ เช่น โต๊ะพับ, หมวกนิรภัย"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) })}
                  placeholder="จำนวน"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  value={row.note ?? ""}
                  onChange={(e) => updateRow(row.id, { note: e.target.value })}
                  placeholder="หมายเหตุ (ถ้ามี)"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className="mt-1.5 flex-shrink-0 text-slate-400 hover:text-red-600"
              aria-label={`ลบรายการที่ ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
