import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.webContents.openDevTools()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('save-operations', async (_event, { uniqueId, jobData }) => {
    console.log('Saving operations:', uniqueId, jobData);
    const fileName = `part_${uniqueId}.json`;
    const data = JSON.stringify(jobData, null, 2);
    
    // Use getPath('userData') to get the correct directory for user data
    const userDataPath = app.getPath('userData');
    const partsDirectory = path.join(userDataPath, 'parts');
    
    // Create the 'parts' directory if it doesn't exist
    if (!fs.existsSync(partsDirectory)) {
      fs.mkdirSync(partsDirectory, { recursive: true });
    }
  
    const filePath = path.join(partsDirectory, fileName);
    
    try {
      fs.writeFileSync(filePath, data);
      console.log('Operations saved successfully to:', filePath);
      return { success: true, filePath };
    } catch (error) {
      console.error('Error saving operations:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  
  

  ipcMain.handle('fetch-job-details', async (_event, jobId) => {
    try {
      const userDataPath = app.getPath('userData');
      const partsDirectory = path.join(userDataPath, 'parts');
      
      // Search the parts directory for the file with the matching jobId
      const files = fs.readdirSync(partsDirectory);
      const matchingFile = files.find(file => file.includes(jobId));
  
      if (matchingFile) {
        const filePath = path.join(partsDirectory, matchingFile);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const jobData = JSON.parse(fileContents);
        console.log('Job details fetched successfully:', jobData);
        return { success: true, jobData };
      } else {
        return { success: false, error: 'File not found' };
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      return { success: false, error: (error as Error).message };
    }
  });


ipcMain.handle('fetch-job-details-for-search', async (_event, jobId) => {
  try {
    const userDataPath = app.getPath('userData');
    const partsDirectory = path.join(userDataPath, 'parts');
    
    // Search the parts directory for files with the matching jobId
    const files = fs.readdirSync(partsDirectory);
    const matchingFiles = files.filter((file: string) => file.includes(jobId)); // Adjust filter logic as needed

    if (matchingFiles.length > 0) {
      const jobData = matchingFiles.map((file: string) => {
        const filePath = path.join(partsDirectory, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
      });
      console.log('Job details fetched successfully:', jobData);
      return { success: true, jobData };
    } else {
      return { success: false, error: 'No matching files found' };
    }
  } catch (error) {
    console.error('Error fetching job details:', error);
    return { success: false, error: (error as Error).message };
  }
});

})
