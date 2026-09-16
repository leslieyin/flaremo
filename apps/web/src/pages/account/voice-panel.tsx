import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  deleteVoiceSettings,
  getVoiceSettings,
  saveVoiceSettings,
  testVoiceSettings,
  type VoiceSettings,
} from "@/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/i18n";

type CredentialField = "appId" | "secretId" | "secretKey" | "apiKey";
const TENCENT_FIELDS: CredentialField[] = ["appId", "secretId", "secretKey"];
const PROVIDERS = ["tencent", "dashscope"] as const;
type Provider = (typeof PROVIDERS)[number];

// Mounted only after a fresh, user-scoped owner permission check succeeds.
export function VoicePanel() {
  const cache = useQueryClient();
  const { t } = useI18n();
  const mounted = useRef(false);
  const [config, setConfig] = useState<VoiceSettings | null>(null);
  const [provider, setProvider] = useState<Provider>("tencent");
  const [model, setModel] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [fields, setFields] = useState({
    appId: "",
    secretId: "",
    secretKey: "",
    apiKey: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    void getVoiceSettings()
      .then((value) => {
        if (!active) return;
        setConfig(value);
        setProvider(value.provider ?? "tencent");
        setModel(value.model);
        setEnabled(value.enabled);
      })
      .catch(() => {
        if (active) setMessage(t("voiceSettings.loadError"));
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [t]);

  // Environment credentials take precedence over anything saved here, so
  // editing the database copy while they are active would be misleading.
  const envManaged = config?.source === "environment";
  const editingDisabled =
    busy || envManaged || !config || (config.unreadable ?? false);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      if (!mounted.current) return;
      setFields({ appId: "", secretId: "", secretKey: "", apiKey: "" });
      const value = await getVoiceSettings();
      if (!mounted.current) return;
      setConfig(value);
      setEnabled(value.enabled);
      setProvider(value.provider ?? "tencent");
      setModel(value.model);
      await cache.invalidateQueries({ queryKey: ["capture-status"] });
      setMessage(success);
    } catch {
      if (!mounted.current) return;
      setMessage(t("voiceSettings.error"));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  const previewFor = (field: CredentialField) => {
    if (provider !== (config?.provider ?? provider)) return "";
    return config?.previews?.[field] ?? "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("voiceSettings.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          {t("voiceSettings.description")} {t("voiceSettings.migration")}
        </p>
        {config && (
          <>
            <p>
              {envManaged
                ? t("voiceSettings.envManaged")
                : config.configured
                  ? t("voiceSettings.configured")
                  : t("voiceSettings.unconfigured")}
            </p>
            {!config.canEncrypt && <p>{t("voiceSettings.plainStore")}</p>}
            {config.unreadable && <p>{t("voiceSettings.unreadable")}</p>}
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void run(
                  () =>
                    saveVoiceSettings({
                      revision: config.revision,
                      enabled,
                      credentials: { provider, model, ...fields },
                    }),
                  t("voiceSettings.saved"),
                );
              }}
            >
              <div className="flex flex-col gap-1.5 text-sm font-medium">
                <span>{t("voiceSettings.provider")}</span>
                <ToggleGroup
                  variant="outline"
                  value={provider ? [provider] : []}
                  disabled={editingDisabled}
                  onValueChange={(values) => {
                    if (values.length === 0) return;
                    setProvider(values[values.length - 1] as Provider);
                    setModel("");
                    setFields({
                      appId: "",
                      secretId: "",
                      secretKey: "",
                      apiKey: "",
                    });
                  }}
                >
                  <ToggleGroupItem value="tencent">
                    {t("voiceSettings.tencent")}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dashscope">DashScope</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <label
                className="flex flex-col gap-1.5 text-sm font-medium"
                htmlFor="voice-model"
              >
                {t("voiceSettings.model")}
                <Input
                  autoComplete="off"
                  disabled={editingDisabled}
                  id="voice-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                />
              </label>
              {(provider === "tencent"
                ? TENCENT_FIELDS
                : (["apiKey"] as const)
              ).map((field) => (
                <label
                  className="flex flex-col gap-1.5 text-sm font-medium"
                  key={field}
                  htmlFor={`voice-${field}`}
                >
                  {t(`voiceSettings.${field}`)}
                  <Input
                    autoComplete="new-password"
                    disabled={editingDisabled}
                    id={`voice-${field}`}
                    placeholder={previewFor(field)}
                    type="password"
                    value={fields[field]}
                    onChange={(event) =>
                      setFields({ ...fields, [field]: event.target.value })
                    }
                  />
                </label>
              ))}
              <div className="flex items-center gap-2">
                <Switch
                  checked={enabled}
                  disabled={editingDisabled}
                  id="voice-enabled"
                  onCheckedChange={setEnabled}
                />
                <label className="text-sm font-medium" htmlFor="voice-enabled">
                  {t("voiceSettings.enabled")}
                </label>
              </div>
              <Button disabled={editingDisabled} type="submit">
                {t("voiceSettings.save")}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">
              {t("voiceSettings.testWarning")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={busy || !config.enabled || !config.configured}
                onClick={() =>
                  void run(testVoiceSettings, t("voiceSettings.testSuccess"))
                }
              >
                {t("voiceSettings.test")}
              </Button>
              <Button
                variant="destructive"
                disabled={busy || !config.revision}
                onClick={() => setConfirmDelete(true)}
              >
                {t("voiceSettings.delete")}
              </Button>
            </div>
          </>
        )}
        <p role="status">{message}</p>
        <AlertDialog onOpenChange={setConfirmDelete} open={confirmDelete}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("voiceSettings.delete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("voiceSettings.confirmDelete")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="ghost">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (config)
                    void run(
                      () => deleteVoiceSettings(config.revision),
                      t("voiceSettings.deleted"),
                    );
                }}
              >
                {t("voiceSettings.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
