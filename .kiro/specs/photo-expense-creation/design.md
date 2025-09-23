# Design Document

## Overview

The photo-based expense creation feature integrates AI-powered image processing into FinFlow's existing transaction creation workflow. Users can capture or upload photos of receipts, invoices, or bank statements, and the system will automatically extract transaction details using Google's Gemini AI model. The extracted data is then presented in the familiar transaction form for review and editing before saving.

This feature leverages the existing transaction schema and UI components while adding new capabilities for image processing, AI integration, and enhanced user experience.

## Architecture

### High-Level Flow
1. **Image Capture/Upload**: User selects photo option from transaction creation flow
2. **Client Upload**: Photo is uploaded to server endpoint via secure API
3. **Server Processing**: Server processes image using Google Gemini AI and returns structured data
4. **Client Review**: User reviews extracted data in familiar transaction form
5. **Save**: Transaction(s) saved using existing InstantDB transaction flow

### Client-Server Architecture
```
Client (React)                    Server (TanStack Start)
├── PhotoTransactionFlow          ├── processReceiptPhoto (Server Action)
│   ├── PhotoCaptureStep          │   ├── Authentication middleware
│   ├── PhotoProcessingStep       │   ├── Image validation
│   └── PhotoReviewStep           │   ├── Gemini AI processing
└── TransactionForm (existing)    │   └── Data structuring
                                  └── Return transactions array
```

### Server Action Design
```typescript
// Server Action: src/actions/process-receipt-photo.ts
export async function processReceiptPhoto(formData: FormData): Promise<{
  success: boolean;
  transactions: ExtractedTransaction[];
  error?: string;
}>;

// Usage from client:
const result = await processReceiptPhoto(formData);
```

## Components and Interfaces

### Core Components

#### PhotoTransactionFlow
Main orchestrator component that manages the photo-to-transaction workflow.

```typescript
interface PhotoTransactionFlowProps {
  onTransactionsExtracted: (transactions: ExtractedTransaction[]) => void;
  onCancel: () => void;
}

interface PhotoTransactionFlowState {
  step: 'capture' | 'processing' | 'review';
  image: File | null;
  extractedTransactions: ExtractedTransaction[];
  error: string | null;
  isProcessing: boolean;
}
```

#### PhotoCaptureStep
Handles image capture from camera or file selection.

```typescript
interface PhotoCaptureStepProps {
  onImageSelected: (file: File) => void;
  onCancel: () => void;
}
```

#### PhotoProcessingStep
Shows loading state while AI processes the image.

```typescript
interface PhotoProcessingStepProps {
  image: File;
  onProcessingComplete: (transactions: ExtractedTransaction[]) => void;
  onError: (error: string) => void;
}
```

#### PhotoReviewStep
Displays extracted transactions for review and editing.

```typescript
interface PhotoReviewStepProps {
  transactions: ExtractedTransaction[];
  onTransactionsConfirmed: (transactions: ExtractedTransaction[]) => void;
  onBack: () => void;
}
```

### Data Models

#### ExtractedTransaction
Matches existing transaction schema with confidence indicators.

```typescript
interface ExtractedTransaction {
  name: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  transactionAt: string; // ISO date string
  confidence: {
    name: number;
    amount: number;
    type: number;
    category: number;
    date: number;
  };
}
```

#### Server Action Types
Server action interfaces for photo processing.

```typescript
// Client-side service
interface PhotoProcessingService {
  processPhoto(file: File): Promise<ExtractedTransaction[]>;
  validateImage(file: File): boolean;
}

// Server Action types
interface ProcessReceiptPhotoResult {
  success: boolean;
  transactions: ExtractedTransaction[];
  error?: string;
  processingTime?: number;
}

// Server Action function signature
export async function processReceiptPhoto(
  formData: FormData
): Promise<ProcessReceiptPhotoResult>;

// Server-side AI service (internal)
interface AIExtractionService {
  extractTransactions(imageBuffer: Buffer): Promise<ExtractedTransaction[]>;
  validateImageFormat(buffer: Buffer): boolean;
}
```

## Data Models

### Enhanced Transaction Schema
The existing transaction schema remains unchanged, but we add validation and mapping utilities:

```typescript
// Existing schema (unchanged)
transactions: i.entity({
  amount: i.number(),
  category: i.string(),
  name: i.string(),
  transactionAt: i.date().indexed(),
  type: i.string().indexed(),
})

// New validation schema for AI extraction
const aiExtractionSchema = z.object({
  name: z.string().min(1).describe("Merchant or transaction name"),
  amount: z.number().min(0.01).describe("Transaction amount"),
  type: z.enum(["credit", "debit"]).describe("Transaction type"),
  category: z.string().min(1).describe("Transaction category"),
  transactionAt: z.string().datetime().describe("Transaction date in ISO format"),
});
```

### Image Processing Configuration
```typescript
interface ImageProcessingConfig {
  maxFileSize: number; // 10MB
  allowedTypes: string[]; // ['image/jpeg', 'image/png', 'image/webp']
  maxDimensions: { width: number; height: number };
  compressionQuality: number;
}
```

## Error Handling

### Error Types
```typescript
enum PhotoProcessingError {
  INVALID_IMAGE = 'INVALID_IMAGE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  NO_TRANSACTIONS_FOUND = 'NO_TRANSACTIONS_FOUND'
}
```

### Error Recovery Strategies
1. **Image Validation Errors**: Show clear message with format/size requirements
2. **AI Service Errors**: Offer retry option or fallback to manual entry
3. **Network Errors**: Queue for retry when connection restored (PWA offline support)
4. **Extraction Failures**: Allow manual correction of extracted data
5. **No Data Found**: Suggest retaking photo or manual entry

### User-Friendly Error Messages
```typescript
const errorMessages = {
  [PhotoProcessingError.INVALID_IMAGE]: "Please select a valid image file",
  [PhotoProcessingError.FILE_TOO_LARGE]: "Image file is too large. Please choose a smaller image (max 10MB)",
  [PhotoProcessingError.AI_SERVICE_ERROR]: "Unable to process image. Please try again or enter details manually",
  [PhotoProcessingError.NO_TRANSACTIONS_FOUND]: "No transaction details found in image. Please try a clearer photo or enter details manually"
};
```

## Testing Strategy

### Unit Testing
- **AIExtractionService**: Mock Gemini API responses, test data mapping
- **PhotoProcessingService**: Test image validation, error handling
- **DataMappingService**: Test conversion between AI response and transaction schema
- **Component Logic**: Test state management, user interactions

### Integration Testing
- **Photo Capture Flow**: Test camera access, file selection
- **AI Processing Pipeline**: Test end-to-end image processing with sample receipts
- **Transaction Creation**: Test integration with existing transaction creation flow
- **Error Scenarios**: Test various failure modes and recovery

### E2E Testing
- **Complete Photo Flow**: Capture photo → process → review → save
- **Multiple Transactions**: Test bank statement with multiple entries
- **Offline Behavior**: Test queuing and retry mechanisms
- **Cross-Device**: Test PWA behavior on mobile and desktop

### Test Data
- Sample receipt images (various formats, qualities)
- Bank statement images (single and multiple transactions)
- Edge cases (blurry images, foreign languages, unusual formats)
- Mock AI responses for consistent testing

## Implementation Considerations

### Performance Optimizations
1. **Image Compression**: Compress images before sending to AI service
2. **Caching**: Cache AI responses for identical images
3. **Progressive Loading**: Show immediate feedback during processing
4. **Background Processing**: Use Web Workers for image processing

### Security & Privacy
1. **Server-Side Processing**: AI API keys and processing happen securely on server
2. **Temporary Storage**: Images processed in memory, not stored permanently on server
3. **Data Sanitization**: Server validates and sanitizes all AI-extracted data
4. **Upload Security**: File type validation, size limits, and secure multipart handling
5. **User Consent**: Clear messaging about AI processing and data handling

### Accessibility
1. **Camera Access**: Graceful fallback if camera unavailable
2. **Screen Readers**: Proper ARIA labels for all photo flow steps
3. **Keyboard Navigation**: Full keyboard support for photo capture
4. **Visual Indicators**: Clear progress and status indicators

### PWA Integration
1. **Offline Queuing**: Queue photos for processing when offline
2. **Service Worker**: Cache AI processing logic where possible
3. **Native Feel**: Use device camera APIs for native experience
4. **Background Sync**: Process queued photos when connection restored