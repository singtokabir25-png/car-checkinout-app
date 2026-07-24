"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

export function ImageUpload({ value, onChange, maxFiles = 8, error }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = value.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const merged = [...value, ...incoming].slice(0, maxFiles);
    onChange(merged);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Vehicle Inspection Photos
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {previews.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Inspection photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed",
              "border-slate-300 text-slate-400 transition hover:border-blue-400 hover:text-blue-500"
            )}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment" // ตัวนี้แหละครับที่เป็นตัวสั่งให้เปิดกล้อง
        multiple={false}     // ปรับเป็น false เพื่อให้กดถ่ายทีละรูป (จะทำให้เปิดกล้องแม่นขึ้น)
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-1.5 text-xs text-slate-400">
        {value.length}/{maxFiles} photos added
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
