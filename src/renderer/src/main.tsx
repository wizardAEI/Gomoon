import { render } from 'solid-js/web'
import './assets/index.css'
import App from './App'
import { Router } from '@solidjs/router'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers'

export async function embedding(text: string) {
  const model = new HuggingFaceTransformersEmbeddings({
    modelName: 'Xenova/bert-base-chinese'
  })
  /* Embed queries */
  const res = await model.embedQuery(
    'What would be a good company name for a company that makes colorful socks?'
  )
  console.log({ res })
  /* Embed documents */
  const documentRes = await model.embedDocuments(['Hello world', 'Bye bye'])
  console.log({ documentRes })
}

embedding('Hello world')

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
