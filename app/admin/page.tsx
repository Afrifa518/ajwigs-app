"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  sizes: string[];
  colors: string[];
  bestseller: boolean;
  image: string[];
};

type ProductListResponse = {
  success: boolean;
  products?: Product[];
  message?: string;
};

type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);

const dayKey = (ts: number) => {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const statusPillClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (s.includes("out")) return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  if (s.includes("shipped")) return "border-indigo-500/30 bg-indigo-500/10 text-indigo-200";
  if (s.includes("packing")) return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  return "border-slate-600/40 bg-slate-900/40 text-slate-200";
};

function Sparkline({ values }: { values: number[] }) {
  const width = 220;
  const height = 64;
  const padX = 10;
  const padY = 10;

  const points = useMemo(() => {
    if (values.length === 0) return [] as Array<{ x: number; y: number }>;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    return values.map((v, i) => {
      const x = padX + (i * (width - padX * 2)) / Math.max(1, values.length - 1);
      const t = (v - min) / span;
      const y = padY + (1 - t) * (height - padY * 2);
      return { x, y };
    });
  }, [values]);

  const d = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => {
        const cmd = i === 0 ? "M" : "L";
        return `${cmd} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      })
      .join(" ");
  }, [points]);

  const last = points.at(-1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#spark)" strokeWidth="2.5" />
      {last ? (
        <circle cx={last.x} cy={last.y} r="3.5" fill="#38bdf8" />
      ) : null}
    </svg>
  );
}

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const accessToken = await getAccessToken();
        const headers: Record<string, string> = {};
        if (accessToken) headers.token = accessToken;

        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/order/list", { method: "POST", headers }),
          fetch("/api/product/list"),
        ]);

        const ordersJson = (await ordersRes.json()) as OrdersResponse;
        if (!ordersJson.success) {
          throw new Error(ordersJson.message ?? "Failed to load orders");
        }

        const productsJson = (await productsRes.json()) as ProductListResponse;
        if (!productsJson.success) {
          throw new Error(productsJson.message ?? "Failed to load products");
        }

        if (!mounted) return;
        setOrders(ordersJson.orders ?? []);
        setProducts(productsJson.products ?? []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const orderCount = orders.length;
    const paidOrders = orders.filter((o) => o.payment).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.payment ? o.amount : 0), 0);
    const pendingOrders = orders.filter((o) => !o.status.toLowerCase().includes("delivered")).length;

    return {
      orderCount,
      paidOrders,
      totalRevenue,
      productCount: products.length,
      pendingOrders,
    };
  }, [orders, products]);

  const last14 = useMemo(() => {
    const now = new Date();
    const days: Array<{ key: string; revenue: number; orders: number }> = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dayKey(d.getTime());
      days.push({ key, revenue: 0, orders: 0 });
    }

    const map = new Map(days.map((d) => [d.key, d]));
    for (const o of orders) {
      const key = dayKey(o.date);
      const target = map.get(key);
      if (!target) continue;
      target.orders += 1;
      if (o.payment) target.revenue += o.amount;
    }

    return days;
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) {
      counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    }
    const total = orders.length || 1;
    return Array.from(counts.entries())
      .map(([status, count]) => ({ status, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

  const topProducts = useMemo(() => {
    const byName = new Map<string, TopProduct>();
    for (const o of orders) {
      for (const item of o.items) {
        const key = item.name;
        const curr = byName.get(key) ?? { name: key, quantity: 0, revenue: 0 };
        curr.quantity += item.quantity;
        curr.revenue += item.price * item.quantity;
        byName.set(key, curr);
      }
    }
    return Array.from(byName.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  const sparkValues = useMemo(() => last14.map((d) => d.revenue), [last14]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Overview</p>
          <h2 className="text-xl font-semibold tracking-tight">Admin Dashboard</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900/70"
          >
            Manage products
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900/70"
          >
            Manage orders
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <p className="text-sm text-slate-200">Loading dashboard…</p>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
              <p className="text-sm text-slate-400">Paid revenue (all time)</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {formatMoney(kpis.totalRevenue)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {kpis.paidOrders} paid orders
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
              <p className="text-sm text-slate-400">Orders</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{kpis.orderCount}</p>
              <p className="mt-2 text-xs text-slate-500">{kpis.pendingOrders} active/pending</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
              <p className="text-sm text-slate-400">Products</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{kpis.productCount}</p>
              <p className="mt-2 text-xs text-slate-500">
                {products.filter((p) => p.bestseller).length} marked bestseller
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
              <p className="text-sm text-slate-400">Revenue trend (14 days)</p>
              <div className="mt-2">
                <Sparkline values={sparkValues} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Latest day: {formatMoney(sparkValues.at(-1) ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
              <div>
                <p className="text-sm font-medium">Recent orders</p>
                <p className="text-xs text-slate-400">Latest activity</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm text-sky-200 hover:text-sky-100"
              >
                View all
              </Link>
            </div>

            <div className="sm:hidden">
              <div className="divide-y divide-slate-800">
                {recentOrders.map((o) => (
                  <div key={o._id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">{o._id}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(o.date).toLocaleString()} · {o.items.length} items
                        </p>
                      </div>
                      <p className="text-sm text-slate-200">{formatMoney(o.amount)}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
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
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs " +
                          statusPillClass(o.status)
                        }
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}

                {recentOrders.length === 0 ? (
                  <div className="px-5 py-6">
                    <p className="text-sm text-slate-400">No orders found.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="text-xs text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Order</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Date</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Total</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Payment</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        <p className="font-medium text-slate-100">{o._id}</p>
                        <p className="text-xs text-slate-500">{o.items.length} items</p>
                      </td>
                      <td className="px-3 py-2 text-slate-200 sm:px-5 sm:py-3">
                        {new Date(o.date).toLocaleString()}
                      </td>
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
                    </tr>
                  ))}

                  {recentOrders.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-sm text-slate-400 sm:px-5" colSpan={5}>
                        No orders found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <p className="text-sm font-medium">Order status</p>
            <p className="text-xs text-slate-400">Distribution across current orders</p>

            <div className="mt-4 space-y-3">
              {statusBreakdown.slice(0, 8).map((s) => (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-200">{s.status}</span>
                    <span className="text-slate-400">{s.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900/60">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500"
                      style={{ width: `${clamp(s.pct, 3, 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No status data yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30">
            <div className="border-b border-slate-800 px-5 py-4">
              <p className="text-sm font-medium">Top products</p>
              <p className="text-xs text-slate-400">By revenue (derived from orders)</p>
            </div>
            <div className="divide-y divide-slate-800">
              {topProducts.map((p) => (
                <div key={p.name} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100">{p.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{p.quantity} sold</p>
                    </div>
                    <p className="text-sm text-slate-200">{formatMoney(p.revenue)}</p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 ? (
                <div className="px-5 py-6">
                  <p className="text-sm text-slate-400">No sales data yet.</p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
