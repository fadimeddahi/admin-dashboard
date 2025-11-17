"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAdmin, storeAuthData, isAdmin } from "../../lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    setError("");
    try {
      console.log("Registering admin:", { username: formData.username, email: formData.email });
      const response = await registerAdmin(formData.username, formData.email, formData.password);
      console.log("Raw registration response:", response);
      
      let result = response;
      if (response instanceof Response) {
        result = await response.json();
        console.log("Parsed JSON response:", result);
      }
      
      if (result.token && result.user && result.user.username) {
        console.log("Token received:", result.token);
        storeAuthData(result.token, result.user.username);
        if (isAdmin()) {
          console.log("Admin privileges detected, redirecting to dashboard.");
          router.push("/dashboard");
        } else {
          console.warn("Registration succeeded, but admin privileges not detected.");
          setError("Registration succeeded, but admin privileges not detected.");
        }
      } else {
        console.error("Registration failed: No token returned.", result);
        setError("Registration failed: No token returned.");
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Registration failed. Please try again.");
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
            <p className="font-semibold mb-1">Registration Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
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
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="your@email.com"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-xs text-gray-400">
          Already have an account? <a href="/login" className="text-primary font-semibold">Login here</a>
        </div>
      </div>
    </div>
  );
}
