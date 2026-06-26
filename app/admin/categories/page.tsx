"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getAccessToken } from "@/app/admin/_lib/supabase";
import { fetchTaxonomy, type Taxonomy } from "@/lib/taxonomy";

type MutatePayload = {
  entity: "category" | "group" | "subcategory";
  op: "add" | "remove";
  id?: string;
  label?: string;
  groupId?: string;
};

const IconTrash = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
  </svg>
);

export default function AdminCategoriesPage() {
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ categories: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      setTaxonomy(await fetchTaxonomy());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const mutate = async (payload: MutatePayload) => {
    setError(null);
    setBusy(true);
    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.token = token;

      const res = await fetch("/api/taxonomy/mutate", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!data.success) {
        setError(data.message ?? "Something went wrong");
        return false;
      }
      await load();
      return true;
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (await mutate({ entity: "category", op: "add", label: newCategory })) {
      setNewCategory("");
    }
  };

  const onAddGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGroup.trim()) return;
    if (await mutate({ entity: "group", op: "add", label: newGroup })) {
      setNewGroup("");
    }
  };

  const onAddSub = async (e: FormEvent, groupId: string) => {
    e.preventDefault();
    const label = (newSub[groupId] ?? "").trim();
    if (!label) return;
    if (await mutate({ entity: "subcategory", op: "add", label, groupId })) {
      setNewSub((p) => ({ ...p, [groupId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="ad-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Manage the categories and wig-length groups shown in the product form and storefront filters.
        </p>
        <button type="button" onClick={() => void load()} className="ad-btn h-9 self-start px-3.5 py-0 text-xs sm:self-auto">
          Refresh
        </button>
      </div>

      {error ? (
        <div className="ad-in rounded-2xl border border-danger/30 bg-danger/12 px-5 py-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Categories */}
        <section className="ad-card ad-in self-start" style={{ animationDelay: "40ms" }}>
          <div className="border-b border-line px-5 py-4">
            <p className="text-sm font-medium text-ink">Categories</p>
            <p className="text-xs text-muted">e.g. Frontal, Closure, Straight Wig</p>
          </div>

          <div className="p-5">
            <form onSubmit={onAddCategory} className="flex items-center gap-2">
              <input
                className="ad-input"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                maxLength={60}
              />
              <button type="submit" className="ad-btn-primary shrink-0" disabled={busy || !newCategory.trim()}>
                Add
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {loading ? (
                [0, 1, 2].map((i) => <div key={i} className="ad-shimmer h-10 w-full rounded-xl" />)
              ) : taxonomy.categories.length === 0 ? (
                <p className="py-3 text-sm text-muted">No categories yet — add your first above.</p>
              ) : (
                taxonomy.categories.map((c) => (
                  <div key={c.id ?? c.value} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-raised px-3.5 py-2.5">
                    <span className="truncate text-sm text-ink">{c.label}</span>
                    {c.id ? (
                      <button
                        type="button"
                        onClick={() => void mutate({ entity: "category", op: "remove", id: c.id })}
                        disabled={busy}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-danger/12 hover:text-danger"
                        aria-label={`Remove ${c.label}`}
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Subcategory groups */}
        <section className="ad-card ad-in self-start" style={{ animationDelay: "80ms" }}>
          <div className="border-b border-line px-5 py-4">
            <p className="text-sm font-medium text-ink">Wig length groups</p>
            <p className="text-xs text-muted">Groups (e.g. Short Wigs) and the lengths inside them</p>
          </div>

          <div className="space-y-4 p-5">
            <form onSubmit={onAddGroup} className="flex items-center gap-2">
              <input
                className="ad-input"
                placeholder="New group name (e.g. Curly Wigs)"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                maxLength={60}
              />
              <button type="submit" className="ad-btn-primary shrink-0" disabled={busy || !newGroup.trim()}>
                Add group
              </button>
            </form>

            {loading ? (
              [0, 1].map((i) => <div key={i} className="ad-shimmer h-28 w-full rounded-xl" />)
            ) : taxonomy.groups.length === 0 ? (
              <p className="py-3 text-sm text-muted">No groups yet — add one above.</p>
            ) : (
              taxonomy.groups.map((g) => (
                <div key={g.id ?? g.label} className="rounded-xl border border-line bg-raised/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{g.label}</p>
                    {g.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove the "${g.label}" group and all its lengths?`)) {
                            void mutate({ entity: "group", op: "remove", id: g.id });
                          }
                        }}
                        disabled={busy}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-danger/12 hover:text-danger"
                        aria-label={`Remove ${g.label} group`}
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {g.options.length === 0 ? (
                      <span className="text-xs text-faint">No lengths yet.</span>
                    ) : (
                      g.options.map((o) => (
                        <span key={o.id ?? o.value} className="inline-flex items-center gap-1.5 rounded-full border border-line2 bg-panel px-2.5 py-1 text-xs text-muted">
                          {o.label}
                          {o.id ? (
                            <button
                              type="button"
                              onClick={() => void mutate({ entity: "subcategory", op: "remove", id: o.id })}
                              disabled={busy}
                              className="text-faint transition-colors hover:text-danger"
                              aria-label={`Remove ${o.label}`}
                            >
                              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          ) : null}
                        </span>
                      ))
                    )}
                  </div>

                  {g.id ? (
                    <form onSubmit={(e) => onAddSub(e, g.id as string)} className="mt-3 flex items-center gap-2">
                      <input
                        className="ad-input h-9 py-0 text-xs"
                        placeholder="Add a length (e.g. Bob (6-8 inches))"
                        value={newSub[g.id] ?? ""}
                        onChange={(e) => setNewSub((p) => ({ ...p, [g.id as string]: e.target.value }))}
                        maxLength={60}
                      />
                      <button type="submit" className="ad-btn h-9 shrink-0 px-3 py-0 text-xs" disabled={busy || !(newSub[g.id] ?? "").trim()}>
                        Add
                      </button>
                    </form>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <p className="text-xs text-faint">
        Removing a category or length won&apos;t change products that already use it — it only removes the option going forward.
      </p>
    </div>
  );
}
