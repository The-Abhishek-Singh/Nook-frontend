import imageCompression from "browser-image-compression";

const ONE_MB = 1024 * 1024;

export const optimizeImage = async (file: File): Promise<File> => {
    // Skip non-image files
    if (!file.type.startsWith("image/")) {
        return file;
    }

    // Small images (< 1MB)
    // Convert to WebP only (no compression)
    if (file.size < ONE_MB) {
        return await imageCompression(file, {
            fileType: "image/webp",
            useWebWorker: true,
            initialQuality: 1,
            maxWidthOrHeight: undefined,
        });
    }

    // Large images (>= 1MB)
    // Compress + Convert to WebP
    return await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
    });
};