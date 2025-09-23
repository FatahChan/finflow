import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { validateImage, compressImage } from '@/lib/photo-processing-service';

interface PhotoCaptureStepProps {
    onImageSelected: (file: File) => void;
    onCancel: () => void;
}

export function PhotoCaptureStep({ onImageSelected, onCancel }: PhotoCaptureStepProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Cleanup function to revoke object URLs and clear sensitive data
    const cleanupImageData = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        setSelectedFile(null);
        setError(null);
        // Clear file inputs
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileSelect = async (file: File | null) => {
        if (!file) return;

        setError(null);

        // Validate the file
        const validation = validateImage(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        try {
            // Compress image for better performance (optional optimization)
            const compressedFile = await compressImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                setSelectedFile(compressedFile);
            };
            reader.readAsDataURL(compressedFile);
        } catch (compressionError) {
            // If compression fails, use original file
            console.warn('Image compression failed, using original:', compressionError);

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                setSelectedFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        void handleFileSelect(file || null);
    };

    const handleUsePhoto = () => {
        if (selectedFile) {
            onImageSelected(selectedFile);
        }
    };

    const handleRetake = () => {
        cleanupImageData();
    };

    const triggerCamera = () => {
        cameraInputRef.current?.click();
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add Photo</h3>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4">
                        <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {preview ? (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-4">
                            <img
                                src={preview}
                                alt="Preview of selected receipt image"
                                className="w-full h-auto max-h-96 object-contain rounded-md"
                                role="img"
                                aria-describedby="image-preview-description"
                            />
                            <div id="image-preview-description" className="sr-only">
                                Preview of the receipt image you selected. You can use this photo or retake it.
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex space-x-2">
                        <Button onClick={handleUsePhoto} className="flex-1">
                            Use This Photo
                        </Button>
                        <Button variant="outline" onClick={handleRetake} className="flex-1">
                            Retake
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="text-center text-muted-foreground mb-6">
                        <p>Take a photo of your receipt or select an image from your device</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 touch-manipulation">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={triggerCamera}
                            className="h-24 flex-col space-y-2 touch-manipulation active:scale-95 transition-transform"
                            aria-label="Take a photo of your receipt using camera"
                        >
                            <Camera className="h-8 w-8" aria-hidden="true" />
                            <span>Take Photo</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={triggerFileSelect}
                            className="h-24 flex-col space-y-2 touch-manipulation active:scale-95 transition-transform"
                            aria-label="Choose an image file from your device"
                        >
                            <Upload className="h-8 w-8" aria-hidden="true" />
                            <span>Choose File</span>
                        </Button>
                    </div>

                    <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p>Supported formats: JPEG, PNG, WebP (max 10MB)</p>
                        <p className="text-xs">🔒 Images are processed securely and not stored permanently</p>
                    </div>
                </div>
            )}

            {/* Hidden file inputs */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileInputChange}
                className="hidden"
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
            />
        </div>
    );
}