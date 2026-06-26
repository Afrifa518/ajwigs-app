"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import { getAccessToken } from "@/app/admin/_lib/supabase";

type OrderItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string[];
};

type Order = {
  _id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  address: unknown;
  status: string;
  paymentMethod: string;
  payment: boolean;
  date: number;
};

type OrdersResponse = {
  success: boolean;
  orders?: Order[];
  message?: string;
};

type BasicResponse = {
  success: boolean;
  message?: string;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);

const shortId = (id: string) => (id.length <= 12 ? id : `${id.slice(0, 8)}…${id.slice(-4)}`);

const statusPillClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "border-success/30 bg-success/12 text-success";
  if (s.includes("out")) return "border-info/30 bg-info/12 text-info";
  if (s.includes("shipped")) return "border-indigoish/30 bg-indigoish/12 text-indigoish";
  if (s.includes("packing")) return "border-warning/30 bg-warning/12 text-warning";
  if (s.includes("cancel")) return "border-danger/30 bg-danger/12 text-danger";
  return "border-line2 bg-raised text-muted";
};

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const knownStatuses = useMemo(
    () => ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"],
    []
  );

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      if (o._id.toLowerCase().includes(q)) return true;
      if (o.userId.toLowerCase().includes(q)) return true;
      if (o.paymentMethod.toLowerCase().includes(q)) return true;
      if (o.status.toLowerCase().includes(q)) return true;
      if (o.items.some((i) => i.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [orders, query, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.payment).length;
    const unpaid = total - paid;
    const delivered = orders.filter((o) => o.status.toLowerCase().includes("delivered")).length;
    const revenue = orders.reduce((sum, o) => sum + (o.payment ? o.amount : 0), 0);
    return { total, paid, unpaid, delivered, revenue };
  }, [orders]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = {};
      if (accessToken) headers.token = accessToken;

      const res = await fetch("/api/order/list", { method: "POST", headers });
      const data = (await res.json()) as OrdersResponse;

      if (!data.success) {
        setError(data.message ?? "Failed to load orders");
        return;
      }

      const os = data.orders ?? [];
      setOrders(os);

      setStatusDraft((prev) => {
        const next = { ...prev };
        for (const o of os) {
          if (!next[o._id]) next[o._id] = o.status;
        }
        return next;
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (orderId: string) => {
    setError(null);
    setUpdating((p) => ({ ...p, [orderId]: true }));

    try {
      const status = statusDraft[orderId];
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.token = accessToken;

      const res = await fetch("/api/order/status", {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId, status }),
      });

      const data = (await res.json()) as BasicResponse;
      if (!data.success) {
        setError(data.message ?? "Failed to update status");
        return;
      }

      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    } finally {
      setUpdating((p) => ({ ...p, [orderId]: false }));
    }
  };

  const stripStats = [
    { label: "Total orders", value: String(stats.total), hero: false },
    { label: "Paid revenue", value: formatMoney(stats.revenue), hero: true },
    { label: "Paid / Unpaid", value: `${stats.paid} / ${stats.unpaid}`, hero: false },
    { label: "Delivered", value: String(stats.delivered), hero: false },
  ];

  return (
    <div className="space-y-6">
      <div className="ad-in flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted">Track payments and move each order through to delivery.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders…" className="ad-input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ad-input sm:w-48">
            <option value="all">All statuses</option>
            {knownStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" onClick={() => void load()} className="ad-btn">Refresh</button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="ad-card ad-in overflow-hidden" style={{ animationDelay: "40ms" }}>
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {stripStats.map((s) => (
            <div key={s.label} className="bg-panel px-5 py-5">
              <p className="text-xs font-medium text-faint">{s.label}</p>
              {loading ? (
                <div className="ad-shimmer mt-2 h-7 w-24 rounded" />
              ) : (
                <p className={"mt-1.5 text-2xl font-semibold tabular-nums tracking-tight " + (s.hero ? "text-gold" : "text-ink")}>{s.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="ad-in rounded-2xl border border-danger/30 bg-danger/12 px-5 py-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : null}

      <div className="ad-card ad-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            <p className="text-sm font-medium text-ink">Orders</p>
            <p className="text-xs text-muted">{loading ? "Loading…" : `${filteredOrders.length} shown`}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="ad-shimmer h-12 w-full rounded-xl" />)}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-ink">{orders.length === 0 ? "No orders yet" : "No matches"}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              {orders.length === 0 ? "Orders placed on the storefront will appear here, ready to pack and ship." : "Try a different search or status filter."}
            </p>
          </div>
        ) : (
          <>
            {/* mobile cards */}
            <div className="divide-y divide-line sm:hidden">
              {filteredOrders.map((o) => {
                const isExpanded = expanded === o._id;
                const draft = statusDraft[o._id] ?? o.status;
                return (
                  <div key={o._id} className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => (p === o._id ? null : o._id))}
                      className="w-full text-left"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-muted">{shortId(o._id)}</p>
                          <p className="mt-0.5 text-xs text-faint">{new Date(o.date).toLocaleString()} · {o.items.length} items</p>
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums text-ink">{formatMoney(o.amount)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={"ad-pill " + (o.payment ? "border-success/30 bg-success/12 text-success" : "border-line2 bg-raised text-muted")}>
                          {o.payment ? "Paid" : "Unpaid"} · {o.paymentMethod}
                        </span>
                        <span className={"ad-pill " + statusPillClass(o.status)}>{o.status}</span>
                      </div>
                    </button>

                    <div className="mt-3 flex items-center gap-2">
                      <select
                        className="ad-input h-10 flex-1"
                        value={draft}
                        onChange={(e) => setStatusDraft((p) => ({ ...p, [o._id]: e.target.value }))}
                        aria-label="Update order status"
                      >
                        {knownStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
                        {!knownStatuses.includes(o.status) ? <option value={o.status}>{o.status}</option> : null}
                      </select>
                      <button
                        type="button"
                        className="ad-btn-primary h-10 px-4"
                        disabled={!!updating[o._id] || draft === o.status}
                        onClick={() => void updateStatus(o._id)}
                      >
                        {updating[o._id] ? "Saving…" : "Update"}
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="mt-3 space-y-2 border-t border-line pt-3">
                        {o.items.map((i) => (
                          <div key={`${i._id}:${i.color}:${i.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel p-2.5">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line bg-raised">
                                {i.image?.[0] ? <Image src={i.image[0]} alt={i.name} fill className="object-cover" sizes="36px" /> : null}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink">{i.name}</p>
                                <p className="text-xs text-muted">Qty {i.quantity}{i.color ? ` · ${i.color}` : ""}{i.size ? ` · ${i.size}` : ""}</p>
                              </div>
                            </div>
                            <p className="shrink-0 text-sm tabular-nums text-ink">{formatMoney(i.price * i.quantity)}</p>
                          </div>
                        ))}
                        <div className="rounded-xl border border-line bg-panel p-3">
                          <p className="text-xs font-medium text-muted">Delivery address</p>
                          <pre className="ad-scroll mt-1.5 max-h-40 overflow-auto text-xs text-muted">{JSON.stringify(o.address, null, 2)}</pre>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* desktop table */}
            <div className="ad-scroll hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[940px] text-sm">
              <thead>
                <tr className="text-xs text-faint">
                  <th className="px-5 py-3 text-left font-medium">Order</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-left font-medium">Payment</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Update</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {filteredOrders.map((o) => {
                  const isExpanded = expanded === o._id;
                  return (
                    <Fragment key={o._id}>
                      <tr className="cursor-pointer transition-colors hover:bg-raised/50" onClick={() => setExpanded((p) => (p === o._id ? null : o._id))}>
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs text-muted">{shortId(o._id)}</p>
                          <p className="text-xs text-faint">{o.items.length} items</p>
                        </td>
                        <td className="px-5 py-3 text-muted">{new Date(o.date).toLocaleString()}</td>
                        <td className="px-5 py-3 font-mono text-xs text-muted">{shortId(o.userId)}</td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{formatMoney(o.amount)}</td>
                        <td className="px-5 py-3">
                          <span className={"ad-pill " + (o.payment ? "border-success/30 bg-success/12 text-success" : "border-line2 bg-raised text-muted")}>
                            {o.payment ? "Paid" : "Unpaid"} · {o.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={"ad-pill " + statusPillClass(o.status)}>{o.status}</span>
                        </td>
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <select
                              className="ad-input h-9 w-44 py-0"
                              value={statusDraft[o._id] ?? o.status}
                              onChange={(e) => setStatusDraft((p) => ({ ...p, [o._id]: e.target.value }))}
                            >
                              {knownStatuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                              {!knownStatuses.includes(o.status) ? <option value={o.status}>{o.status}</option> : null}
                            </select>
                            <button
                              type="button"
                              className="ad-btn-primary h-9 px-3.5 py-0 text-xs"
                              disabled={!!updating[o._id] || (statusDraft[o._id] ?? o.status) === o.status}
                              onClick={() => void updateStatus(o._id)}
                            >
                              {updating[o._id] ? "Saving…" : "Update"}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="bg-canvas/60">
                          <td className="px-5 py-5" colSpan={7}>
                            <div className="grid gap-4 lg:grid-cols-12">
                              <div className="lg:col-span-8">
                                <p className="text-sm font-medium text-ink">Items</p>
                                <div className="mt-3 grid gap-2">
                                  {o.items.map((i) => (
                                    <div key={`${i._id}:${i.color}:${i.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel p-3">
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-raised">
                                          {i.image?.[0] ? <Image src={i.image[0]} alt={i.name} fill className="object-cover" sizes="44px" /> : null}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-ink">{i.name}</p>
                                          <p className="text-xs text-muted">
                                            Qty {i.quantity}
                                            {i.color ? ` · ${i.color}` : ""}
                                            {i.size ? ` · ${i.size}` : ""}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(i.price * i.quantity)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="lg:col-span-4">
                                <p className="text-sm font-medium text-ink">Details</p>
                                <div className="mt-3 rounded-xl border border-line bg-panel p-3.5 text-sm">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted">Order</span>
                                    <span className="font-mono text-xs text-ink">{shortId(o._id)}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="text-muted">Customer</span>
                                    <span className="font-mono text-xs text-ink">{shortId(o.userId)}</span>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="text-muted">Total</span>
                                    <span className="font-medium tabular-nums text-ink">{formatMoney(o.amount)}</span>
                                  </div>
                                </div>

                                <p className="mt-4 text-sm font-medium text-ink">Delivery address</p>
                                <pre className="ad-scroll mt-2 max-h-52 overflow-auto rounded-xl border border-line bg-panel p-3 text-xs text-muted">
                                  {JSON.stringify(o.address, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
