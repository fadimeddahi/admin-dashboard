"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { registerAdmin, storeAuthData, isAdmin } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("Registering admin:", { username, email, password });
      const response = await registerAdmin(username, email, password);
      console.log("Raw registration response:", response);
      // If response is a Response object, parse JSON
      let data = response;
      if (response instanceof Response) {
        data = await response.json();
        console.log("Parsed JSON response:", data);
      }
      if (data.token && data.user && data.user.username) {
        console.log("Token received:", data.token);
        storeAuthData(data.token, data.user.username);
        if (isAdmin()) {
          console.log("Admin privileges detected, redirecting to dashboard.");
          router.push("/dashboard");
        } else {
          console.warn("Registration succeeded, but admin privileges not detected.");
          setError("Registration succeeded, but admin privileges not detected.");
        }
      } else {
        console.error("Registration failed: No token returned.", data);
        setError("Registration failed: No token returned.");
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-zinc-800">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={150} 
              height={150}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Admin Registration</h1>
          <p className="text-gray-400">Create a new admin account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold mb-1">⚠️ Registration Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              placeholder="admin_user"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-xs text-gray-400">
          Already have an account? <a href="/login" className="text-primary font-semibold">Login here</a>
        </div>
      </div>
    </div>
  );
}
