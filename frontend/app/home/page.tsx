"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

export default function HomeRedirect() {
  const router = useRouter();

  // No more local fetch("/api/me") — reads the single fetch done once in
  // <UserProvider> (app/layout.tsx).
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (user.role === "admin") {
      router.replace("/home/admin");
    } else if (user.role === "hr") {
      router.replace("/home/hr");
    } else if (user.role === "applicant") {
      router.replace("/home/applicant");
    } else {
      router.replace("/");
    }
  }, [loading, user, router]);

  return null;
}