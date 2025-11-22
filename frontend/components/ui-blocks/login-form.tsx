"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, Role } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm({ role }: { role: Role }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const res = await loginUser(role, data);
      if (res.success) {
        console.log("Login successful:", res);
        router.push(`/${role}/dashboard`);
      } else {
        form.setError("root", {
          message: res.message || "Login failed. Please try again.",
        });
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      if (err.message) {
        if (
          err.message.includes("User not found") ||
          err.message.includes("404")
        ) {
          form.setError("email", { message: "User not found" });
        } else if (
          err.message.includes("Invalid credentials") ||
          err.message.includes("401")
        ) {
          form.setError("password", { message: "Invalid credentials" });
        } else {
          form.setError("root", { message: err.message });
        }
      } else {
        form.setError("root", {
          message: "Server error. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </CardTitle>
        <CardDescription>Login with your {role} credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <Input type="email" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Password</Label>
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm text-red-500">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : `Login as ${role}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
