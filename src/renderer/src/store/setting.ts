import { createStore } from 'solid-js/store'

const [settingStore, setSettingStore] = createStore<{
  isOnTop: boolean
}>({
  isOnTop: false
})

export function setIsOnTop(v: boolean) {
  setSettingStore('isOnTop', v)
  return window.api.setIsOnTop(v as boolean)
}

export { settingStore, setSettingStore }
