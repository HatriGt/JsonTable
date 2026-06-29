import { createFileRoute, redirect } from "@tanstack/react-router";

// The formatter is now part of the unified JSON Viewer & Formatter at
// /json-viewer (Tree / Formatted toggle). Permanently redirect the old URL so
// existing links and search results land on the combined tool.
export const Route = createFileRoute("/json-formatter")({
  beforeLoad: () => {
    throw redirect({ to: "/json-viewer", statusCode: 301 });
  },
});
