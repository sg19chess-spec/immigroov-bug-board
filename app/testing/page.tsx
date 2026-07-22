"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TestCase, TestModule } from "@/lib/types";
import AddModuleForm from "@/components/AddModuleForm";
import ModuleSection from "@/components/ModuleSection";

export default function TestingPage() {
  const [modules, setModules] = useState<TestModule[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/test-modules").then((r) => r.json()),
      fetch("/api/test-cases").then((r) => r.json()),
    ]).then(([modulesData, casesData]) => {
      setModules(Array.isArray(modulesData) ? modulesData : []);
      setTestCases(Array.isArray(casesData) ? casesData : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("test-scenarios-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_modules" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setModules((prev) =>
              prev.some((m) => m.id === payload.new.id)
                ? prev
                : [...prev, payload.new as TestModule]
            );
          } else if (payload.eventType === "DELETE") {
            setModules((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_cases" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTestCases((prev) =>
              prev.some((c) => c.id === payload.new.id)
                ? prev
                : [...prev, payload.new as TestCase]
            );
          } else if (payload.eventType === "UPDATE") {
            setTestCases((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? (payload.new as TestCase) : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTestCases((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleFinishCase(caseId: string, testerName: string) {
    setTestCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, tested: true, tested_by: testerName, tested_at: new Date().toISOString() }
          : c
      )
    );
    fetch(`/api/test-cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tested: true, tested_by: testerName }),
    });
  }

  function handleReopenCase(caseId: string) {
    setTestCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, tested: false, tested_by: null, tested_at: null } : c
      )
    );
    fetch(`/api/test-cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tested: false }),
    });
  }

  function handleDeleteCase(caseId: string) {
    if (!confirm("Delete this test case?")) return;
    setTestCases((prev) => prev.filter((c) => c.id !== caseId));
    fetch(`/api/test-cases/${caseId}`, { method: "DELETE" });
  }

  function handleDeleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its test cases?")) return;
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    setTestCases((prev) => prev.filter((c) => c.module_id !== moduleId));
    fetch(`/api/test-modules/${moduleId}`, { method: "DELETE" });
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading test scenarios...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
          Tested Scenarios
        </h1>
        <p className="text-sm text-slate-500">
          Organize test cases by module and track who tested what.
        </p>
      </div>

      <AddModuleForm onAdded={(module) => setModules((prev) => [...prev, module])} />

      {modules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
          No modules yet — add one above
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {modules.map((module) => (
            <ModuleSection
              key={module.id}
              module={module}
              testCases={testCases.filter((c) => c.module_id === module.id)}
              onAddCase={(tc) => setTestCases((prev) => [...prev, tc])}
              onFinishCase={handleFinishCase}
              onReopenCase={handleReopenCase}
              onDeleteCase={handleDeleteCase}
              onDeleteModule={() => handleDeleteModule(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
