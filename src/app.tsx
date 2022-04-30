import { useState } from 'react'
import Loading from 'react-loading'

import * as utils from './utils'
import './styles/global.css'

type ProgressData = {
  percent: string
  downloadedSeconds: string
  estimated: string
}

type InfoData = {
  title: string
  seconds: number
  thumbnail: {
    url: string
    width: number
    height: number
  }
}

export function App() {
  const [url, setUrl] = useState('')
  const [progress, setProgress] = useState(null as ProgressData)
  const [info, setInfo] = useState(null as InfoData)
  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState('mp3' as 'mp3' | 'mp4')

  function sendURL() {
    if (isLoading || !url) return
    const title = info.title
    setIsLoading(true)
    setInfo(null)

    window.Main.sendMessage(`PROGESS||${url}||${title}||${format}`)
    window.Main.on('URL:PROGRESS', data => {
      if (data === 'ERROR') {
        alert('URL inválida')
        reset()
      } else {
        setProgress({
          percent: data.percent.toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 2 }),
          downloadedSeconds: utils.toTime(data.downloadedSeconds),
          estimated: utils.toTime(data.estimated),
        })
      }
    })

    let executable = 0

    window.Main.on('OK', () => {
      if (executable === 0) {
        reset()
        alert('Finish')
        executable = 1
      }
    })
  }

  async function getInfo() {
    if (isLoading || !url) return
    setIsLoading(true)

    window.Main.sendMessage(`INFO||${url}`)
    window.Main.on('INFO', data => {
      if (data === 'ERROR') {
        alert('URL inválida')
        reset()
      } else {
        setInfo(data)
        setIsLoading(false)
      }
    })
  }

  function reset() {
    setInfo(null)
    setUrl('')
    setProgress(null)
    setIsLoading(false)
  }

  return (
    <div className="app">
      <div className="app-content">
        <h1>DWL</h1>
        <input
          name="URL"
          placeholder="https://www.youtube.com/watch?v="
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        {!info && !progress ? (
          <button className="info" onClick={getInfo}>
            GET INFO
          </button>
        ) : (
          <button className="send" onClick={() => sendURL()} disabled={isLoading || progress?.percent === '100%'}>
            DOWNLOAD
          </button>
        )}

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

        {info && (
          <div className="app-info">
            <p id="title">{info.title}</p>
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img src={info.thumbnail.url} id="thumbnail" alt="thumbnail" />
            <p id="time">{utils.toTime(info.seconds)}</p>
            <button className="info" style={{ width: 125, marginTop: 20 }} onClick={reset}>
              Reset
            </button>
          </div>
        )}

        {progress && (
          <div className="app-progress">
            <p id="size">Total time : {progress?.downloadedSeconds}</p>
            <p id="estimated">Estimated: {progress?.estimated}</p>
            <p id="progress">{progress?.percent}</p>
          </div>
        )}

        {progress?.percent === '100%' && !isLoading && (
          <button className="info" style={{ width: 125, marginTop: 20 }} onClick={reset}>
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
