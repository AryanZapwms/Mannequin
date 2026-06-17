import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-brand-cream p-6 md:p-10">
      <div className="w-full max-w-md">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
