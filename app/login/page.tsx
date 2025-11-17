"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, storeAuthData, isAdmin } from "../../lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");

    try {
      const response = await login(data.username, data.password);
      
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
      
      let displayError = message || "Login failed. Please check your credentials.";
      if (message.includes("401")) {
        displayError = "Invalid username or password. Please try again.";
      } else if (message.includes("missing access token")) {
        displayError = "Server authentication error. The server did not return a token.";
      } else if (message.includes("Network error")) {
        displayError = "Network error. Check your connection and that the server is running.";
      } else {
        displayError = message;
      }
      
      setError(displayError);
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
            <p className="font-semibold mb-1">Login Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username or Email</Label>
            <Input
              type="text"
              id="username"
              placeholder="admin_user"
              disabled={isSubmitting}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-primary bg-zinc-800 border-zinc-700 rounded focus:ring-primary"
              {...register("rememberMe")}
            />
            <Label htmlFor="remember" className="ml-2 cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Remove API instructions and add register link */}
        <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-xs text-gray-400 text-center">
          Don&apos;t have an admin account? <a href="/register" className="text-primary font-semibold">Register here</a>
        </div>
      </div>
    </div>
  );
}
