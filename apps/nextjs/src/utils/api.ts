import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@aeon/api";

export const api = createTRPCReact<AppRouter>();

export { type RouterInputs, type RouterOutputs } from "@aeon/api";
