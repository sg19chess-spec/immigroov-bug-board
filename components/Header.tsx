import Link from "next/link";
import ActingAsPicker from "@/components/ActingAsPicker";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/board" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            IB
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Immigroov
            </span>
            <span className="text-xs text-slate-500">Bug Board</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/board"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Board
          </Link>
          <Link
            href="/todo"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            To-Do
          </Link>
          <Link
            href="/testing"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Tested Scenarios
          </Link>
          <ActingAsPicker />
        </nav>
      </div>
    </header>
  );
}
