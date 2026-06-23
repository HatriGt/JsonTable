import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Workspace } from "@/components/workspace/Workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { useWorkspace } from "@/store/workspace";
import { decodeShare, readShareToken } from "@/lib/share/share";

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

  // A shared link carries the document in the URL fragment (#share=…).
  // Load it on arrival, then clear the hash so the address bar stays tidy.
  useEffect(() => {
    const token = readShareToken(window.location.hash);
    if (!token) return;
    let cancelled = false;
    void (async () => {
      const shared = await decodeShare(token);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      if (cancelled) return;
      if (!shared) {
        toast.error("This share link is invalid or corrupted");
        return;
      }
      const ok = await loadJson(shared.name, shared.raw);
      if (!ok && !cancelled) toast.error("The shared JSON could not be parsed");
    })();
    return () => {
      cancelled = true;
    };
  }, [loadJson]);

  useEffect(() => {
    if (doc || sessionStorage.getItem(PENDING_SAMPLE_KEY) !== "1") return;
    sessionStorage.removeItem(PENDING_SAMPLE_KEY);
    void loadJson("sample.json", SAMPLE_JSON);
  }, [doc, loadJson]);

  return <Workspace />;
}
