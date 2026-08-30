// this form handles both logging in and making a new account
"use client";

import { useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  // keep each form value and its current status in react state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // this saves repeating the full mode check below
  const isRegistering = mode === "register";

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    // stay on the same page and clear any older error
    event.preventDefault();
    setError("");

    if (isRegistering && password !== confirmPassword) {
      // only registration needs the two password boxes to match
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      // choose the matching api route from the form mode
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // keep the form open when the server rejects the details
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // reload the dashboard so the navigation sees the new session
      window.location.href = "/";
    } catch {
      // this covers a network problem rather than a rejected login
      setError("The server could not be reached.");
    } finally {
      // make sure the button becomes usable again either way
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* both account modes always need a username */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>

            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={3}
              maxLength={30}
              autoComplete="username"
              required
            />
          </div>

          {/* the browser adjusts autocomplete based on the current mode */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
            />

            {isRegistering && (
              <div className="form-text">
                Password must be at least 8 characters long.
              </div>
            )}
          </div>

          {/* only new accounts need to repeat the password */}
          {isRegistering && (
            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {/* show any validation or server error in the same place */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* disable this while the api request is still running */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Create Account"
                : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
