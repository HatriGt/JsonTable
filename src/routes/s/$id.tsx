import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetchShortLink } from "@/lib/share/share.functions";
import { useWorkspace } from "@/store/workspace";

export const Route = createFileRoute("/s/$id")({
  head: () => ({
    meta: [{ title: "Opening shared JSON — JSON‑Table" }, { name: "robots", content: "noindex" }],
  }),
  component: ShortLinkPage,
});

function ShortLinkPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);

  // Resolve the short link server-side, load the JSON into the workspace, then
  // redirect to /workspace. Mirrors the inline #share= load in workspace.tsx.
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
        void navigate({ to: "/workspace" });
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

  return (
    <div className="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Opening shared JSON…
    </div>
  );
}
