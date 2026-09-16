import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getPushConfig, subscribeToPush, unsubscribeFromPush } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { errorMessage } from "@/lib/error";

/**
 * Web Push opt-in for proactive reminders (daily review, overdue tasks).
 * Requires Notification permission plus a browser PushManager; the server
 * only accepts subscriptions when both VAPID keys are configured.
 */
export function PushPanel() {
  const { t } = useI18n();
  const configQuery = useQuery({
    queryKey: ["push-config"],
    queryFn: getPushConfig,
    retry: false,
  });
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
  );

  const invalidate = () => {
    void configQuery.refetch();
  };

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const config = configQuery.data;
      if (!config?.public_key) {
        throw new Error(t("push.unconfigured"));
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(t("push.permissionDenied"));
      }
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeBase64Url(
            config.public_key,
          ) as unknown as BufferSource,
        });
      }
      const json = subscription.toJSON() as {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      };
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error(t("push.subscribeFailed"));
      }
      await subscribeToPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
    },
    onSuccess: () => {
      toast.success(t("push.subscribed"));
      invalidate();
    },
    onError: (error) =>
      toast.error(errorMessage(error, t("push.subscribeFailed"))),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
    },
    onSuccess: () => toast.success(t("push.unsubscribed")),
    onError: (error) =>
      toast.error(errorMessage(error, t("push.unsubscribeFailed"))),
    onSettled: invalidate,
  });

  if (!supported) return null;
  const enabled = (configQuery.data?.subscriptions ?? 0) > 0;
  const configured = Boolean(configQuery.data?.public_key);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("push.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">{t("push.description")}</p>
        {!configured ? (
          <p className="text-xs text-muted-foreground">
            {t("push.notConfigured")}
          </p>
        ) : (
          <Button
            disabled={
              subscribeMutation.isPending || unsubscribeMutation.isPending
            }
            size="sm"
            type="button"
            variant={enabled ? "outline" : "default"}
            onClick={() =>
              enabled
                ? unsubscribeMutation.mutate()
                : subscribeMutation.mutate()
            }
          >
            {enabled ? t("push.disable") : t("push.enable")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
