import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SHARE_SERVER_MAX_BYTES } from "./share";
import { getShare, putShare } from "./store.server";

// Server functions for the server-backed short-link path. The .handler body is
// server-only, so the store.server import is tree-shaken from the client bundle.

export const createShortLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().max(512),
      raw: z.string().max(SHARE_SERVER_MAX_BYTES),
    }),
  )
  .handler(async ({ data }) => {
    const id = await putShare({ name: data.name, raw: data.raw });
    return { id };
  });

export const fetchShortLink = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    return await getShare(data.id);
  });
