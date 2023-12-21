import Tesseract from 'tesseract.js'

let worker: Tesseract.Worker | undefined

export const init = async () => {
  worker = await Tesseract.createWorker('eng+chi_sim', undefined, {
    logger: (m) => {
      console.log(m)
    }
  })
}

export const recognizeText = async (
  img: File,
  logger: (m: Partial<Tesseract.LoggerMessage>) => void
) => {
  if (worker) {
    logger({
      status: '解析图片中'
    })
    const result = await worker?.recognize(img)
    return result.data.text
  } else {
    logger({
      status: '加载识别引擎中'
    })
    await init()
    const result = await worker!.recognize(img)
    return result.data.text
  }
}

export const terminate = async () => {
  await worker?.terminate()
}
