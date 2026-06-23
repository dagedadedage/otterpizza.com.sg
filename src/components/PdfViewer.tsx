"use client";

import { useEffect, useRef } from "react";

interface PdfViewerProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PdfViewer({ src, className, style }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const EmbedPDF = (await import("@embedpdf/snippet")).default;
        if (cancelled || !containerRef.current) return;

        if (viewerRef.current) {
          try {
            viewerRef.current.destroy?.();
          } catch {}
        }

        viewerRef.current = EmbedPDF.init({
          type: "container",
          target: containerRef.current,
          src,
          disabledCategories: ["annotation", "redaction"],
          permissions: { enforceDocumentPermissions: false },
        });
      } catch (err) {
        console.error("[PdfViewer] Failed to load PDF:", err);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy?.();
        } catch {}
        viewerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}
