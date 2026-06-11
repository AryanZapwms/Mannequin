"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

type UploadFolder = "products/thumbnails" | "products/media" | "blogs/covers";
type OwnerType = "product" | "blog";

interface ImageUploadProps {
  /** The form field name for the final URL (hidden input) */
  name: string;
  /** The form field name for the Cloudinary public ID (hidden input) */
  publicIdName: string;
  /** Existing URL to show on load */
  defaultValue?: string | null;
  /** Existing Cloudinary public ID, if editing an existing record */
  defaultPublicId?: string | null;
  /** Cloudinary destination folder (must be one of the allow-listed upload destinations) */
  folder: UploadFolder;
  /**
   * The owning record's type + Mongo _id — required to delete the previous image
   * from Cloudinary when editing an existing Product/BlogPost. Omit for "new" forms
   * where the record doesn't exist yet (nothing to delete server-side).
   */
  ownerType?: OwnerType;
  ownerId?: string;
  /** Max file size in MB */
  maxMb?: number;
  label?: string;
}

export function ImageUpload({
  name,
  publicIdName,
  defaultValue,
  defaultPublicId,
  folder,
  ownerType,
  ownerId,
  maxMb = 5,
  label = "Upload Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [publicId, setPublicId] = useState<string>(defaultPublicId ?? "");
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
      const previousUrl = url;
      const previousPublicId = publicId;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Upload failed. Please try again.");
      }

      setUrl(data.url);
      setPublicId(data.publicId);

      // Replacing an existing image on a saved record — clean up the old asset.
      if (previousUrl && previousPublicId && ownerType && ownerId) {
        await deleteFromCloudinary(previousPublicId, ownerType, ownerId);
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const deleteFromCloudinary = async (idToDelete: string, type: OwnerType, recordId: string) => {
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: idToDelete, ownerType: type, ownerId: recordId }),
      });
    } catch (err) {
      console.error("Failed to delete previous image from Cloudinary:", err);
    }
  };

  const handleRemove = async () => {
    if (url && publicId && ownerType && ownerId) {
      await deleteFromCloudinary(publicId, ownerType, ownerId);
    }
    setUrl("");
    setPublicId("");
    setError(null);
  };

  return (
    <div className="space-y-2">
      {/* Hidden inputs carry the URL and Cloudinary public ID to the form */}
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={publicIdName} value={publicId} />

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
