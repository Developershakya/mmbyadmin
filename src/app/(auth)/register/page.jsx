"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration fail ho gaya");
        setLoading(false);
        return;
      }
      router.push(redirectTo);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg border border-gray-200">
      <h1 className="text-xl font-bold text-blue-900 mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full border border-gray-300 rounded-lg p-2.5"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border border-gray-300 rounded-lg p-2.5"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="w-full border border-gray-300 rounded-lg p-2.5"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg"
        >
          {loading ? "Please wait..." : "Register"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        I already have an account?{" "}
        <Link href={`/login?redirect=${redirectTo}`} className="text-blue-900 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}