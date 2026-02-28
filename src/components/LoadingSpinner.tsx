import { motion } from 'framer-motion';

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer Rotating Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full"
                />

                {/* Inner Pulsing Core */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-24 h-24 bg-primary/20 rounded-full blur-2xl glow-primary"
                />

                {/* Scanning Beam */}
                <motion.div
                    animate={{ height: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute left-0 right-0 top-0 w-full bg-gradient-to-b from-transparent via-primary/40 to-transparent z-10"
                />

                <div className="relative text-center">
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="text-primary font-mono text-xs font-bold uppercase tracking-widest"
                    >
                        Inference
                    </motion.div>
                    <div className="text-foreground text-3xl font-black mt-1">
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
                        >
                            ...
                        </motion.span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <h3 className="text-xl font-bold text-gradient mb-2">Analyzing Visual Features</h3>
                <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-relaxed">
                    Extracting 2048-dimensional embedding from the ResNet-50 neural network...
                </p>
            </div>

            {/* Decorative ambient background sparks */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/5 to-transparent -z-10" />
        </div>
    );
}
