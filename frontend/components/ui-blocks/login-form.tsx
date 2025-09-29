"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "superadmin" | "admin" | "reseller";

interface LoginFormProps extends React.ComponentProps<"div"> {
  role: Role;
}

export function LoginForm({ role, className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const titles: Record<Role, string> = {
    superadmin: "Super Admin Login",
    admin: "Admin Login",
    reseller: "Reseller Login",
  };

  const descriptions: Record<Role, string> = {
    superadmin: "Login with your super admin credentials",
    admin: "Login with your admin account",
    reseller: "Login to manage your reseller account",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${role}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // crucial for cookies
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      // redirect based on role
      router.push(`/${role}/dashboard`);
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{titles[role]}</CardTitle>
          <CardDescription>{descriptions[role]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Logging in..."
                    : `Login as ${titles[role].replace(" Login", "")}`}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
