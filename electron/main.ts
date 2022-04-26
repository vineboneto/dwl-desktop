import path from 'path'
import { exec } from 'child_process'
import { app, BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

function createWindow() {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function registerListeners() {
  ipcMain.on('message', (event, message) => {
    const youtubeDlPath = path.join(__dirname, '..', '..', 'node_modules', 'youtube-dl-exec', 'bin', 'youtube-dl.exe')
    console.log(youtubeDlPath)
    const download = exec(`${youtubeDlPath} -x --audio-format mp3 ${message}`)
    download.stdout?.on('data', data => {
      let output = data
        .trim()
        .split(' ')
        .filter(n => n)
      if (output[0] === '[download]' && parseFloat(output[1])) {
        event.reply('URL:PROGRESS', {
          progress: parseFloat(output[1]),
          size: output[3],
          transferred: output[5],
          estimated: output[7],
        })
      }
    })

    download.stdout?.on('end', data => {
      console.log('stdout end', data)
    })

    download.stdout?.on('close', data => {
      console.log('stdout close', data)
    })

    download.stderr?.on('end', data => {
      console.log('end', data)
    })

    download.stderr?.on('close', data => {
      console.log('close', data)
    })

    download.stderr?.on('data', data => {
      console.log('data', data)
    })
  })
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
