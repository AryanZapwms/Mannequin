import { v2 as cloudinary } from "cloudinary";

const uri: { cloud_name: string; api_key: string; api_secret: string } = (() => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set");
  }

  return { cloud_name, api_key, api_secret };
})();

cloudinary.config({ ...uri, secure: true });

export default cloudinary;
