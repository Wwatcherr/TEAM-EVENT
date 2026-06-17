import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "team-events-auth";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET(request: NextRequest) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return NextResponse.json({ ok: true });

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  return NextResponse.json({ ok: cookie === expected });
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    // Aucun mot de passe configuré côté serveur : on laisse passer
    // pour ne pas bloquer l'app si la variable n'a pas été définie.
    return NextResponse.json({ ok: true });
  }

  if (password !== expected) {
    return NextResponse.json(
      { ok: false, error: "Mot de passe incorrect." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return response;
}
