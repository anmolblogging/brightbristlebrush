import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Visitors from these countries see the "not available" page instead of the site.
const BLOCKED_COUNTRIES = new Set(["IN"]);

// Private access: opening any page with ?access=<SITE_ACCESS_KEY> stores a cookie
// that lets that browser see the site from a blocked country.
const ACCESS_PARAM = "access";
const ACCESS_COOKIE = "bb_access";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const key = process.env.SITE_ACCESS_KEY;
  const { nextUrl } = request;

  const offered = nextUrl.searchParams.get(ACCESS_PARAM);
  if (offered !== null) {
    const clean = nextUrl.clone();
    clean.searchParams.delete(ACCESS_PARAM);
    const response = NextResponse.redirect(clean);
    if (key && offered === key) {
      response.cookies.set(ACCESS_COOKIE, key, {
        maxAge: ONE_YEAR,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return response;
  }

  // Set by Vercel's edge network from the visitor's IP address.
  const country = request.headers.get("x-vercel-ip-country");
  if (!country || !BLOCKED_COUNTRIES.has(country.toUpperCase())) return NextResponse.next();
  if (key && request.cookies.get(ACCESS_COOKIE)?.value === key) return NextResponse.next();

  return new NextResponse(UNAVAILABLE_HTML, {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const config = {
  // Everything except Next.js build assets, so files in public/ are covered too.
  matcher: "/((?!_next/static).*)",
};

const UNAVAILABLE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Not available in your region — Bright Brush and Bristle Works India</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; margin: 0; }
  body {
    min-height: 100vh; display: grid; place-items: center; padding: 24px;
    background: #fbf9f4; color: #1c1917;
    font-family: "Crimson Pro", Georgia, "Times New Roman", serif;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 520px; text-align: center; }
  .rule { width: 56px; height: 3px; background: #c47a2c; margin: 0 auto 28px; }
  .label {
    font-family: ui-monospace, Menlo, monospace; font-size: 12px;
    letter-spacing: 0.18em; text-transform: uppercase; color: #9a5a22; margin-bottom: 14px;
  }
  h1 { font-size: clamp(30px, 6vw, 42px); font-weight: 600; line-height: 1.15; margin-bottom: 18px; }
  p { font-size: 19px; line-height: 1.6; color: #615a52; }
</style>
</head>
<body>
<main>
  <div class="rule"></div>
  <p class="label">Bright Brush and Bristle Works India</p>
  <h1>This site is not available in your region</h1>
  <p>We're sorry, but this website can't be viewed from your current location.</p>
</main>
</body>
</html>`;
