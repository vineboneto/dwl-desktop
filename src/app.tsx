import { useState } from 'react'

import './styles/global.css'

type ProgressData = {
  progress: number
  size: string
  transferred: string
  estimated: string
}

export function App() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=_LLCz1FCWrY')
  const [progress, setProgress] = useState(null as unknown as ProgressData)
  const [isLoading, setIsLoading] = useState(false)

  function sendURL() {
    window.Main.sendMessage(url)
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
        <input name="URL" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={() => sendURL()} disabled={isLoading}>
          SEND
        </button>
        {isLoading && <p id="loading">Loading...</p>}
        {progress && (
          <div className="app-progress">
            <p id="size">Size: {progress?.size}</p>
            <p id="transferred">Transferred: {progress?.transferred}</p>
            <p id="estimated">Estimated: {progress?.estimated}</p>
            <p id="progress">{progress?.progress}%</p>
          </div>
        )}
      </div>
    </div>
  )
}
