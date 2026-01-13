import { parseAsInteger } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

// Clear On Default: Clear query param on default value (page=1 or search="")

export const executionsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEAFULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
};
