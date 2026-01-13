"use client";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import type { Credential } from "@/generated/prisma";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { CREDENTIAL_LOGOS } from "@/config/constants";

export const CredentialsSearch = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  if (!credentials.data.totalPages) {
    return null;
  }

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonLabel="New Credential"
      disabled={disabled}
      newButtonHref="/credentials/new"
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    !!credentials.data.totalPages && (
      <EntityPagination
        disabled={credentials.isFetching}
        totalPages={credentials.data.totalPages}
        page={credentials.data.page}
        onPageChange={(page) => setParams({ ...params, page })}
      />
    )
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error loading credentials..." />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreateCredential = () => {
    router.push("/credentials/new");
  };

  return (
    <EmptyView
      onNew={handleCreateCredential}
      addNewLabel="Add Credential"
      message="No credentials found."
      messageSubtitle="Start by setting up a credential."
    />
  );
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const createdAt = new Date(data.createdAt);
  const updatedAt = new Date(data.updatedAt);
  const isUpdated = updatedAt.getTime() !== createdAt.getTime();

  const credentialLogo = CREDENTIAL_LOGOS[data.type] || CREDENTIAL_LOGOS.OPENAI;

  const handleRemoveCredential = () => {
    removeCredential.mutate({ id: data.id });
  };

  return (
    <EntityItem
      href={`credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          {isUpdated ? (
            <>
              Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}{" "}
              &bull; Created{" "}
              {formatDistanceToNow(createdAt, { addSuffix: true })}{" "}
            </>
          ) : (
            <>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</>
          )}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          {
            <Image
              src={credentialLogo}
              alt={data.type}
              width={20}
              height={20}
            />
          }
        </div>
      }
      onRemove={handleRemoveCredential}
      isRemoving={removeCredential.isPending}
    />
  );
};
