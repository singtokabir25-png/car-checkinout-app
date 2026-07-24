import { notFound } from "next/navigation";
import { getTransaction } from "@/app/actions";
import { SummaryCard } from "@/components/SummaryCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SummaryPage({ params }: { params: { id: string } }) {
  const transaction = await getTransaction(params.id);

  if (!transaction) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        กลับหน้าแรก
      </Link>

      <h1 className="mb-1 text-xl font-bold text-slate-900">บันทึกสำเร็จ</h1>
      <p className="mb-6 text-sm text-slate-500">แคปหน้าจอด้านล่างเพื่อส่งเข้า LINE ได้เลย</p>

      <SummaryCard transaction={transaction} />
    </main>
  );
}
