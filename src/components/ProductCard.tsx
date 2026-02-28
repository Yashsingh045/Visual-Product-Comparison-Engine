import { Badge } from '@/components/ui/badge';
import type { SearchResultItem } from '@/lib/ipc';
import { toFileUrl } from '@/lib/ipc';

interface ProductCardProps {
    product: SearchResultItem;
    isSelected: boolean;
    onClick: () => void;
    thumbnailsDir: string;
}

export function ProductCard({ product, isSelected, onClick, thumbnailsDir }: ProductCardProps) {
    const similarityPercent = Math.round(product.similarity * 100);

    // Try thumbnail first, fall back to full image
    const imageId = product.imagePath.split('/').pop() || '';
    const thumbnailPath = `${thumbnailsDir}/${imageId}`;
    const imageUrl = toFileUrl(thumbnailPath);

    return (
        <div
            onClick={onClick}
            className={`
        group relative cursor-pointer rounded-xl overflow-hidden
        bg-card border transition-all duration-300
        hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/5
        ${isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/40'
                }
      `}
        >
            {/* Image */}
            <div className="aspect-square overflow-hidden bg-secondary">
                <img
                    src={imageUrl}
                    alt={`Product ${product.id}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback to full image if thumbnail is missing
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes(product.imagePath)) {
                            target.src = toFileUrl(product.imagePath);
                        }
                    }}
                />
            </div>

            {/* Similarity Badge */}
            <Badge
                className={`
          absolute top-2 right-2 font-mono text-xs font-bold
          ${similarityPercent >= 80
                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-500'
                        : similarityPercent >= 60
                            ? 'bg-amber-500/90 text-white hover:bg-amber-500'
                            : 'bg-red-500/90 text-white hover:bg-red-500'
                    }
        `}
            >
                {similarityPercent}%
            </Badge>

            {/* Info footer */}
            <div className="p-3 border-t border-border">
                <p className="text-xs text-muted-foreground truncate">
                    ID: {product.id}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-medium text-foreground">
                        {similarityPercent}% match
                    </p>
                    {isSelected && (
                        <span className="text-[10px] text-primary font-medium">Selected</span>
                    )}
                </div>
            </div>
        </div>
    );
}
