import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/workspace/Workspace";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace \u2014 JSON\u2011Table" },
      {
        name: "description",
        content:
          "Explore, search, sort, and filter JSON as a navigable tree plus a fast spreadsheet grid.",
      },
      { property: "og:title", content: "JSON\u2011Table Workspace" },
      {
        property: "og:description",
        content: "Explore, search, sort, and filter JSON as a spreadsheet.",
      },
      { property: "og:url", content: "/workspace" },
    ],
    links: [{ rel: "canonical", href: "/workspace" }],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  return <Workspace />;
}
