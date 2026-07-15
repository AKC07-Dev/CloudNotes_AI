import { useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteThumbnailProps {
  thumbnailUrl?: string;
  title: string;
  className?: string;
  iconClassName?: string;
}

export function NoteThumbnail({
  thumbnailUrl,
  title,
  className,
  iconClassName,
}: NoteThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (thumbnailUrl && !imageFailed) {
    return (
      <img
        src={thumbnailUrl}
        alt={title}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center",
        className,
      )}
    >
      <FileText className={cn("h-12 w-12 text-white/30", iconClassName)} />
    </div>
  );
}
