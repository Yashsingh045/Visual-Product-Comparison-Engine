import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { type SearchResultItem, toFileUrl } from '@/lib/ipc';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsGridProps {
    queryImage: string;
    results: SearchResultItem[];
    onCompare: (selectedProduct: SearchResultItem) => void;
}

export function ResultsGrid({ queryImage, results, onCompare }: ResultsGridProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const selectedProduct = results.find(r => r.id === selectedId);

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar: Query Info */}
                <aside className="lg:w-80 shrink-0">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="sticky top-32 glass rounded-3xl p-6 border-white/5 shadow-2xl overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-12 translate-x-12" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <Layers className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gradient">Your Query</h3>
                            </div>

                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 mb-6 group-hover:border-primary/50 transition-colors duration-500">
                                <motion.img
                                    layoutId="query-image"
                                    src={toFileUrl(queryImage)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Query Source</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Similarity Match</p>
                                    <p className="text-lg font-black text-foreground">{results.length} Matches</p>
                                </div>

                                <AnimatePresence>
                                    {selectedProduct && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <Button
                                                onClick={() => onCompare(selectedProduct)}
                                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold group glow-primary border-none"
                                            >
                                                Run Deep Compare
                                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!selectedProduct && (
                                    <p className="text-xs text-muted-foreground text-center italic border-t border-white/5 pt-4">
                                        Select a product result from the grid to run side-by-side analysis
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </aside>

                {/* Main Content: Results Grid */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl glass border-primary/20 flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gradient">Visual Results</h2>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ResNet-50 Pattern Extraction</p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {results.map((product, idx) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    index={idx}
                                    imagePath={product.imagePath}
                                    similarity={product.similarity}
                                    isSelected={selectedId === product.id}
                                    onSelect={() => setSelectedId(product.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
