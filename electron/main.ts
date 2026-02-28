import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import * as db from './database/db'
import * as embeddingService from './services/embeddingService'
import * as indexService from './services/indexService'
import { registerSearchHandlers } from './ipc/searchHandler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function initializeServices() {
  try {
    console.log('Initializing backend services...')

    // 1. Initialize SQLite Database
    db.initDb()

    // 2. Load ML Model
    const modelPath = path.join(app.getAppPath(), 'ml/model/model.json')
    await embeddingService.loadModel(modelPath)

    // 3. Load HNSW Index
    const indexPath = path.join(app.getAppPath(), 'ml/index/vector.index')
    await indexService.loadIndex(indexPath)

    // 4. Register IPC Handlers
    registerSearchHandlers()

    console.log('All services initialized successfully.')
  } catch (error) {
    console.error('Initialization failed:', error)
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  await initializeServices()
  createWindow()
})

app.on('window-all-closed', () => {
  db.closeDb()
  if (process.platform !== 'darwin') app.quit()
})