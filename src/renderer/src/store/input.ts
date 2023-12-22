import { createStore } from 'solid-js/store'

interface InputStore {
  isNetworking: boolean
}

const [inputStore, setInputStore] = createStore<InputStore>({
  isNetworking: false
})

export function setNetworkingStatus(status: boolean) {
  setInputStore('isNetworking', status)
}

export { inputStore }
