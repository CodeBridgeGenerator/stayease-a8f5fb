// cloudinaryUpload.js
// Utility to upload images to Cloudinary (unsigned)
// Set your Cloudinary details below:
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/de6nqsgxd/image/upload';
const UPLOAD_PRESET = 'z3a46qga';

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Cloudinary upload failed');
  return response.json(); // Returns { url, secure_url, ... }
} 