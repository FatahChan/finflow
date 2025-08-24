"use client";

import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import * as jose from "jose";
import { db } from "@/lib/instant-db";
import { id } from "@instantdb/react";
import { clientEnv } from "@/lib/client-env";

const GOOGLE_CLIENT_ID = clientEnv.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_NAME = clientEnv.VITE_GOOGLE_CLIENT_NAME;

type jwtDecoded = Partial<{
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  nonce: string;
  nbf: number;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}>;

export function GoogleLoginButton() {
  const [nonce] = useState(crypto.randomUUID());
  const navigate = useNavigate({ from: "/login" });

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        nonce={nonce}
        size="large"
        shape="circle"
        theme="filled_blue"
        onError={() => toast.error("Login failed")}
        onSuccess={({ credential }) => {
          const jwt: jwtDecoded = jose.decodeJwt(credential!);
          db.auth
            .signInWithIdToken({
              clientName: GOOGLE_CLIENT_NAME,
              idToken: credential!,
              nonce,
            })
            .then(() => db.getAuth())
            .then((auth) => {
              const _id = id();
              db.transact([
                db.tx.profiles[_id].create({
                  name: jwt.name,
                  picture: jwt.picture,
                }),
                db.tx.profiles[_id].link({
                  user: auth!.id,
                }),
              ]);
            })
            .then(() => navigate({ to: "/dashboard/home" }))
            .catch((err) => {
              toast.error(err.body?.message);
            });
        }}
      />
    </GoogleOAuthProvider>
  );
}
