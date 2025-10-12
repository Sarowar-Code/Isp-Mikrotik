"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <Card className="max-w-md w-full shadow-lg border border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            401 - Unauthorized
          </CardTitle>
          <p className="text-gray-500 mt-2">
            You don’t have permission to access this page.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 mt-4">
          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
