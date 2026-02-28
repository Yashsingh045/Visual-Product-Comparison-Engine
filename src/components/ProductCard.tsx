import { toFileUrl } from '@/lib/ipc';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ProductCardProps {
    id: number;
    imagePath: string;
    similarity: number;
    isSelected?: boolean;
    onSelect: () => void;
    index: number;
}

export function ProductCard({ id, imagePath, similarity, isSelected, onSelect, index }: ProductCardProps) {
    const similarityPercent = Math.round(similarity * 100);

    // Dynamic color based on confidence
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
        if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    };

    // The database contains paths like 'data/images/0.jpg'
    // The toFileUrl helper will convert this to a working local file link.


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: "easeOut"
            }}
            whileHover={{ y: -5 }}
            layout
        >
            <Card
                onClick={onSelect}
                className={`
          relative cursor-pointer group glass overflow-hidden transition-all duration-300 border-white/5
          ${isSelected ? 'ring-2 ring-primary border-primary/50 glow-primary' : 'hover:border-primary/30'}
        `}
            >
                <div className="relative aspect-[3/4] overflow-hidden">
                    <motion.img
                        src={toFileUrl(imagePath)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            console.error(`Failed to load image: ${imagePath}`);
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />

                    <div className="absolute top-3 right-3 z-10">
                        <Badge className={`backdrop-blur-md border px-2 py-0.5 text-[10px] font-bold ${getScoreColor(similarityPercent)}`}>
                            {similarityPercent}% Match
                        </Badge>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="w-full">
                            <div className="h-[2px] w-0 group-hover:w-full bg-primary transition-all duration-500" />
                            <p className="text-[10px] text-white font-bold tracking-widest mt-2 uppercase">Deep Visual Analysis</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Product ID</span>
                        <p className="text-sm font-bold text-foreground font-mono">#{id}</p>
                    </div>

                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-40 group-hover:opacity-100" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
