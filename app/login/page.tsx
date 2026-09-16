import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USER } from "@/lib/db/seed";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--paper)] px-4 py-10">
      <main className="login-sheet w-full max-w-md p-6 md:p-8">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink-mute)] uppercase">
          Hiring manager · one login
        </p>
        <h1 className="mt-2 font-display text-3xl">Copy desk</h1>
        <p className="mt-2 font-serif text-sm leading-relaxed text-[var(--ink-mute)]">
          You are the buyer. One open req on the blotter. Keep or kill. Draft.
          Approve before any email or Ashby write.
        </p>
        {params.error ? (
          <p className="mt-3 border border-[var(--stamp)] px-2 py-1 font-serif text-sm text-[var(--stamp)]">
            No match on that blotter password.
          </p>
        ) : null}
        <form action={loginAction} className="mt-5 flex flex-col gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              defaultValue={DEMO_USER.email}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue={DEMO_USER.password}
              required
            />
          </div>
          <Button type="submit" variant="ink" size="lg">
            Open the desk
          </Button>
        </form>
        <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-[var(--ink-mute)] uppercase">
          Demo · {DEMO_USER.email} · {DEMO_USER.password}
        </p>
      </main>
    </div>
  );
}
