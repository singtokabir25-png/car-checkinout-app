"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SignaturePadProps {
  value: string; // data URL, "" when empty
  onChange: (dataUrl: string) => void;
  label?: string;
  error?: string;
}

export function SignaturePad({
  value,
  onChange,
  label = "Signature (confirms transfer of vehicle)",
  error,
}: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(320);
  const [isEmpty, setIsEmpty] = useState(true);

  // Keep the canvas responsive to its container's width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setCanvasWidth(Math.floor(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleEnd = useCallback(() => {
    const canvas = sigRef.current;
    if (!canvas || canvas.isEmpty()) {
      onChange("");
      setIsEmpty(true);
      return;
    }
    // Trim whitespace around the stroke so the exported PNG is tight
    const dataUrl = canvas.getTrimmedCanvas().toDataURL("image/png");
    onChange(dataUrl);
    setIsEmpty(false);
  }, [onChange]);

  const handleClear = () => {
    sigRef.current?.clear();
    onChange("");
    setIsEmpty(true);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-lg border bg-white",
          error ? "border-red-400" : "border-slate-300"
        )}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#0f172a"
          canvasProps={{
            width: canvasWidth,
            height: 160,
            className: "touch-none",
          }}
          onEnd={handleEnd}
        />
        {isEmpty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-300">
            Sign here
          </span>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

      {/* Hidden mirror so this can double as a controlled RHF field if needed */}
      <input type="hidden" value={value} readOnly />
    </div>
  );
}
