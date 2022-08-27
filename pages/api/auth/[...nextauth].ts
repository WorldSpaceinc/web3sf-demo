import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY || "";
const sdk = ThirdwebSDK.fromPrivateKey(privateKey, "mainnet");

export const getNextAuthConfig = (req: NextApiRequest, res: NextApiResponse) => {
  const config: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
      CredentialsProvider({
        name: "ThirdwebAuth",
        credentials: {
          payload: {
            label: "Payload",
            type: "text",
            placeholder: ""
          },
        },
        async authorize({ payload }: any) {
          try {
            const parsed = JSON.parse(payload);
            const token = await sdk.auth.generateAuthToken("thirdweb.com", parsed);
            const address = await sdk.auth.authenticate("thirdweb.com", token);

            // Securely set httpOnly cookie on request to prevent XSS on frontend
            // And set path to / to enable thirdweb_auth_token usage on all endpoints
            res.setHeader(
              "Set-Cookie",
              serialize("thirdweb_auth_token", token, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
              })
            );

            return { address }
          } catch (err) {
            return null
          }
        },
      }),
    ],
    callbacks: {
      async session({ session }) {
        const token = req.cookies.thirdweb_auth_token || "";
        try {
          const address = await sdk.auth.authenticate("thirdweb.com", token);
          session.user = { ...session.user, address } as Session["user"];
          return session;
        } catch {
          return session;
        }
      },
    },
    events: {
      signOut() {
        res.setHeader(
          "Set-Cookie",
          serialize("thirdweb_auth_token", "", {
            path: "/",
            expires: new Date(Date.now() + 5 * 1000),
          })
        );
      }
    }
  }

  return config;
}

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, getNextAuthConfig(req, res))
}

export default handler;