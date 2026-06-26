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

const formatCompactMoney = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: amount >= 10000 ? "compact" : "standard",
    maximumFractionDigits: amount >= 10000 ? 1 : 2,
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
  if (s.includes("delivered")) return "border-success/30 bg-success/12 text-success";
  if (s.includes("out")) return "border-info/30 bg-info/12 text-info";
  if (s.includes("shipped")) return "border-indigoish/30 bg-indigoish/12 text-indigoish";
  if (s.includes("packing")) return "border-warning/30 bg-warning/12 text-warning";
  if (s.includes("cancel")) return "border-danger/30 bg-danger/12 text-danger";
  return "border-line2 bg-raised text-muted";
};

function AreaChart({ values }: { values: number[] }) {
  const width = 600;
  const height = 150;
  const padX = 4;
  const padY = 12;

  const { line, area, last, max } = useMemo(() => {
    if (values.length === 0) return { line: "", area: "", last: null as null | { x: number; y: number }, max: 0 };
    const maxV = Math.max(...values, 1);
    const pts = values.map((v, i) => {
      const x = padX + (i * (width - padX * 2)) / Math.max(1, values.length - 1);
      const y = padY + (1 - v / maxV) * (height - padY * 2);
      return { x, y };
    });
    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
    const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${height} L ${pts[0].x.toFixed(2)} ${height} Z`;
    return { line: linePath, area: areaPath, last: pts[pts.length - 1], max: maxV };
  }, [values]);

  const hasData = values.some((v) => v > 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Revenue over the last 14 days">
      <defs>
        <linearGradient id="adArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "rgb(var(--ad-gold))", stopOpacity: 0.28 }} />
          <stop offset="100%" style={{ stopColor: "rgb(var(--ad-gold))", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <line x1="0" y1={height - 1} x2={width} y2={height - 1} style={{ stroke: "rgb(var(--ad-line))" }} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      {hasData ? (
        <>
          <path d={area} fill="url(#adArea)" />
          <path d={line} fill="none" style={{ stroke: "rgb(var(--ad-gold))" }} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          {last ? <circle cx={last.x} cy={last.y} r="3.5" style={{ fill: "rgb(var(--ad-gold-hi))", stroke: "rgb(var(--ad-canvas))" }} strokeWidth="1.5" /> : null}
        </>
      ) : null}
      <title>{max ? `Peak day ${formatMoney(max)}` : "No revenue yet"}</title>
    </svg>
  );
}

function StatCell({
  label,
  value,
  meta,
  hero,
}: {
  label: string;
  value: string;
  meta?: string;
  hero?: boolean;
}) {
  return (
    <div className="bg-panel px-5 py-5">
      <p className="text-xs font-medium text-faint">{label}</p>
      <p className={"mt-1.5 text-2xl font-semibold tabular-nums tracking-tight " + (hero ? "text-gold" : "text-ink")}>{value}</p>
      {meta ? <p className="mt-1 text-xs text-muted">{meta}</p> : null}
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-panel px-5 py-5">
      <div className="ad-shimmer h-3 w-20 rounded" />
      <div className="ad-shimmer mt-2.5 h-7 w-24 rounded" />
      <div className="ad-shimmer mt-2 h-3 w-16 rounded" />
    </div>
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
  const weekRevenue = useMemo(() => sparkValues.slice(-7).reduce((s, v) => s + v, 0), [sparkValues]);
  const maxTop = topProducts[0]?.revenue ?? 0;

  return (
    <div className="space-y-6">
      <div className="ad-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Welcome back — here&apos;s how the shop is doing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/products" className="ad-btn h-9 px-3.5 py-0 text-xs">Manage products</Link>
          <Link href="/admin/orders" className="ad-btn h-9 px-3.5 py-0 text-xs">Manage orders</Link>
        </div>
      </div>

      {error ? (
        <div className="ad-in rounded-2xl border border-danger/30 bg-danger/12 px-5 py-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : null}

      {/* Stat strip */}
      <div className="ad-card ad-in overflow-hidden" style={{ animationDelay: "40ms" }}>
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCell label="Paid revenue" value={formatMoney(kpis.totalRevenue)} meta={`${kpis.paidOrders} paid order${kpis.paidOrders === 1 ? "" : "s"}`} hero />
              <StatCell label="Orders" value={String(kpis.orderCount)} meta={`${kpis.pendingOrders} active / pending`} />
              <StatCell label="Products" value={String(kpis.productCount)} meta={`${products.filter((p) => p.bestseller).length} bestsellers`} />
              <StatCell label="Last 7 days" value={formatCompactMoney(weekRevenue)} meta="paid revenue" />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-8">
          {/* Revenue trend */}
          <div className="ad-card ad-in p-5" style={{ animationDelay: "80ms" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">Revenue trend</p>
                <p className="text-xs text-muted">Paid orders · last 14 days</p>
              </div>
              <p className="text-right text-sm tabular-nums text-muted">
                <span className="text-ink">{formatMoney(sparkValues.at(-1) ?? 0)}</span>
                <span className="block text-xs text-faint">today</span>
              </p>
            </div>
            <div className="mt-4 h-36">
              {loading ? <div className="ad-shimmer h-full w-full rounded-xl" /> : <AreaChart values={sparkValues} />}
            </div>
          </div>

          {/* Recent orders */}
          <div className="ad-card ad-in" style={{ animationDelay: "120ms" }}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="text-sm font-medium text-ink">Recent orders</p>
                <p className="text-xs text-muted">Latest activity</p>
              </div>
              <Link href="/admin/orders" className="ad-btn-ghost">View all →</Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="ad-shimmer h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-ink">No orders yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted">When a customer checks out, their order shows up here ready to fulfil.</p>
              </div>
            ) : (
              <>
                {/* mobile cards */}
                <div className="divide-y divide-line sm:hidden">
                  {recentOrders.map((o) => (
                    <div key={o._id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs text-muted">{o._id}</p>
                          <p className="mt-0.5 text-xs text-faint">{new Date(o.date).toLocaleString()} · {o.items.length} items</p>
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums text-ink">{formatMoney(o.amount)}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={"ad-pill " + (o.payment ? "border-success/30 bg-success/12 text-success" : "border-line2 bg-raised text-muted")}>
                          {o.payment ? "Paid" : "Unpaid"} · {o.paymentMethod}
                        </span>
                        <span className={"ad-pill " + statusPillClass(o.status)}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* desktop table */}
                <div className="ad-scroll hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="text-xs text-faint">
                        <th className="px-5 py-3 text-left font-medium">Order</th>
                        <th className="px-5 py-3 text-left font-medium">Date</th>
                        <th className="px-5 py-3 text-right font-medium">Total</th>
                        <th className="px-5 py-3 text-left font-medium">Payment</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {recentOrders.map((o) => (
                        <tr key={o._id} className="transition-colors hover:bg-raised/50">
                          <td className="px-5 py-3">
                            <p className="font-mono text-xs text-muted">{o._id.slice(0, 8)}…{o._id.slice(-4)}</p>
                            <p className="text-xs text-faint">{o.items.length} items</p>
                          </td>
                          <td className="px-5 py-3 text-muted">{new Date(o.date).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{formatMoney(o.amount)}</td>
                          <td className="px-5 py-3">
                            <span className={"ad-pill " + (o.payment ? "border-success/30 bg-success/12 text-success" : "border-line2 bg-raised text-muted")}>
                              {o.payment ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={"ad-pill " + statusPillClass(o.status)}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-4">
          {/* Order status */}
          <div className="ad-card ad-in p-5" style={{ animationDelay: "100ms" }}>
            <p className="text-sm font-medium text-ink">Order status</p>
            <p className="text-xs text-muted">Across all current orders</p>

            <div className="mt-4 space-y-3.5">
              {loading ? (
                [0, 1, 2].map((i) => <div key={i} className="ad-shimmer h-6 w-full rounded" />)
              ) : statusBreakdown.length === 0 ? (
                <p className="py-4 text-sm text-muted">No orders to break down yet.</p>
              ) : (
                statusBreakdown.slice(0, 6).map((s) => (
                  <div key={s.status} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted">{s.status}</span>
                      <span className="tabular-nums text-faint">{s.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold" style={{ width: `${clamp(s.pct, 4, 100)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="ad-card ad-in" style={{ animationDelay: "140ms" }}>
            <div className="border-b border-line px-5 py-4">
              <p className="text-sm font-medium text-ink">Top products</p>
              <p className="text-xs text-muted">By revenue from paid &amp; placed orders</p>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="ad-shimmer h-10 w-full rounded-xl" />)}</div>
            ) : topProducts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-ink">No sales yet</p>
                <p className="mt-1 text-sm text-muted">Your best sellers will rank here once orders come in.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold/12 text-xs font-semibold tabular-nums text-gold">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-faint">{p.quantity} sold</p>
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(p.revenue)}</p>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-raised">
                        <div className="h-full rounded-full bg-gold/60" style={{ width: `${maxTop ? clamp(Math.round((p.revenue / maxTop) * 100), 6, 100) : 0}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
