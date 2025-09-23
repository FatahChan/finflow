import { useState } from 'react';
import { PhotoCaptureStep } from './photo-capture-step';
import { PhotoProcessingStep } from './photo-processing-step';
import { PhotoReviewStep } from './photo-review-step';
import type { ExtractedTransaction } from '@/lib/photo-processing-service';

type FlowStep = 'capture' | 'processing' | 'review';

interface PhotoTransactionFlowProps {
  categories: { credit: string[]; debit: string[] };
  onTransactionsExtracted: (transactions: ExtractedTransaction[]) => void;
  onCancel: () => void;
}

export function PhotoTransactionFlow({ 
  categories, 
  onTransactionsExtracted, 
  onCancel 
}: PhotoTransactionFlowProps) {
  const [step, setStep] = useState<FlowStep>('capture');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [_error, setError] = useState<string | null>(null);

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    setError(null);
    setStep('processing');
  };

  const handleProcessingComplete = (transactions: ExtractedTransaction[]) => {
    setExtractedTransactions(transactions);
    setStep('review');
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    // Stay on processing step to show error and retry options
  };

  const handleTransactionsConfirmed = (transactions: ExtractedTransaction[]) => {
    onTransactionsExtracted(transactions);
  };

  const handleBackToCapture = () => {
    setStep('capture');
    setSelectedImage(null);
    setExtractedTransactions([]);
    setError(null);
  };

  const handleBackToProcessing = () => {
    if (selectedImage) {
      setStep('processing');
      setError(null);
    } else {
      handleBackToCapture();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 'capture' && (
        <PhotoCaptureStep
          onImageSelected={handleImageSelected}
          onCancel={onCancel}
        />
      )}

      {step === 'processing' && selectedImage && (
        <PhotoProcessingStep
          image={selectedImage}
          categories={categories}
          onProcessingComplete={handleProcessingComplete}
          onError={handleProcessingError}
          onCancel={handleBackToCapture}
        />
      )}

      {step === 'review' && (
        <PhotoReviewStep
          transactions={extractedTransactions}
          onTransactionsConfirmed={handleTransactionsConfirmed}
          onBack={handleBackToProcessing}
        />
      )}
    </div>
  );
}