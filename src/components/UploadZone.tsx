import { useState, useCallback } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { openFileDialog } from '@/lib/ipc';

interface UploadZoneProps {
    onUpload: (filePath: string) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (!file) return;

            // In Electron with nodeIntegration:true, File objects have a .path property
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filePath = (file as any).path as string;
            console.log('Drag-drop file path:', filePath);

            if (filePath && /\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
                onUpload(filePath);
            } else {
                console.warn('Invalid file or path not available:', file.name, filePath);
            }
        },
        [onUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleBrowse = useCallback(async () => {
        const filePath = await openFileDialog();
        console.log('Dialog file path:', filePath);
        if (filePath) {
            onUpload(filePath);
        }
    }, [onUpload]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
            <div className="w-full max-w-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Upload a Product Image
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Drop an image or browse to find visually similar products from our catalog
                    </p>
                </div>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleBrowse}
                    className={`
            relative cursor-pointer group
            flex flex-col items-center justify-center
            w-full h-72 rounded-2xl
            border-2 border-dashed transition-all duration-300
            ${isDragOver
                            ? 'border-primary bg-primary/5 scale-[1.02]'
                            : 'border-border hover:border-primary/50 hover:bg-card'
                        }
          `}
                >
                    <div
                        className={`
              flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-all duration-300
              ${isDragOver ? 'bg-primary/20 scale-110' : 'bg-secondary group-hover:bg-primary/10'}
            `}
                    >
                        {isDragOver ? (
                            <ImageIcon className="w-8 h-8 text-primary animate-pulse" />
                        ) : (
                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                    </div>

                    <p className="text-sm font-medium text-foreground mb-1">
                        {isDragOver ? 'Drop to search' : 'Drag & drop your image here'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                        or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Supports JPG, PNG, WebP
                    </p>

                    {/* Glow effect */}
                    {isDragOver && (
                        <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl pointer-events-none" />
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    All processing happens locally — your images never leave this device
                </p>
            </div>
        </div>
    );
}
