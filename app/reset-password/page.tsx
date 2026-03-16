import { Suspense } from "react";
import { ResetPassword } from "@/components/pages/auth/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
