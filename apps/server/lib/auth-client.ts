import { createAuthClient } from "better-auth/react";
import axios from "axios";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;

type GoogleIdTokenPayload = {
  token: string;
  accessToken?: string;
};

export async function signInWithGoogle(callbackURL?: string) {
  return authClient.signIn.social({
    provider: "google",
    callbackURL,
  });
}

export async function signInWithGoogleIdToken(idToken: GoogleIdTokenPayload) {
  return authClient.signIn.social({
    provider: "google",
    idToken,
  });
}

type SignUpEmailInput = {
  name: string;
  email: string;
  password: string;
  callbackURL?: string;
};

export async function signUpWithEmail(input: SignUpEmailInput) {
  try {
    const { data } = await axios.post("/api/register", {
      name: input.name,
      email: input.email,
      password: input.password,
    });

    return data;
  } catch (err) {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : err instanceof Error
          ? err.message
          : String(err);
    throw new Error(message || "Failed to register");
  }
}

type SignInEmailInput = {
  email: string;
  password: string;
  callbackURL?: string;
};

export async function signInWithEmail(input: SignInEmailInput) {
  const result = await authClient.signIn.email({
    email: input.email,
    password: input.password,
    callbackURL: input.callbackURL,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to sign in");
  }

  return result.data;
}