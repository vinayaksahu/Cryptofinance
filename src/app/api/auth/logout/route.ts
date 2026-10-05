import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  // Clear main session cookie
  response.cookies.set("df_session", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  response.cookies.delete("df_session");

  // Clear any backup / impersonator cookies
  response.cookies.delete("df_impersonator");
  response.cookies.delete("df_superroot_backup");

  return response;
}

export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  
  response.cookies.set("df_session", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  response.cookies.delete("df_session");
  response.cookies.delete("df_impersonator");
  response.cookies.delete("df_superroot_backup");

  return response;
}