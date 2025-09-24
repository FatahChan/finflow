import { processReceiptPhoto, type ProcessReceiptPhotoResult } from '@/actions/process-receipt-photo';

export interface ExtractedTransaction {
  name: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  transactionAt: string;
}

// Default categories that match the user's saved categories from legend-state
export const DEFAULT_CATEGORIES = {
  credit: ["Income", "Investment", "Salary", "Other"],
  debit: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other"
  ]
} as const;

// Image validation constants (client-side)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates an image file on the client side
 */
export function validateImage(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Please use: ${ALLOWED_TYPES.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toString()}MB`
    };
  }

  return { valid: true };
}

/**
 * Processes a photo by sending it to the server action
 */
export async function processPhoto(
  file: File,
  categories: { credit: string[]; debit: string[] }
): Promise<ExtractedTransaction[]> {
  // Validate file first
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create FormData for server action
  const formData = new FormData();
  formData.append('image', file);
  formData.append('categories', JSON.stringify(categories));

  try {
    // Call server action with correct TanStack Start syntax
    const result: ProcessReceiptPhotoResult = await processReceiptPhoto({
      data: formData
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to process image');
    }

    if (result.transactions.length === 0) {
      throw new Error('No transactions found in the image. Please try a clearer photo or enter details manually.');
    }

    return result.transactions as ExtractedTransaction[];

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
}

/**
 * Compresses an image file before processing (optional optimization)
 */
export async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}