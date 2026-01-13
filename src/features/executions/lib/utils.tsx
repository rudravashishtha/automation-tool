import { ExecutionStatus } from "@/generated/prisma";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

export const getStatusLabel = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return "Running";
    case ExecutionStatus.SUCCESS:
      return "Success";
    case ExecutionStatus.FAILED:
      return "Failed";
    default:
      return "Queued";
  }
};

export const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="text-blue-600 size-5 animate-spin" />;
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="text-green-600 size-5" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="text-red-600 size-5" />;
    default:
      return <ClockIcon className="text-muted-foreground size-5" />;
  }
};
