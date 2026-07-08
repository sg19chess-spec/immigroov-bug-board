import AddBugForm from "@/components/AddBugForm";

export default function AddBugPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">
        Report a Bug
      </h1>
      <p className="mb-5 text-sm text-slate-500">
        Add as much detail as you can — screenshots help a lot.
      </p>
      <AddBugForm />
    </div>
  );
}
