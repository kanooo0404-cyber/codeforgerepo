import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { isFirebaseConfigured, storage } from '../config/firebase.js';

function compressImageToDataUrl(file, maxDimension = 760, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadReportPhoto(file, userId) {
  if (!file) return '';

  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, WebP).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be under 5 MB.');
  }

  if (isFirebaseConfigured && storage && userId) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `reports/${userId}/${Date.now()}_${safeName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  // Local Demo Mode: compress and store locally as DataURL
  return await compressImageToDataUrl(file);
}
