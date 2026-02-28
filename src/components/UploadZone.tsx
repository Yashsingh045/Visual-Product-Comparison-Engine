import { useState, useCallback } from 'react';
import { Upload, ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { openFileDialog } from '@/lib/ipc';

interface UploadZoneProps {
    onUpload: (filePath: string) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (!file) {
                console.warn('Drop event: No file found');
                return;
            }

            // In Electron 40+, (file as any).path might be undefined.
            // We use webUtils.getPathForFile(file) to get the absolute path.
            let filePath = (file as any).path as string;

            if (!filePath && (window as any).webUtils) {
                filePath = (window as any).webUtils.getPathForFile(file);
            }

            console.log('File dropped:', { name: file.name, path: filePath });

            if (filePath && /\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
                onUpload(filePath);
            } else {
                console.warn('Invalid file type or missing path:', filePath);
            }
        },
        [onUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleBrowse = useCallback(async () => {
        const filePath = await openFileDialog();
        if (filePath) {
            onUpload(filePath);
        }
    }, [onUpload]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-4"
                    >
                        <Sparkles className="w-3 h-3" />
                        AI-Powered Image Recognition
                    </motion.div>
                    <h2 className="text-4xl font-extrabold text-gradient mb-3 tracking-tight">
                        Drop your visual query
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Our engine leverages ResNet-50 neural networks to find deep visual patterns across your entire catalog.
                    </p>
                </div>

                <motion.div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleBrowse}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`
            relative cursor-pointer group
            flex flex-col items-center justify-center
            w-full h-80 rounded-3xl
            border border-dashed transition-all duration-500 overflow-hidden
            ${isDragOver
                            ? 'border-primary bg-primary/5 shadow-2xl'
                            : 'border-white/10 glass glass-hover'
                        }
          `}
                >
                    {/* Animated Background Mesh (Only on Drag) */}
                    <AnimatePresence>
                        {isDragOver && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none opacity-20"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                                <div className="absolute inset-0 bg-primary/20 blur-3xl" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scanner Line Effect */}
                    {isDragOver && (
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 shadow-[0_0_15px_rgba(139,92,246,0.8)]"
                        />
                    )}

                    <div
                        className={`
              flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-500
              ${isDragOver ? 'bg-primary/20 scale-110' : 'bg-white/5 group-hover:bg-primary/10 shadow-inner'}
            `}
                    >
                        {isDragOver ? (
                            <ImageIcon className="w-10 h-10 text-primary" />
                        ) : (
                            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                        )}
                    </div>

                    <p className="text-lg font-bold text-foreground mb-2">
                        {isDragOver ? 'Analyzing Pattern...' : 'Upload Product Photo'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">JPG</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">PNG</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">WEBP</span>
                    </div>

                    <div className="absolute bottom-6 flex items-center gap-2 text-[10px] text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Local Engine Ready
                    </div>
                </motion.div>

                {/* Decorative ambient glow */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full opacity-50" />
            </motion.div>
        </div>
    );
}
