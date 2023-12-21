import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import { PPTXLoader } from 'langchain/document_loaders/fs/pptx'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import xlsx from 'xlsx'
import { Document } from 'langchain/document'
// import { OpenAIWhisperAudio } from 'langchain/document_loaders/fs/openai_whisper_audio'
import { readFile } from 'fs/promises'
import { app } from 'electron'
import { join } from 'path'
import { copyFileSync, mkdirSync } from 'fs'
import moment from 'moment'

export interface FileLoaderRes {
  content: string
  path: string
  filename: string
}

const appDataPath = app.getPath('userData')
const filesPath = join(appDataPath, 'file')

function processText(text: string) {
  // 多个换行变成一个换行
  text = text.replace(/\n+/g, '\n')
  // 去掉开头的换行
  text = text.replace(/^\n/, '')
  // 去掉结尾的换行
  text = text.replace(/\n$/, '')
  // 去掉开头的空格
  text = text.replace(/^\s+/, '')
  // 去掉结尾的空格
  text = text.replace(/\s+$/, '')

  return text
}

function processDocs(docs: Document<Record<string, any>>[]) {
  return processText(docs.reduce((acc, doc) => acc + doc.pageContent, '\n'))
}

async function parseTextFile(b: Blob) {
  const loader = new TextLoader(b)
  const docs = await loader.load()
  return processDocs(docs)
}
async function parsePDFFile(b: Blob) {
  const loader = new PDFLoader(b)
  const docs = await loader.load()
  return processDocs(docs)
}

async function parseDocxFile(b: Blob) {
  const loader = new DocxLoader(b)
  const docs = await loader.load()
  return processDocs(docs)
}

async function parsePPTXFile(b: Blob) {
  const loader = new PPTXLoader(b)
  const docs = await loader.load()
  return processDocs(docs)
}

async function parseXLSXFile(b: Buffer) {
  // 转化成arrayBuffer
  const arrayBuffer = new Uint8Array(b).buffer
  const workbook = xlsx.read(arrayBuffer, { type: 'array' })
  let content = ''
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName]
    content += xlsx.utils.sheet_to_csv(worksheet)
  })
  return processText(content)
}

async function parseJSONFile(b: Buffer) {
  const json = b.toString()
  return processText(json)
}

async function parseCSVFile(b: Blob) {
  const loader = new CSVLoader(b)
  const docs = await loader.load()
  return processDocs(docs)
}

// async function parseAudioFile(b: Blob) {
//   const loader = new OpenAIWhisperAudio(b, {
//     clientOptions: {
//       apiKey: 'spi-key'
//     }
//   })
//   const docs = await loader.load()
//   console.log(docs)
//   return docs.reduce((acc, doc) => acc + doc.pageContent, '\n')
// }

export default async function parseFile(
  files: {
    path: string
    type: string
  }[]
): Promise<FileLoaderRes> {
  const today = moment().format('YYYY-MM-DD')
  const targetPath = join(filesPath, `/${today}`)
  const targetFile = join(targetPath, files[0].path.split('/').pop()!)
  mkdirSync(targetPath, { recursive: true })
  copyFileSync(files[0].path, targetFile)
  const file = await readFile(targetFile)

  const b = new Blob([file], { type: files[0].type })
  let content = ''

  if (b.type === 'text/plain' || b.type === 'application/msword') {
    content = await parseTextFile(b)
  }
  if (b.type === 'application/pdf') {
    content = await parsePDFFile(b)
  }
  if (b.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    content = await parseDocxFile(b)
  }
  if (b.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    content = await parsePPTXFile(b)
  }
  if (b.type === 'application/json') {
    content = await parseJSONFile(file)
  }
  if (b.type === 'text/csv') {
    content = await parseCSVFile(b)
  }
  if (
    b.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    b.type === 'application/vnd.ms-excel'
  ) {
    content = await parseXLSXFile(file)
  }

  // .mp3,.mp4,.wav,.m4a,.webm,.mpga,.mpeg
  // if (
  //   b.type === 'audio/wav' ||
  //   b.type === 'audio/mpeg' ||
  //   b.type === 'audio/mp4' ||
  //   b.type === 'audio/webm' ||
  //   b.type === 'audio/wave' ||
  //   b.type === 'audio/x-wav'
  // ) {
  //   return parseAudioFile(b)
  // }
  return {
    content,
    path: targetPath,
    filename: files[0].path.split('/').pop()!
  }
}

parseFile([
  {
    path: '/Users/wangdejiang/Desktop/story.json',
    type: 'application/json'
  }
])
