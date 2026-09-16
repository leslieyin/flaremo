import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { FlareMoLogo } from "@/components/flaremo-logo";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

/** Shared header for subpages: back-to-workspace link on the left, logo right. */
export function SubpageHeader() {
  const { t } = useI18n();
  return (
    <header className="flex items-center justify-between gap-3">
      <Button
        render={
          <Link
            search={{
              q: undefined,
              tag: undefined,
              view: undefined,
              space: undefined,
              untagged: undefined,
              compose: undefined,
            }}
            to="/"
          />
        }
        size="sm"
        variant="ghost"
      >
        <ArrowLeftIcon className="rtl:-rotate-180" data-icon="inline-start" />
        {t("common.back")}
      </Button>
      <FlareMoLogo markClassName="size-5" />
    </header>
  );
}
