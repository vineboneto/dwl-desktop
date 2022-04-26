import { useState } from 'react'
import Loading from 'react-loading'
import './styles/global.css'

type ProgressData = {
  progress: number
  size: string
  transferred: string
  estimated: string
}
// https://www.youtube.com/watch?v=_LLCz1FCWrY
export function App() {
  const [url, setUrl] = useState('')
  const [progress, setProgress] = useState(null as unknown as ProgressData)
  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState('mp3' as 'mp3' | 'mp4')

  function sendURL() {
    if (isLoading) return
    window.Main.sendMessage(`${url}||${format}`)
    setIsLoading(true)
    setProgress(null as unknown as ProgressData)
    window.Main.on('URL:PROGRESS', data => {
      setIsLoading(false)
      setProgress(data)
    })
  }

  return (
    <div className="app">
      <div className="app-content">
        <input
          name="URL"
          placeholder="https://www.youtube.com/watch?v="
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          className="send"
          onClick={() => sendURL()}
          disabled={isLoading || (progress && progress?.progress !== 100)}
        >
          SEND
        </button>
        <div className="options">
          <span onClick={() => setFormat('mp3')} className={format === 'mp3' ? 'selected' : ''}>
            MP3
          </span>
          <span onClick={() => setFormat('mp4')} className={format === 'mp4' ? 'selected' : ''}>
            MP4
          </span>
        </div>
        {isLoading && (
          <div className="loading">
            <Loading type="bars" />
          </div>
        )}
        {progress && (
          <>
            <div className="app-progress">
              <p id="size">Size: {progress?.size}</p>
              <p id="estimated">Estimated: {progress?.estimated}</p>
              <p id="progress">{progress?.progress}%</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
