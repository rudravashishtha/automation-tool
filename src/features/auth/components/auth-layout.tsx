import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted flex min-h-svh items-center flex-col justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 self-center font-semibold text-xl text-foreground"
        >
          <div className="relative h-10 w-10">
            <Image
              src="/logos/logo.svg"
              alt="AutoAid"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="tracking-tight">AutoAid</span>
        </Link>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
