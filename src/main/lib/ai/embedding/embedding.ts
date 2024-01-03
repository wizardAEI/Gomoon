import '@tensorflow/tfjs-node'
import { TensorFlowEmbeddings } from 'langchain/embeddings/tensorflow'

const embeddings = new TensorFlowEmbeddings()

console.log(embeddings)

async function getTensor(text: string) {
  const tensors = await embeddings.embedDocuments([text])
  console.log(tensors)
}

getTensor('This is a sentence.')
