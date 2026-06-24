import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetchShortLink } from "@/lib/share/share.functions";
import { useWorkspace } from "@/store/workspace";

export const Route = createFileRoute("/workspace/link/$id")({
  head: () => ({
    meta: [{ title: "Opening shared JSON — JSON‑Table" }, { name: "robots", content: "noindex" }],
  }),
  component: SharedLinkPage,
});

function SharedLinkPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);
  const [loading, setLoading] = useState(true);

  // Resolve the short link server-side and load it into the workspace. Unlike
  // the old /s/$id route we keep the URL (/workspace/link/$id) so it stays
  // copyable and reusable from the address bar. Only invalid/expired links
  // redirect away to the bare workspace.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const shared = await fetchShortLink({ data: { id } });
        if (cancelled) return;
        if (!shared) {
          toast.error("This share link is invalid or has expired");
          void navigate({ to: "/workspace" });
          return;
        }
        const ok = await loadJson(shared.name, shared.raw);
        if (cancelled) return;
        if (!ok) toast.error("The shared JSON could not be parsed");
        setLoading(false);
      } catch {
        if (cancelled) return;
        toast.error("Could not open this share link");
        void navigate({ to: "/workspace" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadJson, navigate]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gap-2 bg-background/80 text-sm text-muted-foreground backdrop-blur-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      Opening shared JSON…
    </div>
  );
}
