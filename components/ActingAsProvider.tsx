"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getCurrentPerson, setCurrentPerson, PEOPLE } from "@/lib/currentPerson";
import PersonSelect from "@/components/PersonSelect";

interface ActingAsContextValue {
  person: string | null;
  setPerson: (name: string) => void;
  requirePerson: () => Promise<string>;
}

const ActingAsContext = createContext<ActingAsContextValue | null>(null);

export function ActingAsProvider({ children }: { children: React.ReactNode }) {
  const [person, setPersonState] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const pendingRef = useRef<{
    resolve: (name: string) => void;
    reject: () => void;
  } | null>(null);

  useEffect(() => {
    setPersonState(getCurrentPerson());
  }, []);

  const setPerson = useCallback((name: string) => {
    setCurrentPerson(name);
    setPersonState(name);
  }, []);

  const requirePerson = useCallback((): Promise<string> => {
    const current = getCurrentPerson();
    if (current) return Promise.resolve(current);

    setDraft("");
    setPromptOpen(true);
    return new Promise((resolve, reject) => {
      pendingRef.current = { resolve, reject };
    });
  }, []);

  function confirmPrompt() {
    const name = draft.trim();
    if (!name) return;
    setPerson(name);
    setPromptOpen(false);
    pendingRef.current?.resolve(name);
    pendingRef.current = null;
  }

  function cancelPrompt() {
    setPromptOpen(false);
    pendingRef.current?.reject();
    pendingRef.current = null;
  }

  return (
    <ActingAsContext.Provider value={{ person, setPerson, requirePerson }}>
      {children}
      {promptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={cancelPrompt}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Who&apos;s this?</h2>
            <p className="mb-3 text-xs text-slate-500">
              Pick your name once — this device will remember it for future actions.
            </p>
            <PersonSelect
              value={draft}
              onChange={setDraft}
              people={PEOPLE}
              placeholder="Select your name"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={cancelPrompt}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmPrompt}
                disabled={!draft.trim()}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </ActingAsContext.Provider>
  );
}

export function useActingAs(): ActingAsContextValue {
  const ctx = useContext(ActingAsContext);
  if (!ctx) throw new Error("useActingAs must be used within ActingAsProvider");
  return ctx;
}

export function useRequireActingPerson(): () => Promise<string> {
  return useActingAs().requirePerson;
}
