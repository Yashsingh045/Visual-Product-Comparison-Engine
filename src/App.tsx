import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ResultsGrid } from './components/ResultsGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ComparisonView } from './components/ComparisonView';
import { searchByImage, type SearchResultItem } from './lib/ipc';
import { motion, AnimatePresence } from 'framer-motion';

type AppState = 'idle' | 'loading' | 'results' | 'compare';

const SIMILARITY_THRESHOLD = 0.7; // 70% Confidence



function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [queryImage, setQueryImage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SearchResultItem | null>(null);

  useEffect(() => {
    console.log('App state changed to:', appState);
  }, [appState]);

  // Prevent default drag/drop behavior across the entire window
  useEffect(() => {
    const preventDefault = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const handleUpload = useCallback(async (filePath: string) => {
    console.log('Starting upload flow for:', filePath);
    setQueryImage(filePath);
    setAppState('loading');

    try {
      const response = await searchByImage(filePath);
      console.log('Search response received:', response);

      if (response.success && response.results) {
        // Filter results based on the 70% threshold
        const confidentResults = response.results.filter(r => r.similarity >= SIMILARITY_THRESHOLD);
        console.log(`Found ${confidentResults.length} confident matches (>= 70%) out of ${response.results.length} total.`);

        setSearchResults(confidentResults);
        setAppState('results');
      } else {
        console.error('Search failed:', response.message);
        setAppState('idle');
        alert(`Search Error: ${response.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Crash during handleUpload:', err);
      setAppState('idle');
    }
  }, []);

  const handleReset = useCallback(() => {
    console.log('Resetting app state');
    setAppState('idle');
    setQueryImage(null);
    setSearchResults([]);
    setSelectedProduct(null);
  }, []);

  const handleCompare = useCallback((product: SearchResultItem) => {
    console.log('Entering comparison mode for:', product.id);
    setSelectedProduct(product);
    setAppState('compare');
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-primary/30">
      <Header onReset={handleReset} showReset={appState !== 'idle'} />

      <main className="relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          {appState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <UploadZone onUpload={handleUpload} />
            </motion.div>
          )}

          {appState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner />
            </motion.div>
          )}

          {appState === 'results' && queryImage && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ResultsGrid
                queryImage={queryImage}
                results={searchResults}
                onCompare={handleCompare}
              />
            </motion.div>
          )}

          {appState === 'compare' && queryImage && selectedProduct && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5, ease: "circOut" }}
            >
              <ComparisonView
                queryImage={queryImage}
                selectedProduct={selectedProduct}
                onBack={() => setAppState('results')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent global background glow elements */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/5 blur-[100px] mix-blend-screen" />
      </div>
    </div>
  );
}



export default App;
