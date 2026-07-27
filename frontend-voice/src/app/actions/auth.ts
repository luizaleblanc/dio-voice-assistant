"use server";

import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:8080/auth";

export async function loginBFF(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciais inválidas");
    }

    const data = await response.json();

    const cookieStore = await cookies();
    
    cookieStore.set("organiza_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, 
      path: "/",
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function logoutBFF() {
  const cookieStore = await cookies();
  cookieStore.delete("organiza_token");
}

export async function registerBFF(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(`${BACKEND_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const fieldErrors = (await response.json()) as Record<string, string>;
        throw new Error(Object.values(fieldErrors).join(" "));
      }

      const errorMsg = await response.text();
      throw new Error(errorMsg || "Erro ao cadastrar");
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}