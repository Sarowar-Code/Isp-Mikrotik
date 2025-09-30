import { LoginForm } from "@/components/ui-blocks/login-form.tsx";

export default function ResellerLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm role="reseller" />
      </div>
    </div>
  );
}
