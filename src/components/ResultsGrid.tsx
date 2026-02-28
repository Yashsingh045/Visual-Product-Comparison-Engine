import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from './ProductCard';
import { ArrowLeftRight, ImageIcon } from 'lucide-react';
import type { SearchResultItem } from '@/lib/ipc';
import { toFileUrl } from '@/lib/ipc';

interface ResultsGridProps {
    queryImagePath: string;
    results: SearchResultItem[];
    thumbnailsDir: string;
    onCompare: (product: SearchResultItem) => void;
}

export function ResultsGrid({ queryImagePath, results, thumbnailsDir, onCompare }: ResultsGridProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const selectedProduct = results.find((r) => r.id === selectedId);

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[80vh]">
            {/* Left Panel — Query Image */}
            <div className="lg:w-80 shrink-0">
                <div className="sticky top-24">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Your Query Image
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-border bg-card">
                        <img
                            src={toFileUrl(queryImagePath)}
                            alt="Query"
                            className="w-full aspect-square object-cover"
                        />
                    </div>

                    {selectedProduct && (
                        <Button
                            onClick={() => onCompare(selectedProduct)}
                            className="w-full mt-4 gap-2 bg-primary hover:bg-primary/90"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            Compare Side-by-Side
                        </Button>
                    )}

                    <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">{results.length}</span> similar products found
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Click any result to select it for comparison
                        </p>
                    </div>
                </div>
            </div>

            <Separator orientation="vertical" className="hidden lg:block" />

            {/* Right Panel — Results Grid */}
            <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Similar Products
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isSelected={selectedId === product.id}
                            thumbnailsDir={thumbnailsDir}
                            onClick={() => setSelectedId(selectedId === product.id ? null : product.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
