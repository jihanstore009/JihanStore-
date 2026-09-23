/**
 * Image processing and optimization utility.
 * Resizes, compresses, and optimizes images client-side before uploading,
 * ensuring high performance, low bandwidth, and 100% reliability.
 */

export interface ProcessedImage {
  blob: Blob;
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.85)
  format?: 'webp' | 'png' | 'jpeg';
}

/**
 * Optimizes an image file (PNG, JPG, WEBP, SVG) client-side.
 * Resolves with a clean Blob and compact Base64 Data URL.
 */
export async function optimizeImageForUpload(
  file: File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.85,
    format
  } = options;

  const fileType = file.type || 'image/png';

  // Special handling for SVG files: preserve vector data
  if (fileType === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const timeout = setTimeout(() => {
        reader.abort();
        reject(new Error('SVG ফাইল রিড করতে অতিরিক্ত সময় লেগেছে (Timeout)'));
      }, 4000);

      reader.onload = () => {
        clearTimeout(timeout);
        const dataUrl = reader.result as string;
        resolve({
          blob: file,
          dataUrl,
          mimeType: 'image/svg+xml',
          width: maxWidth,
          height: maxHeight,
          sizeBytes: file.size,
        });
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('SVG ফাইল লোড করতে ব্যর্থ হয়েছে'));
      };

      reader.readAsDataURL(file);
    });
  }

  // Raster images (PNG, JPG, WEBP, etc.)
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    // 5-second image decode timeout
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ইমেজ ডিকোড করতে সময়সীমা (Timeout) অতিক্রম করেছে। ফাইলটি ক্ষতিগ্রস্ত হতে পারে।'));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        let originalWidth = img.naturalWidth || img.width;
        let originalHeight = img.naturalHeight || img.height;

        if (!originalWidth || !originalHeight) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('ইমেজের ডাইমেনশন পড়া সম্ভব হয়নি'));
          return;
        }

        // Calculate proportional scale
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('ব্রাউজার ক্যানভাস ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে'));
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(objectUrl);

        // Determine output format:
        // Use webp if supported, or png if transparent
        const outputMime = format 
          ? `image/${format}` 
          : fileType.includes('png') 
            ? 'image/png' 
            : 'image/webp';

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL(outputMime, quality);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to dataUrl conversion if toBlob returned null
              try {
                const byteString = atob(dataUrl.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                const fallbackBlob = new Blob([ab], { type: outputMime });
                resolve({
                  blob: fallbackBlob,
                  dataUrl,
                  mimeType: outputMime,
                  width: targetWidth,
                  height: targetHeight,
                  sizeBytes: fallbackBlob.size,
                });
              } catch (e) {
                reject(new Error('ইমেজ ব্লব তৈরি করতে ব্যর্থ হয়েছে'));
              }
              return;
            }

            resolve({
              blob,
              dataUrl,
              mimeType: outputMime,
              width: targetWidth,
              height: targetHeight,
              sizeBytes: blob.size,
            });
          },
          outputMime,
          quality
        );
      } catch (err: any) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`ইমেজ প্রসেসিং এরর: ${err?.message || 'অজানা ত্রুটি'}`));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ইমেজ লোড করা যায়নি। ফাইল ফরম্যাটটি সঠিক কি না পরীক্ষা করুন।'));
    };

    img.src = objectUrl;
  });
}
