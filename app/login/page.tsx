"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useShop } from "@/app/providers";

export default function LoginPage() {
  const router = useRouter();
  const { token } = useShop();
  const [currentState, setCurrentState] = useState<"Login" | "Sign Up">("Login");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (currentState === "Sign Up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        router.push("/");
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      router.push("/");
      router.refresh();
    }
  }, [token, router]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Login" ? null : (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
          name="name"
        />
      )}

      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        name="email"
      />
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        name="password"
      />
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password</p>
        {currentState === "Login" ? (
          <p onClick={() => setCurrentState("Sign Up")} className="cursor-pointer">
            Create Account
          </p>
        ) : (
          <p onClick={() => setCurrentState("Login")} className="cursor-pointer">
            Login Here
          </p>
        )}
      </div>

      {error ? <p className="text-sm text-red-600 w-full">{error}</p> : null}

      <button className="px-8 py-2 mt-4 font-light text-white bg-black" disabled={loading}>
        {currentState === "Login" ? (loading ? "Signing in..." : "Sign in") : loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
