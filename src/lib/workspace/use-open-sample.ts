import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";

/**
 * Returns a callback that loads the sample document into the store and then
 * navigates to the workspace. Loading before navigating means the workspace
 * mounts with a document already present, so the user lands on the populated
 * tree + grid instead of the empty "Open a JSON file" state (no flash).
 */
export function useOpenSampleWorkspace() {
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);

  return useCallback(async () => {
    await loadJson("sample.json", SAMPLE_JSON);
    navigate({ to: "/workspace" });
  }, [loadJson, navigate]);
}
