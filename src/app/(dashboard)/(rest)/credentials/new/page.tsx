import { CredentialForm } from "@/features/credentials/components/singleCredentialItem";
import { requireAuth } from "@/lib/auth-utils";

type Props = {};

const Page = (props: Props) => {
  requireAuth();
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <CredentialForm />
      </div>
    </div>
  );
};

export default Page;
