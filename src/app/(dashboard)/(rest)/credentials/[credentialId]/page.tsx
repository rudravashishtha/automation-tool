import React from "react";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

import { requireAuth } from "@/lib/auth-utils";

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;
  return <div>Credential Id: {credentialId}</div>;
};

export default Page;
