import { type SearchResultItem, toFileUrl } from '@/lib/ipc';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Info, PieChart, ScanFace } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonViewProps {
    queryImage: string;
    selectedProduct: SearchResultItem;
    onBack: () => void;
}

export function ComparisonView({ queryImage, selectedProduct, onBack }: ComparisonViewProps) {
    const similarityPercent = Math.round(selectedProduct.similarity * 100);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 pt-32 pb-12"
        >
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Results
                </Button>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-gradient">Deep Analysis</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Side-By-Side Visual Comparison</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Query Product */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative group glass rounded-3xl overflow-hidden border-white/5 shadow-2xl"
                >
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                        Query Search Source
                    </div>
                    <img
                        src={toFileUrl(queryImage)}
                        className="w-full h-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Query"
                    />
                </motion.div>

                {/* Matched Product */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative group glass rounded-3xl overflow-hidden border-white/5 shadow-2xl"
                >
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-widest">
                        Matched Catalog ID: #{selectedProduct.id}
                    </div>
                    <img
                        src={toFileUrl(selectedProduct.imagePath)}
                        className="w-full h-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Match"
                        onError={(e) => {
                            console.error(`Comparison View: Failed to load image ${selectedProduct.imagePath}`);
                            (e.target as HTMLImageElement).style.opacity = '0.3';
                        }}
                    />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="glass rounded-3xl p-8 border-white/5 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <PieChart className="w-32 h-32 text-primary" />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Neural Confidence</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black text-gradient leading-none">{similarityPercent}%</span>
                            <span className="text-sm text-muted-foreground font-mono">Similarity</span>
                        </div>
                        <div className="mt-6 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${similarityPercent}%` }}
                                transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-primary glow-primary"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <ScanFace className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Vector Embedding</p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                The images share significant overlap in the spatial distribution of 2048 high-level visual features.
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <Info className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Metadata Context</p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Analyzed via ResNet-50 offline intelligence. Matching score is based on cosine distance.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
