// this page uses the shared account form in register mode
import Link from "next/link";

import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="container py-5">
      {/* keep the account form narrow enough to read comfortably */}
      <div className="mx-auto" style={{ maxWidth: "500px" }}>
        <h1>Create Account</h1>

        <p className="text-muted">
          Create an account to save your bet analyses.
        </p>

        <AuthForm mode="register" />

        {/* existing users can head back to login here */}
        <p className="mt-3">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
