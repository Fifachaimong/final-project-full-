"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const res = await fetch("/api/me");

      if (!res.ok) {
        router.replace("/");
        return;
      }

      const user = await res.json();

      if (user.role_id === 1) {
        router.replace("/home/admin");
      } else if (user.role_id === 2) {
        router.replace("/home/hr");
      } else if (user.role_id === 3) {
        router.replace("/home/applicant");
      } else {
        router.replace("/");
      }
    }

    checkUser();
  }, [router]);

  return null;
}