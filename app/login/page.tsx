"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, storeAuthData, isAdmin } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(username, password);
      
      if (!response.token && !response.access_token) {
        setError("Server did not return an authentication token. Please contact support.");
        return;
      }
      
      // Store auth data
      storeAuthData(response.token || response.access_token, response.username);
      
      // Check if user is admin
      if (isAdmin()) {
        router.push("/dashboard");
      } else {
        setError("Access denied. Admin privileges required.");
        // Clear non-admin user data
        localStorage.clear();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Login error:", err);
      
      // Provide specific error messages
      let displayError = message || "Login failed. Please check your credentials.";
      if (message.includes("401")) {
        displayError = "❌ Invalid username or password. Please try again.";
      } else if (message.includes("missing access token")) {
        displayError = "❌ Server authentication error. The server did not return a token.";
      } else if (message.includes("Network error")) {
        displayError = "❌ Network error. Check your connection and that the server is running.";
      } else {
        displayError = `❌ ${message}`;
      }
      
      setError(displayError);
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
          <h1 className="text-3xl font-bold text-primary mb-2">Admin Panel</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold mb-1">⚠️ Login Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg mb-6 text-sm">
          <p className="font-semibold mb-1">💡 Test Credentials:</p>
          <p>Create an admin account via API first, or use existing credentials.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username or Email
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary bg-zinc-800 border-zinc-700 rounded focus:ring-primary"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Remove API instructions and add register link */}
        <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-xs text-gray-400 text-center">
          Don&apos;t have an admin account? <a href="/register" className="text-primary font-semibold">Register here</a>
        </div>
      </div>
    </div>
  );
}
