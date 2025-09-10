import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }
  return (
    <div>
      page
      <div>{session.user.email}</div>
      <div>{session.user.name}</div>
      <div>{session.session.expiresAt.toString()}</div>
    </div>
  );
}
