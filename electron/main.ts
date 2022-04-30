import ytdl from 'ytdl-core'
import path from 'path'
import fs from 'fs'
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
  ipcMain.on('message', async (event, message) => {
    const [channel] = message.split('||')
    if (channel === 'INFO') {
      const [channel_, url] = message.split('||')

      const isValidUrl = ytdl.validateURL(url)

      if (!isValidUrl) {
        event.reply('INFO', 'ERROR')
      }

      const [_, ID] = url?.split('watch?v=')

      const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${ID}`)

      event.reply('INFO', {
        title: info.videoDetails.title,
        seconds: Number(info.videoDetails.lengthSeconds),
        thumbnail: info.videoDetails.thumbnails[0],
      })
    } else {
      const [channel_, url, title, ext] = message.split('||')

      const isValidUrl = ytdl.validateURL(url)

      if (!isValidUrl) {
        event.reply('URL:PROGRESS', 'ERROR')
      }

      const [_, ID] = url?.split('watch?v=')

      let startTime: number

      const options: ytdl.downloadOptions = ext === 'mp3' ? { filter: 'audioonly' } : { filter: 'audioandvideo' }

      const stream = ytdl(`https://www.youtube.com/watch?v=${ID}`, options)

      stream.once('response', () => {
        startTime = Date.now()
      })

      stream.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total
        const downloadedSeconds = (Date.now() - startTime) / 1000
        const estimated = downloadedSeconds / percent - downloadedSeconds

        event.reply('URL:PROGRESS', {
          percent,
          downloadedSeconds,
          estimated,
        })
      })
      stream.pipe(fs.createWriteStream(`${process.env.USERPROFILE}/Downloads/${title}.${ext}`))

      stream.on('end', () => {
        event.reply('OK')
      })
    }
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
