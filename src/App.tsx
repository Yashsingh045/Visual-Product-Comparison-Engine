import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResultsGrid } from '@/components/ResultsGrid';
import { ComparisonView } from '@/components/ComparisonView';
import { searchByImage } from '@/lib/ipc';
import type { SearchResultItem } from '@/lib/ipc';

type AppState = 'idle' | 'loading' | 'results' | 'compare';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeRequire = (window as any).require;
const nodePath = nodeRequire('path');
const THUMBNAILS_DIR = nodePath.join(nodePath.resolve('.'), 'data', 'thumbnails');

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [queryImagePath, setQueryImagePath] = useState<string>('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [compareProduct, setCompareProduct] = useState<SearchResultItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (filePath: string) => {
    setQueryImagePath(filePath);
    setAppState('loading');
    setError(null);

    const response = await searchByImage(filePath);

    if (response.success && response.results) {
      setResults(response.results);
      setAppState('results');
    } else {
      setError(response.message || 'Search failed. Please try again.');
      setAppState('idle');
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setQueryImagePath('');
    setResults([]);
    setCompareProduct(null);
    setError(null);
  }, []);

  const handleCompare = useCallback((product: SearchResultItem) => {
    setCompareProduct(product);
    setAppState('compare');
  }, []);

  const handleBackToResults = useCallback(() => {
    setCompareProduct(null);
    setAppState('results');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        showReset={appState !== 'idle'}
        onReset={handleReset}
      />

      <main>
        {appState === 'idle' && (
          <>
            <UploadZone onUpload={handleUpload} />
            {error && (
              <div className="max-w-xl mx-auto px-6 -mt-4">
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}
          </>
        )}

        {appState === 'loading' && <LoadingSpinner />}

        {appState === 'results' && (
          <ResultsGrid
            queryImagePath={queryImagePath}
            results={results}
            thumbnailsDir={THUMBNAILS_DIR}
            onCompare={handleCompare}
          />
        )}

        {appState === 'compare' && compareProduct && (
          <ComparisonView
            queryImagePath={queryImagePath}
            product={compareProduct}
            thumbnailsDir={THUMBNAILS_DIR}
            onBack={handleBackToResults}
          />
        )}
      </main>
    </div>
  );
}

export default App;
