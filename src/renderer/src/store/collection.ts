import { createStore } from 'solid-js/store'
import { Collection } from 'src/main/models/model'

export const [collections, setCollections] = createStore<Collection[]>([])

export async function loadCollection() {
  const res = await window.api.getCollections()
  setCollections(res)
  return collections
}
