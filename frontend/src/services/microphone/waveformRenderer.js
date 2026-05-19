export function buildWaveformBins(samples = [], bins = 32) {
  if (!samples.length || bins <= 0) return Array.from({ length: bins }, () => 0)
  const chunk = Math.max(1, Math.floor(samples.length / bins))
  const output = []
  for (let i = 0; i < bins; i += 1) {
    const start = i * chunk
    const section = samples.slice(start, start + chunk)
    if (!section.length) {
      output.push(0)
      continue
    }
    const avg = section.reduce((sum, value) => sum + Math.abs(value), 0) / section.length
    output.push(Math.min(1, avg))
  }
  return output
}

