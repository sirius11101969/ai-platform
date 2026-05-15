const fs = require('fs')
const path = require('path')

const MATERIALS_DIR = path.resolve(__dirname, '../../assets/materials')
const MATERIALS = [
  { key: 'presentation', title: 'Презентация AS6', fileName: 'presentation.pdf', fileType: 'pdf', mimeType: 'application/pdf', telegramMethod: 'sendDocument', telegramField: 'document' },
  { key: 'demo_video', title: 'Demo video', fileName: 'demo.mp4', fileType: 'video', mimeType: 'video/mp4', telegramMethod: 'sendVideo', telegramField: 'video' },
  { key: 'screenshot_1', title: 'Скриншот 1', fileName: 'screenshot-1.png', fileType: 'image', mimeType: 'image/png', telegramMethod: 'sendPhoto', telegramField: 'photo' },
  { key: 'screenshot_2', title: 'Скриншот 2', fileName: 'screenshot-2.png', fileType: 'image', mimeType: 'image/png', telegramMethod: 'sendPhoto', telegramField: 'photo' },
]

function withRuntimeState(material) {
  const filePath = path.join(MATERIALS_DIR, material.fileName)
  const exists = fs.existsSync(filePath)
  const sizeBytes = exists ? fs.statSync(filePath).size : 0
  return { ...material, exists, sizeBytes, path: filePath }
}

function listMaterials() {
  return MATERIALS.map(withRuntimeState)
}

function resolveMaterials(keys = []) {
  const requested = Array.isArray(keys) && keys.length ? keys : ['presentation']
  const materials = requested.map((key) => MATERIALS.find((item) => item.key === key)).filter(Boolean).map(withRuntimeState)
  const missing = materials.filter((item) => !item.exists)
  if (missing.length) {
    const error = Object.assign(new Error('Материал пока не загружен на сервер'), { statusCode: 400, missingMaterials: missing.map((item) => item.fileName) })
    throw error
  }
  return materials
}

module.exports = { MATERIALS_DIR, listMaterials, resolveMaterials }
