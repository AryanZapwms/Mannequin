"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, ChevronUp, ChevronDown } from "lucide-react";

type OwnerType = "product";

interface GalleryImage {
  url: string;
  publicId: string;
  altText: string;
}

interface GalleryUploadProps {
  /** Form field name for the hidden JSON payload (array of {url, publicId, altText, sortOrder}) */
  name: string;
  /** Existing gallery images to preload (editing an existing product) */
  defaultValue?: { url: string; publicId?: string | null; altText?: string | null }[];
  /** Cloudinary destination folder — must be in the allow-listed upload destinations */
  folder: "products/media";
  /**
   * Owning record's type + Mongo _id — required to delete removed images from
   * Cloudinary immediately. Omit for "new product" forms where nothing is saved yet.
   */
  ownerType?: OwnerType;
  ownerId?: string;
  maxMb?: number;
  maxImages?: number;
  label?: string;
}

export function GalleryUpload({
  name,
  defaultValue,
  folder,
  ownerType,
  ownerId,
  maxMb = 5,
  maxImages = 8,
  label = "Add Images",
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>(
    (defaultValue ?? []).map((item) => ({
      url: item.url,
      publicId: item.publicId ?? "",
      altText: item.altText ?? "",
    })),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const uploadOne = async (file: File): Promise<GalleryImage> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error ?? "Upload failed. Please try again.");
    }

    return { url: data.url, publicId: data.publicId, altText: "" };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError(null);

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`You can add up to ${maxImages} images.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`Only the first ${remainingSlots} image(s) were added — limit is ${maxImages}.`);
    }

    for (const file of filesToUpload) {
      if (file.size > maxMb * 1024 * 1024) {
        setError(`"${file.name}" is over ${maxMb} MB and was skipped.`);
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not a supported image type and was skipped.`);
        continue;
      }
    }

    const validFiles = filesToUpload.filter(
      (file) => file.size <= maxMb * 1024 * 1024 && allowedTypes.includes(file.type),
    );

    setUploading(true);
    try {
      const uploaded = await Promise.all(validFiles.map(uploadOne));
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err: unknown) {
      console.error("Gallery upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (index: number) => {
    const target = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));

    if (target.url && target.publicId && ownerType && ownerId) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: target.publicId, ownerType, ownerId }),
        });
      } catch (err) {
        console.error("Failed to delete gallery image from Cloudinary:", err);
      }
    }
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const swapWith = index + direction;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  const handleAltTextChange = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, altText: value } : img)));
  };

  const payload = JSON.stringify(
    images.map((img, index) => ({
      url: img.url,
      publicId: img.publicId || null,
      altText: img.altText || null,
      sortOrder: index,
    })),
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={payload} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, index) => (
          <div key={`${img.publicId || img.url}-${index}`} className="group relative">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src={img.url}
                alt={img.altText || "Product image"}
                fill
                sizes="160px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Move image earlier"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Move image later"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={img.altText}
              onChange={(e) => handleAltTextChange(index, e.target.value)}
              placeholder="Alt text (optional)"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
            />
          </div>
        ))}

        {images.length < maxImages ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
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
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP or GIF · Max {maxMb} MB each · Up to {maxImages} images
      </p>
    </div>
  );
}   