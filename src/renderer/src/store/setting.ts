import { createStore } from 'solid-js/store'
import { CheckedState } from '@ark-ui/solid'

const [settingStore, setSettingStore] = createStore<{
  isOnTop: CheckedState
}>({
  isOnTop: false
})

export function setIsOnTop(v: boolean) {
  setSettingStore('isOnTop', v)
  return window.api.setIsOnTop(v as boolean)
}

export { settingStore, setSettingStore }
