import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import { dbConnect } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { BlogPost } from "@/lib/db/models/BlogPost";
import cloudinary from "@/lib/cloudinary";

const MAX_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Whitelist of upload destinations — prevents arbitrary folder paths in Cloudinary.
const ALLOWED_FOLDERS = ["products/thumbnails", "products/media", "blogs/covers"] as const;
type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

const isUploadFolder = (value: unknown): value is UploadFolder =>
  typeof value === "string" && (ALLOWED_FOLDERS as readonly string[]).includes(value);

function isForbidden(err: unknown): err is Error {
  return err instanceof Error && err.message.startsWith("Forbidden");
}

export async function POST(request: NextRequest) {
  try {
    await requireStaff();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!isUploadFolder(folder)) {
      return NextResponse.json({ error: "Invalid upload destination" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File size must be under ${MAX_MB} MB` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `mannequincare/${folder}`, resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve(uploadResult);
        },
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    if (isForbidden(err)) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireStaff();

    const body = await request.json();
    const publicId = typeof body?.publicId === "string" ? body.publicId : "";
    const ownerType = body?.ownerType === "product" || body?.ownerType === "blog" ? body.ownerType : "";
    const ownerId = typeof body?.ownerId === "string" ? body.ownerId : "";

    if (!publicId || !ownerType || !ownerId) {
      return NextResponse.json({ error: "publicId, ownerType and ownerId are required" }, { status: 400 });
    }

    await dbConnect();

    // Never trust the publicId from the request body alone — verify it actually
    // belongs to the owning Product/BlogPost document before destroying it.
    let storedPublicId: string | null | undefined;

    if (ownerType === "product") {
      const product = await Product.findById(ownerId).select("thumbnailPublicId media");
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      storedPublicId =
        product.thumbnailPublicId === publicId
          ? product.thumbnailPublicId
          : product.media.find((item) => item.publicId === publicId)?.publicId;
    } else {
      const post = await BlogPost.findById(ownerId).select("coverImagePublicId");
      if (!post) {
        return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
      }
      storedPublicId = post.coverImagePublicId;
    }

    if (!storedPublicId || storedPublicId !== publicId) {
      return NextResponse.json({ error: "publicId does not match the owning record" }, { status: 403 });
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ message: "Image deleted" });
  } catch (err) {
    if (isForbidden(err)) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Delete upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
