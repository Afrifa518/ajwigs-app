"use client";

import Image from "next/image";
import Link from "next/link";
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

const shortId = (id: string) => {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
};

const statusPillClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }
  if (s.includes("out")) return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  if (s.includes("shipped")) return "border-indigo-500/30 bg-indigo-500/10 text-indigo-200";
  if (s.includes("packing")) return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  return "border-slate-600/40 bg-slate-900/40 text-slate-200";
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
    const delivered = orders.filter((o) =>
      o.status.toLowerCase().includes("delivered")
    ).length;
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

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-slate-400">Operations</p>
          <h2 className="text-xl font-semibold tracking-tight">Orders</h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order, user, status, product…"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:w-56"
          >
            <option value="all">All statuses</option>
            {knownStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900/70"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Total orders</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Paid revenue</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatMoney(stats.revenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Paid / Unpaid</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {stats.paid} / {stats.unpaid}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Delivered</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.delivered}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <p className="text-sm text-slate-200">Loading orders…</p>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/30">
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Orders</p>
            <p className="text-xs text-slate-400">{filteredOrders.length} shown</p>
          </div>
          <Link href="/admin" className="text-sm text-sky-200 hover:text-sky-100">
            Back to dashboard
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Order</th>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Date</th>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Customer</th>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Total</th>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Payment</th>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Status</th>
                <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredOrders.map((o) => {
                const isExpanded = expanded === o._id;

                return (
                  <Fragment key={o._id}>
                    <tr
                      className="cursor-pointer hover:bg-slate-900/40"
                      onClick={() => setExpanded((p) => (p === o._id ? null : o._id))}
                    >
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        <p className="font-medium text-slate-100">{shortId(o._id)}</p>
                        <p className="text-xs text-slate-500">{o.items.length} items</p>
                      </td>
                      <td className="px-3 py-2 text-slate-200 sm:px-5 sm:py-3">
                        {new Date(o.date).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-slate-200 sm:px-5 sm:py-3">{shortId(o.userId)}</td>
                      <td className="px-3 py-2 text-slate-200 sm:px-5 sm:py-3">{formatMoney(o.amount)}</td>
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs " +
                            (o.payment
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-700 bg-slate-900/40 text-slate-300")
                          }
                        >
                          {o.payment ? "Paid" : "Unpaid"} · {o.paymentMethod}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs " +
                            statusPillClass(o.status)
                          }
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-5 sm:py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                          <select
                            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 lg:w-56"
                            value={statusDraft[o._id] ?? o.status}
                            onChange={(e) =>
                              setStatusDraft((p) => ({ ...p, [o._id]: e.target.value }))
                            }
                          >
                            {knownStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                            {!knownStatuses.includes(o.status) ? (
                              <option value={o.status}>{o.status}</option>
                            ) : null}
                          </select>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900/70 disabled:opacity-60"
                            disabled={!!updating[o._id]}
                            onClick={() => void updateStatus(o._id)}
                          >
                            {updating[o._id] ? "Updating…" : "Update"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr className="bg-slate-950/40">
                        <td className="px-3 py-5 sm:px-5" colSpan={7}>
                          <div className="grid gap-4 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                              <p className="text-sm font-medium text-slate-100">Items</p>
                              <div className="mt-3 grid gap-2">
                                {o.items.map((i) => (
                                  <div
                                    key={`${i._id}:${i.color}:${i.size}`}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/30 p-3"
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
                                        {i.image?.[0] ? (
                                          <Image
                                            src={i.image[0]}
                                            alt={i.name}
                                            fill
                                            className="object-cover"
                                            sizes="40px"
                                          />
                                        ) : null}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-100">
                                          {i.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          Qty {i.quantity}
                                          {i.color ? ` · Color ${i.color}` : ""}
                                          {i.size ? ` · Size ${i.size}` : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-200">
                                      {formatMoney(i.price * i.quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="lg:col-span-4">
                              <p className="text-sm font-medium text-slate-100">Details</p>
                              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/30 p-3 text-sm text-slate-200">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-slate-400">Order</span>
                                  <span className="font-medium">{o._id}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-3">
                                  <span className="text-slate-400">Customer</span>
                                  <span className="font-medium">{o.userId}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-3">
                                  <span className="text-slate-400">Total</span>
                                  <span className="font-medium">{formatMoney(o.amount)}</span>
                                </div>
                              </div>

                              <p className="mt-4 text-sm font-medium text-slate-100">Address</p>
                              <pre className="mt-2 max-h-52 overflow-auto rounded-xl border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-200">
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

              {filteredOrders.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-sm text-slate-400 sm:px-5" colSpan={7}>
                    No orders match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
