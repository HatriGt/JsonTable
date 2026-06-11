import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Workspace } from "@/components/workspace/Workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { useWorkspace } from "@/store/workspace";

const PENDING_SAMPLE_KEY = "json-table:pending-sample";

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
  const doc = useWorkspace((s) => s.doc);
  const loadJson = useWorkspace((s) => s.loadJson);

  useEffect(() => {
    if (doc || sessionStorage.getItem(PENDING_SAMPLE_KEY) !== "1") return;
    sessionStorage.removeItem(PENDING_SAMPLE_KEY);
    void loadJson("sample.json", SAMPLE_JSON);
  }, [doc, loadJson]);

  return <Workspace />;
}
