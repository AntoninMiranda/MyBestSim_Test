import { NextResponse, type NextRequest } from "next/server";
import { pickLocale } from "./i18n/config";

/** Redirige la racine vers la langue préférée du navigateur (français par défaut). */
export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: "/",
};
