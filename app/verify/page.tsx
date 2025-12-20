import { Suspense } from "react";
import VerifyClient from "@/app/verify/VerifyClient";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <main className="min-h-screen space-y-6 pt-10 border-t">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <p className="text-sm">Verifying payment...</p>
          </div>
        }
      >
        <VerifyClient />
      </Suspense>
    </main>
  );
}
