import { IncomingMessage } from "http";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../routes/auth";

export async function authenticate(request: IncomingMessage) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return null;
  }

  return session.user;
}