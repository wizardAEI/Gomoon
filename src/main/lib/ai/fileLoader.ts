import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import { PPTXLoader } from 'langchain/document_loaders/fs/pptx'
import { Document } from 'langchain/document'
// import { OpenAIWhisperAudio } from 'langchain/document_loaders/fs/openai_whisper_audio'
import { readFile } from 'fs/promises'
import { blob } from 'stream/consumers'

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
  paths: {
    path: string
    type: string
  }[]
) {
  const file = await readFile(paths[0].path)

  const b = new Blob([file], { type: paths[0].type })

  console.log(b.type)

  if (b.type === 'text/plain' || b.type === 'application/msword') {
    return parseTextFile(b)
  }
  if (b.type === 'application/pdf') {
    return parsePDFFile(b)
  }
  if (b.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDocxFile(b)
  }
  if (b.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return parsePPTXFile(b)
  }

  // 存储在本地

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
  return '<null>'
}
