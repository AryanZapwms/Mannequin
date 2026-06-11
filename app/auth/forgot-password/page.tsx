import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();

  if (session?.user) {
    const params = await searchParams;
    const nextUrl = typeof params?.next === "string" ? params.next : undefined;

    if (nextUrl) {
      redirect(nextUrl);
    } else {
      const role = session.user.role ?? "customer";
      redirect(role === "admin" || role === "staff" ? "/admin" : "/account");
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
