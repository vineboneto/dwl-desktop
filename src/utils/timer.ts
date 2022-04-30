function formatter(n: number) {
  if (n < 10) return `0${n}`
  return n
}

export function toTime(seconds: number) {
  const h = Math.floor(seconds / (60 * 60))

  const divisor_for_minutes = seconds % (60 * 60)
  const m = Math.floor(divisor_for_minutes / 60)

  const divisor_for_seconds = divisor_for_minutes % 60
  const s = Math.ceil(divisor_for_seconds)

  return `${h ? `${formatter(h)}:` : ''}${m ? `${formatter(m)}:${formatter(s)}` : `${formatter(s)}s`}`
}
