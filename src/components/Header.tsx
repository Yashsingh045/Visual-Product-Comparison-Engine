import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

interface HeaderProps {
    showReset: boolean;
    onReset: () => void;
}

export function Header({ showReset, onReset }: HeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                    <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">
                        Visual Search Engine
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Find visually similar fashion products
                    </p>
                </div>
            </div>

            {showReset && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    New Search
                </Button>
            )}
        </header>
    );
}
