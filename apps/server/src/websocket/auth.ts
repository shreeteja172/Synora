import { IncomingMessage } from "http";
import { getSessionFromHeaders } from "../lib/session";
import { prisma } from "../db";

export async function authenticate(request: IncomingMessage) {
  const cookieHeader = request.headers.cookie;
  const url = new URL(
    request.url || "",
    `http://${request.headers.host || "localhost"}`,
  );
  const token = url.searchParams.get("token");

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token: decodeURIComponent(token) },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  }

  if (!cookieHeader) {
    return null;
  }

  const session = await getSessionFromHeaders({ cookie: cookieHeader });

  if (!session) {
    return null;
  }

  return session.user;
}
