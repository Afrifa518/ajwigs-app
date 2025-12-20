"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type StripeCreateResponse = {
  success: boolean;
  session_url?: string;
  message?: string;
};

export default function StripeTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      router.replace("/");
    }
  }, [router]);

  if (process.env.NODE_ENV === "production") return null;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const items = [
        {
          name: "Stripe Test Item",
          price: 10,
          quantity: 1,
        },
      ];

      const deliveryCharge = 2;
      const amount = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + deliveryCharge;

      const address = {
        firstName: "Test",
        lastName: "User",
        email: sessionData.session?.user?.email ?? "test@example.com",
        street: "1 Test Street",
        city: "London",
        state: "",
        zipcode: "00000",
        country: "UK",
        phone: "0000000000",
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.token = accessToken;
      }

      const res = await fetch("/api/order/stripe", {
        method: "POST",
        headers,
        body: JSON.stringify({ items, amount, address }),
      });

      const data = (await res.json()) as StripeCreateResponse;

      if (!data.success || !data.session_url) {
        setError(data.message ?? `Request failed (${res.status})`);
        return;
      }

      window.location.href = data.session_url;
    } catch (err) {
      console.error(err);
      setError("Failed to create Stripe checkout session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-xl font-semibold">Stripe Test Checkout</h1>
      <p className="text-sm">
        Use this page to create a Stripe Checkout session and complete a test payment.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white disabled:opacity-60"
        >
          {loading ? "Creating session..." : "Create Checkout Session"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="text-sm space-y-1">
        <p>
          If you see <code>Unauthorized</code>, open <a className="underline" href="/login">/login</a> first.
        </p>
        <p>
          After payment, Stripe will redirect you to <code>/verify</code>, then to <code>/orders</code>.
        </p>
      </div>
    </main>
  );
}
