import { Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
}

export function Header({ onReset, showReset }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
                        <Search className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gradient">
                            Visual Search Engine
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            Offline Similarity Intelligence
                        </p>
                    </div>
                </div>

                {showReset && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-white/10 text-sm font-medium transition-all group border border-white/5"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        New Search
                    </motion.button>
                )}
            </div>
        </header>
    );
}
