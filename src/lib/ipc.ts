// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ipcRenderer } = (window as any).require('electron');

export interface SearchResultItem {
    id: number;
    imagePath: string;
    title?: string;
    similarity: number;
}

export interface SearchResponse {
    success: boolean;
    results?: SearchResultItem[];
    message?: string;
}

/**
 * Sends an image path to the Electron main process for visual similarity search.
 * @param filePath Absolute path to the query image file.
 * @returns Search results with similar products.
 */
export async function searchByImage(filePath: string): Promise<SearchResponse> {
    try {
        const response = await ipcRenderer.invoke('search-image', filePath);
        return response as SearchResponse;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to communicate with backend.',
        };
    }
}

/**
 * Opens Electron's native file dialog to pick an image file.
 * @returns The selected file path or null if cancelled.
 */
export async function openFileDialog(): Promise<string | null> {
    try {
        const response = await ipcRenderer.invoke('open-file-dialog');
        if (response.success && response.filePath) {
            return response.filePath;
        }
        return null;
    } catch (error) {
        console.error('File dialog error:', error);
        return null;
    }
}

/**
 * Converts an absolute file path to a file:// URL for use in <img> tags.
 */
export function toFileUrl(absolutePath: string): string {
    if (!absolutePath) return '';
    // Normalize path and create file:// URL
    return `file://${absolutePath.replace(/\\/g, '/')}`;
}
