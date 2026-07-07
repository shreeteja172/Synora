import { IncomingMessage } from "http";
import { getSessionFromHeaders } from "../lib/session";

export async function authenticate(request: IncomingMessage) {
  const cookieHeader = request.headers.cookie;
  const url = new URL(
    request.url || "",
    `http://${request.headers.host || "localhost"}`,
  );
  const token = url.searchParams.get("token");

  const headers = cookieHeader
    ? { cookie: cookieHeader }
    : token
      ? { cookie: `better-auth.session_token=${decodeURIComponent(token)}` }
      : null;

  if (!headers) {
    return null;
  }

  const session = await getSessionFromHeaders(headers);

  if (!session) {
    return null;
  }

  return session.user;
}
