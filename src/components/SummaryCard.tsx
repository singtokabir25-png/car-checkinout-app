"use client";

import type { Transaction } from "@/types/database";
import { EQUIPMENT_ITEMS } from "@/lib/validations/transaction";
import { CheckCircle2 } from "lucide-react";

interface SummaryCardProps {
  transaction: Transaction;
}

const ROLE_LABEL: Record<Transaction["user_role"], string> = {
  employee: "Employee",
  customer: "Customer",
  Depositor: "Depositor",
};

/**
 * Pure "screenshot-friendly" summary card — no export/share buttons.
 * Staff take a native screenshot of this view and post it to LINE
 * themselves, so the priority here is a clean layout that reads well
 * at phone screenshot resolution, not any Web Share / html-to-image logic.
 */
export function SummaryCard({ transaction }: SummaryCardProps) {
  const checkedItems = EQUIPMENT_ITEMS.filter((item) => transaction.equipment_checklist?.[item.id]);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              {transaction.transaction_type === "check_in" ? "Check-In Record" : "Check-Out Record"}
            </p>
            <p className="text-lg font-bold">{transaction.plate_number}</p>
          </div>
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>

        {/* แสดงรูปภาพทั้งหมดที่มีแบบ Grid 2 คอลัมน์ */}
        {transaction.inspection_image_urls && transaction.inspection_image_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-0.5 bg-slate-200">
            {transaction.inspection_image_urls.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={url}
                alt={`Vehicle inspection ${index + 1}`}
                className="h-32 w-full bg-white object-cover"
                crossOrigin="anonymous"
              />
            ))}
          </div>
        )}

        <div className="space-y-3 px-5 py-4 text-sm">
          <Row label="Name" value={`${transaction.full_name} (${ROLE_LABEL[transaction.user_role]})`} />
          <Row label="Date / Time" value={`${transaction.transaction_date} ${transaction.transaction_time.slice(0, 5)}`} />
          {transaction.vehicle_make_model && <Row label="Vehicle" value={transaction.vehicle_make_model} />}
          {transaction.odometer_km != null && <Row label="Odometer" value={`${transaction.odometer_km.toLocaleString()} km`} />}
          {transaction.fuel_level != null && <Row label="Fuel" value={`${transaction.fuel_level}%`} />}

          {checkedItems.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-slate-500">Equipment Confirmed</p>
              <div className="flex flex-wrap gap-1.5">
                {checkedItems.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {transaction.item_deposits?.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-slate-500">ของฝาก</p>
              <ul className="space-y-0.5">
                {transaction.item_deposits.map((item) => (
                  <li key={item.id} className="flex justify-between text-slate-700">
                    <span>
                      {item.itemName} {item.note ? `(${item.note})` : ""}
                    </span>
                    <span className="font-medium">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {transaction.notes && (
            <div>
              <p className="mb-1 font-medium text-slate-500">Notes</p>
              <p className="text-slate-700">{transaction.notes}</p>
            </div>
          )}

          {transaction.signature_url && (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1 font-medium text-slate-500">Signature</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={transaction.signature_url}
                alt="Signature"
                className="h-16 w-auto"
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-center text-[11px] text-slate-400">
          Record ID: {transaction.id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        แคปหน้าจอนี้เพื่อส่งเข้า LINE ได้เลย
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}