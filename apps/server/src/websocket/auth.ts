import { IncomingMessage } from "http";
import { getSessionFromHeaders } from "../lib/session";

export async function authenticate(request: IncomingMessage) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return null;
  }

  return session.user;
}
