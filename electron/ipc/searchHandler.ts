import { ipcMain, dialog } from 'electron';
import * as searchService from '../services/searchService';
import fs from 'fs';
import path from 'path';

/**
 * Registers IPC handlers for visual search.
 */
export function registerSearchHandlers() {
    /**
     * Handle 'search-image' request from frontend.
     * @param event Electron IPC event.
     * @param imagePath Path to the query image.
     */
    ipcMain.handle('search-image', async (event, imagePath: string) => {
        try {
            console.log(`IPC Received: search-image for path ${imagePath}`);

            // 1. Basic Validation
            if (!imagePath || typeof imagePath !== 'string') {
                return {
                    success: false,
                    message: 'Invalid image path provided.'
                };
            }

            // Security: Check if file exists and prevent directory traversal
            // (In a real app, you might restrict to certain directories)
            if (!fs.existsSync(imagePath)) {
                return {
                    success: false,
                    message: `File does not exist: ${imagePath}`
                };
            }

            // 2. Call Search Service
            const results = await searchService.search(imagePath);

            // 3. Return Structured Response
            return {
                success: true,
                results: results
            };

        } catch (error: any) {
            console.error('IPC Search Error:', error);

            // Fail gracefully - never crash Electron main process
            return {
                success: false,
                message: error.message || 'An unexpected error occurred during visual search.'
            };
        }
    });

    /**
     * Handle 'open-file-dialog' request — opens native file picker.
     */
    ipcMain.handle('open-file-dialog', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
            ]
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { success: false, message: 'No file selected.' };
        }

        return { success: true, filePath: result.filePaths[0] };
    });

    console.log('IPC Handlers registered: search-image, open-file-dialog');
}
