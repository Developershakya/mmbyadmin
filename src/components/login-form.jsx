"use client"
import React, { useState } from "react"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function LoginForm({ className, ...props }) {
  const router = useRouter()
  const redirectTo = router.query.redirect || "/"

  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function switchMode(loginMode) {
    setIsLogin(loginMode)
    setError("")
    setForm({ name: "", email: "", password: "", confirmPassword: "" })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Password match nahi ho raha")
      return
    }

    setLoading(true)
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (isLogin ? "Login fail ho gaya" : "Registration fail ho gaya"))
        setLoading(false)
        return
      }

      router.push(redirectTo)
    } catch (err) {
      setError("Kuch galat ho gaya, dobara try karo")
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen",
        className
      )}
      {...props}
    >
      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full">
        {/* Card */}
        <div className="w-full bg-white/90 backdrop-blur-lg rounded-2xl p-18 space-y-6">
          {/* Logo / Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-800">
              {isLogin ? "Welcome Back 👋" : "Create Account ✨"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Login to continue your journey"
                : "Sign up and start your journey with us"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-lg p-1">
            <button
              className={cn(
                "w-1/2 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer",
                isLogin
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : "text-gray-600"
              )}
              type="button"
              onClick={() => switchMode(true)}
            >
              Login
            </button>
            <button
              className={cn(
                "w-1/2 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer",
                !isLogin
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : "text-gray-600"
              )}
              type="button"
              onClick={() => switchMode(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 mb-1 block">
                  Full Name
                </Label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                Password
              </Label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Confirm Password
                </Label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Remember / Forgot */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded text-orange-500" />
                  Remember me
                </label>
       <a         
  href="#"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-4">
            By continuing, you agree to our{" "}
            <Link href="/termAndCondition" className="text-orange-600 hover:text-orange-700 font-medium">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
        <div>
          <div>
            <img
              src="https://i.pinimg.com/originals/16/b3/a6/16b3a615a18d4e5a2c93962a4f047fae.gif"
              alt="auth-illustration"
              className="rounded-xl shadow-lg w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}