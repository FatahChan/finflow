import { useState, useEffect } from 'react';
import { PhotoCaptureStep } from './photo-capture-step';
import { PhotoProcessingStep } from './photo-processing-step';
import { PhotoReviewStep } from './photo-review-step';
import type { ExtractedTransaction } from '@/lib/photo-processing-service';
import { useIsOnline } from 'react-use-is-online';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { isOnline } = useIsOnline();

  // Monitor online status and handle going offline during processing
  useEffect(() => {
    if (!isOnline && step === 'processing') {
      setError('Connection lost during processing. Please check your internet connection.');
      setStep('capture');
    }
  }, [isOnline, step]);

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

  // Show offline state if user goes offline
  if (!isOnline) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Internet Connection</h3>
            <p className="text-muted-foreground mb-4">
              Photo processing requires an internet connection. Please check your connection and try again.
            </p>
            <Button onClick={onCancel} variant="outline">
              Back to Manual Entry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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