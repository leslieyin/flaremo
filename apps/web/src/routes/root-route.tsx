import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

// TanStack Router's ErrorComponentProps carries `error: unknown`; narrow it
// defensively instead of assuming an Error instance.
function RouteErrorPage({ error }: { error: unknown }) {
  const { t } = useI18n();
  const router = useRouter();
  const message = error instanceof Error ? error.message : String(error);
  // A lazy route chunk can fail to load after a new deployment: the open tab
  // still runs the old index.html, so its hashed chunk ids no longer exist.
  // A plain retry re-runs the same stale import; the real fix is to drop the
  // service worker's cached shell (which pins the old document) and reload so
  // the browser fetches the freshly deployed index.html and chunk graph.
  const isChunkLoadFailure =
    /Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      message,
    );
  const retry = async () => {
    if (isChunkLoadFailure) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch {
        // Cache clearing is best-effort; the reload below still retries.
      }
      window.location.reload();
      return;
    }
    await router.invalidate();
  };
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
      <div>
        <h1 className="text-lg font-semibold">{t("list.errorTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button onClick={() => void retry()}>{t("common.retry")}</Button>
    </main>
  );
}

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: RouteErrorPage,
});
