import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import type { SearchResultItem } from '@/lib/ipc';
import { toFileUrl } from '@/lib/ipc';

interface ComparisonViewProps {
    queryImagePath: string;
    product: SearchResultItem;
    thumbnailsDir: string;
    onBack: () => void;
}

export function ComparisonView({ queryImagePath, product, thumbnailsDir, onBack }: ComparisonViewProps) {
    const similarityPercent = Math.round(product.similarity * 100);

    const imageId = product.imagePath.split('/').pop() || '';
    const productImageUrl = toFileUrl(`${thumbnailsDir}/${imageId}`);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Results
                </Button>

                <Badge
                    className={`
            text-sm px-4 py-1.5 font-mono font-bold
            ${similarityPercent >= 80
                            ? 'bg-emerald-500/90 text-white'
                            : similarityPercent >= 60
                                ? 'bg-amber-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                        }
          `}
                >
                    {similarityPercent}% Visual Match
                </Badge>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Query Image */}
                <div className="rounded-2xl overflow-hidden border border-border bg-card">
                    <div className="p-4 border-b border-border">
                        <p className="text-sm font-medium text-foreground">Your Image</p>
                        <p className="text-xs text-muted-foreground">Query uploaded for search</p>
                    </div>
                    <div className="aspect-square bg-secondary">
                        <img
                            src={toFileUrl(queryImagePath)}
                            alt="Query"
                            className="w-full h-full object-contain p-2"
                        />
                    </div>
                </div>

                {/* Matched Product */}
                <div className="rounded-2xl overflow-hidden border border-primary/30 bg-card">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Matched Product</p>
                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary/30">
                            Top Match
                        </Badge>
                    </div>
                    <div className="aspect-square bg-secondary">
                        <img
                            src={productImageUrl}
                            alt={`Product ${product.id}`}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = toFileUrl(product.imagePath);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Similarity Details */}
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                    <ArrowLeftRight className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">Similarity Analysis</h3>
                </div>

                <Separator className="mb-4" />

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-foreground">{similarityPercent}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Visual Similarity</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">2048</p>
                        <p className="text-xs text-muted-foreground mt-1">Feature Dimensions</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">Cosine</p>
                        <p className="text-xs text-muted-foreground mt-1">Distance Metric</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
