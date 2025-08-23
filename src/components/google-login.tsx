"use client";

import { useState } from "react";
import { init } from "@instantdb/react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const APP_ID = "e772f383-a74f-4430-ad40-46231804e3f3";

const db = init({ appId: APP_ID });

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_NAME = import.meta.env.VITE_GOOGLE_CLIENT_NAME;

export function GoogleLoginButton() {
  const [nonce] = useState(crypto.randomUUID());
  const navigate = useNavigate({ from: "/login" });

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        nonce={nonce}
        onError={() => toast.error("Login failed")}
        onSuccess={({ credential }) => {
          db.auth
            .signInWithIdToken({
              clientName: GOOGLE_CLIENT_NAME,
              idToken: credential!,
              nonce,
            })
            .then(() => navigate({ to: "/" }))
            .catch((err) => {
              toast.error(err.body?.message);
            });
        }}
      />
    </GoogleOAuthProvider>
  );
}
