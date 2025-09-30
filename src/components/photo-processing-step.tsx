import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { processPhoto, type ExtractedTransaction } from '@/lib/photo-processing-service';

interface PhotoProcessingStepProps {
    image: File;
    categories: { credit: string[]; debit: string[] };
    onProcessingComplete: (transactions: ExtractedTransaction[]) => void;
    onError: (error: string) => void;
    onCancel: () => void;
}

export function PhotoProcessingStep({
    image,
    categories,
    onProcessingComplete,
    onError,
    onCancel
}: PhotoProcessingStepProps) {
    const [isProcessing, setIsProcessing] = useState(true);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Uploading image...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const processImage = async () => {
            try {
                setIsProcessing(true);
                setError(null);

                // Progressive loading with realistic timing
                const progressSteps = [
                    { progress: 15, status: 'Uploading image...', delay: 300 },
                    { progress: 35, status: 'Analyzing receipt...', delay: 800 },
                    { progress: 55, status: 'Extracting transaction details...', delay: 1200 },
                    { progress: 75, status: 'Processing categories...', delay: 600 },
                    { progress: 90, status: 'Finalizing results...', delay: 400 }
                ];

                for (const step of progressSteps) {
                    if (cancelled) return;
                    setProgress(step.progress);
                    setStatus(step.status);
                    await new Promise(resolve => setTimeout(resolve, step.delay));
                }

                // Process the actual image
                const transactions = await processPhoto(image, categories);

                if (cancelled) return;

                setProgress(100);
                setStatus('Complete!');

                // Small delay to show completion
                void setTimeout(() => {
                    if (!cancelled) {
                        onProcessingComplete(transactions);
                    }
                }, 500);

            } catch (err) {
                if (cancelled) return;

                const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
                setError(errorMessage);
                setIsProcessing(false);
                onError(errorMessage);
            }
        };

        void processImage();

        return () => {
            cancelled = true;
        };
    }, [image, categories, onProcessingComplete, onError]);

    const handleRetry = () => {
        setError(null);
        setProgress(0);
        setStatus('Uploading image...');
        setIsProcessing(true);

        // Restart processing
        void processPhoto(image, categories)
            .then(onProcessingComplete)
            .catch((err: unknown) => {
                const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
                setError(errorMessage);
                setIsProcessing(false);
                onError(errorMessage);
            });
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Processing Receipt</h3>
                <p className="text-muted-foreground">
                    Please wait while we extract transaction details from your image
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Progress indicator */}
                        <div className="flex items-center space-x-3">
                            {isProcessing && !error ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : error ? (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            ) : (
                                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                </div>
                            )}
                            <span className="text-sm font-medium">{status}</span>
                        </div>

                        {/* Progress bar */}
                        {isProcessing && !error && (
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress.toString()}%` }}
                                />
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="space-y-3">
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>

                                <div className="flex space-x-2">
                                    <Button onClick={handleRetry} size="sm" className="flex-1">
                                        Try Again
                                    </Button>
                                    <Button variant="outline" onClick={onCancel} size="sm" className="flex-1">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Processing tips with skeleton loading effect */}
                        {isProcessing && !error && (
                            <div className="space-y-3">
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>💡 <strong>Tip:</strong> Make sure the receipt is clearly visible and well-lit</p>
                                    <p>📱 <strong>Note:</strong> Processing may take 10-30 seconds depending on image complexity</p>
                                    <p>🔒 <strong>Privacy:</strong> Your image is processed securely and automatically deleted after processing</p>
                                </div>
                                
                                {/* Skeleton preview of what's being processed */}
                                <div className="mt-4 p-3 bg-muted/30 rounded-md">
                                    <div className="text-xs text-muted-foreground mb-2">Processing will extract:</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                                            <span className="text-xs">Merchant name</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                            <span className="text-xs">Transaction amount</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                            <span className="text-xs">Date and category</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Cancel button (only show during processing) */}
            {isProcessing && !error && (
                <div className="text-center">
                    <Button variant="ghost" onClick={onCancel} size="sm">
                        Cancel Processing
                    </Button>
                </div>
            )}
        </div>
    );
}