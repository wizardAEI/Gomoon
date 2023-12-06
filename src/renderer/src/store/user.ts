import { createStore } from 'solid-js/store'

export interface User {
  firstTime: boolean
}

const [userData, setUserData] = createStore<User>({
  firstTime: true
})

export function loadUserData() {
  window.api.getUserData().then((data) => {
    setUserData('firstTime', data.firstTime)
  })
}

export function userHasUse() {
  window.api.haveUsed()
}

export { userData }
