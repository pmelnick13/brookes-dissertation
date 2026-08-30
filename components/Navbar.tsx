// this navigation also changes its account links based on the session
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionStatus = {
  isLoggedIn: boolean;
  username: string | null;
};

export default function Navbar() {
  // null means the session check has not finished yet
  const [session, setSession] = useState<SessionStatus | null>(null);

  useEffect(() => {
    // check the login once when the navigation first appears
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data: SessionStatus = await response.json();
        setSession(data);
      } catch {
        // a failed check is safest to treat as logged out
        setSession({ isLoggedIn: false, username: null });
      }
    }

    loadSession();
  }, []);

  async function logout() {
    // clear the cookie and reload the dashboard as a guest
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
      <div className="container">
        <Link className="navbar-brand" href="/">
          Bet Transparency
        </Link>

        <div className="navbar-nav ms-auto align-items-lg-center">
          {/* these links are always available */}
          <Link className="nav-link" href="/">
            Dashboard
          </Link>

          <Link className="nav-link" href="/analyse">
            Analyse Bet
          </Link>

          <Link className="nav-link" href="/history">
            Bet History
          </Link>

          <Link className="nav-link" href="/simulation">
            Simulation
          </Link>

          <Link className="nav-link" href="/methodology">
            Methodology
          </Link>

          <Link className="nav-link" href="/about">
            About
          </Link>

          {/* swap the account controls once the session is known */}
          {session?.isLoggedIn ? (
            <>
              <span className="navbar-text ms-lg-3">
                {session.username}
              </span>

              <button
                type="button"
                className="btn btn-outline-light btn-sm ms-lg-2"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link ms-lg-3" href="/login">
                Login
              </Link>

              <Link className="btn btn-outline-light btn-sm" href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
