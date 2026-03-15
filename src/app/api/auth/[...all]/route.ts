import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Build handler per request so getAuth() runs in request context (getCloudflareContext
// is available). toNextJsHandler expects the real auth object (with .handler), not our Proxy.
function createHandler() {
  return toNextJsHandler(getAuth());
}

export async function POST(request: Request) {
  return createHandler().POST(request);
}
export async function GET(request: Request) {
  return createHandler().GET(request);
}
export async function PATCH(request: Request) {
  return createHandler().PATCH(request);
}
export async function PUT(request: Request) {
  return createHandler().PUT(request);
}
export async function DELETE(request: Request) {
  return createHandler().DELETE(request);
}
