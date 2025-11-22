import { CredentialType } from "@/generated/prisma";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEAFULT_PAGE_SIZE: 5,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
};

export const toasterPositions = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
] as const;

export const CREDENTIAL_TYPE_OPTIONS = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/logos/gemini.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic (Claude)",
    logo: "/logos/anthropic.svg",
  },
  {
    value: CredentialType.DEEPSEEK,
    label: "Deepseek",
    logo: "/logos/deepseek.svg",
  },
  {
    value: CredentialType.GROK,
    label: "Grok",
    logo: "/logos/grok.svg",
  },
];

export const CREDENTIAL_LOGOS: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.DEEPSEEK]: "/logos/deepseek.svg",
  [CredentialType.GROK]: "/logos/grok.svg",
};
