import { notFound } from "next/navigation";
import { CheckForm } from "@/components/CheckForm";
import type { TransactionType } from "@/types/database";

const VALID_TYPES: TransactionType[] = ["check_in", "check_out"];

export function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default function CheckPage({ params }: { params: { type: string } }) {
  if (!VALID_TYPES.includes(params.type as TransactionType)) {
    notFound();
  }

  const transactionType = params.type as TransactionType;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-bold text-slate-900">
        {transactionType === "check_in" ? "Vehicle Check-In" : "Vehicle Check-Out"}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Fill in the details below and sign to confirm the {transactionType === "check_in" ? "hand-over" : "return"}.
      </p>
      <CheckForm transactionType={transactionType} />
    </main>
  );
}
