import Link from "next/link";
import { LogIn, LogOut, Car } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
          <Car className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Vehicle Check-in / Check-out</h1>
        <p className="mt-1 text-sm text-slate-500">Select an action to begin the inspection form</p>
      </div>

      <div className="space-y-3">
        <Link
          href="/check/check_in"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
            <LogIn className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Check In</p>
            <p className="text-sm text-slate-500">Vehicle arriving on site</p>
          </div>
        </Link>

        <Link
          href="/check/check_out"
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <LogOut className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Check Out</p>
            <p className="text-sm text-slate-500">Vehicle leaving the site</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
