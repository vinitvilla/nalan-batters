"use client";

import React from "react";
import { UserAuthFlow } from "@/components/auth/UserAuthFlow";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";

export default function SignInPage() {
  const router = useRouter();

  return (
    <>
      <main
        style={{
          padding: "2rem",
          maxWidth: 400,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "2rem",
            letterSpacing: "1px",
          }}
        >
          Nalan Batters
        </h1>
        <UserAuthFlow
          onSuccess={(user) => {
            userStore.getState().setPhone(user.phone);
            userStore.getState().setUser({
              id: user.id,
              phone: user.phone,
              fullName: user.fullName || ""
            });
            router.push("/");
          }}
        />
      </main>
    </>
  );
}
