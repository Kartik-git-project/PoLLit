import {v2 as cloudinary} from 'cloudinary';
import multer from 'multer';

// cloudinary keys
cloudinary.config({
    cloud_name: process.env.CLOUDNIARY_CLOUD_NAME,
    api_key: process.env.CLOUDNIARY_API_KEY,
    api_secret: process.env.CLOUDNIARY_API_SECRET 
});

// to upload an image or 4 images 
export const upload = multer({storage: multer.memoryStorage()});

// to upload image to cloudinary
export const uploadToCloudinary = (buffer) =>
    new Promise ((resolve, reject) =>{
        const stream = cloudinary.uploader.upload_stream(
            {folder: "polling-app"}, 
            (err, result) => (err ? reject(err): resolve(result.secure_url))
        );
    });
    
export default cloudinary;
