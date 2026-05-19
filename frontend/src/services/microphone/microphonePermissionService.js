export function getMicrophoneSupportStatus() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { supported: false, reason: 'unsupported_browser' }
  }
  return { supported: true, reason: 'ok' }
}

export async function queryMicrophonePermission() {
  if (typeof navigator === 'undefined') return 'unknown'
  try {
    if (!navigator.permissions?.query) return 'prompt'
    const result = await navigator.permissions.query({ name: 'microphone' })
    return result?.state || 'prompt'
  } catch {
    return 'prompt'
  }
}

