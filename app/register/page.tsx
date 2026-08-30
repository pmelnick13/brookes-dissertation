import Link from "next/link";

import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: "500px" }}>
        <h1>Create Account</h1>

        <p className="text-muted">
          Create an account to save your bet analyses.
        </p>

        <AuthForm mode="register" />

        <p className="mt-3">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
