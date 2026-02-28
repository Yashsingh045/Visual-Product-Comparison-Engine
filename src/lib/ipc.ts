// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ipcRenderer: any;

try {
    // Dynamic require for Electron to avoid crashes in non-electron environments or during early Vite phases
    const electron = (window as any).require?.('electron');
    ipcRenderer = electron?.ipcRenderer;
    (window as any).webUtils = electron?.webUtils;
} catch (e) {
    console.warn('Electron IPC not available:', e);
}

// Fallback for types and safe calling
const safeIpc = {
    invoke: async (channel: string, ...args: any[]) => {
        if (!ipcRenderer) {
            console.error(`IPC Error: channel "${channel}" called but ipcRenderer is not available.`);
            return { success: false, message: 'IPC not available' };
        }
        return await ipcRenderer.invoke(channel, ...args);
    }
};


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
        const response = await safeIpc.invoke('search-image', filePath);
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
        const response = await safeIpc.invoke('open-file-dialog');
        if (response && response.success && response.filePath) {
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
