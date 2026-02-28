import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 animate-ping" />
                {/* Inner spinner */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-card border border-border">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>

            <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-1">
                    Analyzing your image...
                </p>
                <p className="text-sm text-muted-foreground">
                    Extracting visual features and searching 20,000 products
                </p>
            </div>
        </div>
    );
}
