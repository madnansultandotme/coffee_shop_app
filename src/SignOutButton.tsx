"use client";
import { useAuth, useAuthActions } from "./lib/auth";

export function SignOutButton() {
  const { isAuthenticated } = useAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded bg-white text-secondary border border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-sm hover:shadow"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
