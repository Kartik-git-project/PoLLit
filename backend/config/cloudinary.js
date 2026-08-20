import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Setup in Memory
const storage = multer.memoryStorage();

// Multer Middleware with limits to prevent infinite stream hanging
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Helper Function for Cloudinary Buffer Upload
export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) return resolve("");

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "pollit_avatars" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};