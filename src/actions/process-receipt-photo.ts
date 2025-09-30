import { serverEnv } from '@/lib/server-env';
import { createServerFn } from '@tanstack/react-start';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import * as z from 'zod/mini';

// Function to create transaction schema with dynamic categories
function getTransactionZodSchema(categories: { credit: string[]; debit: string[] }) {
    const allCategories = [...categories.credit, ...categories.debit];
    
    return z.object({
        name: z.string().check(z.minLength(1, "Name is required")),
        amount: z.number().check(z.minimum(0.01, "Amount is required")),
        type: z.enum(["credit", "debit"]),
        category: z.enum(allCategories as [string, ...string[]]),
        transactionAt: z.string().check(z.minLength(1, "Transaction Date is required")),
    });
}

// Response type for the server action
export interface ProcessReceiptPhotoResult {
    success: boolean;
    transactions: Array<{
        name: string;
        amount: number;
        type: 'credit' | 'debit';
        category: string;
        transactionAt: string;
    }>;
    error?: string;
    processingTime?: number;
}

// Image validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const processReceiptPhoto = createServerFn({ method: 'POST' })
    .inputValidator((formData: FormData) => {
        const imageFile = formData.get('image') as File | null;
        const categoriesJson = formData.get('categories') as string | null;

        if (!imageFile) {
            throw new Error('No image file provided');
        }

        if (!ALLOWED_TYPES.includes(imageFile.type)) {
            throw new Error(`Unsupported file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
        }

        if (imageFile.size > MAX_FILE_SIZE) {
            throw new Error(`File too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toString()}MB`);
        }

        if (!categoriesJson) {
            throw new Error('Categories data is required');
        }

        let categories: { credit: string[]; debit: string[] };
        try {
            categories = JSON.parse(categoriesJson) as { credit: string[]; debit: string[] };
        } catch {
            throw new Error('Invalid categories data format');
        }

        return { imageFile, categories };
    })
    .handler(async (ctx): Promise<ProcessReceiptPhotoResult> => {
        const startTime = Date.now();

        try {
            const { imageFile, categories } = ctx.data;

            // Create dynamic schema with user's categories
            const transactionZodSchema = getTransactionZodSchema(categories);

            // Convert File to Buffer for AI processing
            // Note: Image data is processed in memory only and not stored permanently
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Initialize Google Generative AI
            const googleGenerativeAI = createGoogleGenerativeAI({
                apiKey: serverEnv.GOOGLE_GENERATIVE_AI_API_KEY,
            });

            const model = googleGenerativeAI('gemini-2.0-flash-exp');

            // Create category list for AI prompt
            const categoryPrompt = `
              * For expenses (debit): ${categories.debit.join(', ')}
              * For income (credit): ${categories.credit.join(', ')}`;

            // Process image with AI
            const result = await generateObject({
                model,
                providerOptions: {
                    google: {
                        structuredOutputs: true,
                    },
                },
                schema: z.array(transactionZodSchema),
                messages: [{
                    role: "user",
                    content: [{
                        type: "file",
                        data: buffer,
                        mediaType: imageFile.type,
                    }, {
                        type: "text",
                        text: `Based on the receipt, invoice, or bank statement in this image, extract the transaction details. 
            
            For each transaction found:
            - Extract the merchant/vendor name as the transaction name
            - Get the exact amount (positive number)
            - Determine if it's a debit (expense) or credit (income) - most receipts are debits
            - Categorize appropriately using ONLY these available categories:${categoryPrompt}
            - Extract or estimate the transaction date in ISO format
            
            If multiple transactions are visible (like in a bank statement), extract each one separately.
            If the image is unclear or no transactions can be found, return an empty array.
            
            Return an array of transaction objects matching the schema, even if it's just one transaction.`,
                    }]
                }]
            }).catch(() => {
                throw new Error('Failed to process receipt photo');
            });

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                transactions: result.object,
                processingTime,
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;

            // Note: No explicit cleanup needed as image data was processed in memory only
            // Buffer will be garbage collected automatically
            
            return {
                success: false,
                transactions: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                processingTime,
            };
        }
    });