"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  /** The form field name for the final URL (hidden input) */
  name: string;
  /** Existing URL to show on load */
  defaultValue?: string | null;
  /** Supabase Storage bucket name */
  bucket?: string;
  /** Folder path inside the bucket */
  folder?: string;
  /** Max file size in MB */
  maxMb?: number;
  label?: string;
}

export function ImageUpload({
  name,
  defaultValue,
  bucket = "product-images",
  folder = "uploads",
  maxMb = 5,
  label = "Upload Image",
}: ImageUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxMb * 1024 * 1024) {
      setError(`File size must be under ${maxMb} MB.`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WebP and GIF images are allowed.");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setUrl(data.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setUrl("");
    setError(null);
  };

  return (
    <div className="space-y-2">
      {/* Hidden input carries the URL to the form */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="group relative inline-block">
          <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={url}
              alt="Uploaded image"
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <p className="mt-1.5 text-xs text-muted-foreground break-all max-w-[160px] truncate">
            {url.split("/").pop()}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs text-center px-2">{label}</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP or GIF · Max {maxMb} MB
      </p>
    </div>
  );
}
