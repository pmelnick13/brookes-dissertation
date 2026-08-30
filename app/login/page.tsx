// this page uses the shared account form in login mode
import Link from "next/link";

import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="container py-5">
      {/* keep the account form narrow enough to read comfortably */}
      <div className="mx-auto" style={{ maxWidth: "500px" }}>
        <h1>Login</h1>

        <p className="text-muted">
          Login to access your saved bet analyses.
        </p>

        <AuthForm mode="login" />

        {/* new users can jump straight to registration here */}
        <p className="mt-3">
          Need an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
}
