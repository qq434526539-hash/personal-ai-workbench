import type { NextRequest } from "next/server";

function hostname(value: string) {
  try {
    return new URL(`http://${value}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function allowedHosts() {
  return new Set(
    [
      "localhost",
      "127.0.0.1",
      "::1",
      ...(process.env.WORKBENCH_ALLOWED_HOSTS || "").split(","),
    ]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedRequest(req: NextRequest, checkOrigin = false) {
  const allowed = allowedHosts();
  if (!allowed.has(hostname(req.headers.get("host") || ""))) return false;
  if (!checkOrigin) return true;

  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return allowed.has(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}
