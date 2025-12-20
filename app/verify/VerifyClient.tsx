"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/app/providers";

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, refresh } = useShop();

  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const success = searchParams.get("success");

    const run = async () => {
      if (!orderId || !success) {
        setMessage("Missing orderId or success parameter.");
        return;
      }

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.token = token;
        }

        const res = await fetch("/api/order/verifyStripe", {
          method: "POST",
          headers,
          body: JSON.stringify({ orderId, success }),
        });

        const data = (await res.json()) as { success?: boolean; message?: string };

        if (data.success) {
          setMessage(data.message ?? "Payment successful");
          await refresh();
          router.push("/orders");
          router.refresh();
          return;
        }

        setMessage(data.message ?? "Payment failed");
        router.push("/cart");
        router.refresh();
      } catch (err) {
        console.error(err);
        setMessage("Failed to verify payment");
      }
    };

    void run();
  }, [router, searchParams, refresh, token]);

  return (
    <div className="flex items-center justify-center">
      <p className="text-sm">{message}</p>
    </div>
  );
}
