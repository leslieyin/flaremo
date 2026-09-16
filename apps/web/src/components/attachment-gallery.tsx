import { CircleAlertIcon, DownloadIcon, FileIcon } from "lucide-react";
import { useState } from "react";
import type { Attachment } from "@/api";
import { useI18n } from "@/i18n";
import { formatBytes } from "@/lib/utils";

function GalleryItem({ attachment }: { attachment: Attachment }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const isImage = attachment.content_type?.startsWith("image/");
  const isAudio = attachment.content_type?.startsWith("audio/");
  return (
    <div
      className="overflow-hidden rounded-xl border bg-card transition-shadow duration-200 hover:shadow-sm"
      key={attachment.name}
    >
      {isImage &&
        (failed ? (
          <p className="flex items-center gap-2 bg-muted/40 px-3 py-4 text-xs text-muted-foreground">
            <CircleAlertIcon className="size-4 shrink-0" />
            {t("attachment.unavailable")}
          </p>
        ) : (
          <a href={attachment.download_url}>
            <img
              alt={attachment.filename}
              className="max-h-[32rem] w-full bg-muted object-contain motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out-expo motion-safe:hover:scale-[1.015]"
              loading="lazy"
              onError={() => setFailed(true)}
              src={attachment.preview_url}
            />
          </a>
        ))}
      {isAudio && (
        // biome-ignore lint/a11y/useMediaCaption: User-uploaded audio does not include a caption track.
        <audio className="w-full px-3 pt-3" controls preload="metadata">
          <source
            src={attachment.preview_url}
            onError={() => setFailed(true)}
            type={attachment.content_type ?? undefined}
          />
        </audio>
      )}
      <a
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        href={attachment.download_url}
      >
        {isImage || isAudio ? <DownloadIcon /> : <FileIcon />}
        <span className="min-w-0 flex-1 truncate">{attachment.filename}</span>
        <span className="shrink-0 text-xs">{formatBytes(attachment.size)}</span>
      </a>
    </div>
  );
}

export function AttachmentGallery({
  attachments,
}: {
  attachments: Attachment[];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {attachments.map((attachment) => (
        <GalleryItem attachment={attachment} key={attachment.name} />
      ))}
    </div>
  );
}
