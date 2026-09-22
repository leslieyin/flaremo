import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { DownloadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

type ImageLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string;
  alt?: string;
  downloadUrl?: string;
  filename?: string;
};

export function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt,
  downloadUrl,
  filename,
}: ImageLightboxProps) {
  const { t } = useI18n();

  if (!src) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md transition-opacity duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none select-none">
          {/* Top action bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-10">
            <span className="truncate max-w-[50vw] text-xs font-mono text-white/70">
              {filename ?? alt ?? ""}
            </span>
            <div className="flex items-center gap-2">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={filename}
                  aria-label={t("common.download")}
                  title={t("common.download")}
                  className="inline-flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition-colors"
                >
                  <DownloadIcon className="size-4" />
                </a>
              )}
              <DialogPrimitive.Close
                render={
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("common.close")}
                    title={t("common.close")}
                    className="size-8 text-white/90 hover:bg-white/20 hover:text-white"
                  >
                    <XIcon className="size-4" />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Main Image preview */}
          <img
            src={src}
            alt={alt ?? filename ?? ""}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl transition-all duration-200 motion-safe:animate-scale-in"
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
