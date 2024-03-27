import { Accessor, Show, JSX, Setter, createContext, createSignal, useContext } from 'solid-js'

import Loading from './Loading'
interface LoadingConf {
  msg: string
  show: boolean
}

const UIContext = createContext<{
  loading: Accessor<LoadingConf>
  setLoading: Setter<LoadingConf>
}>()

function LoadingWrap() {
  return (
    <Show when={useContext(UIContext)?.loading().show}>
      <div class="fixed left-0 top-0 z-40 flex h-screen w-screen select-none items-center justify-center bg-black/80">
        <div class="flex translate-y-[-60px] flex-col items-center gap-4 text-text1">
          <Loading />
          {useContext(UIContext)?.loading().msg}
        </div>
      </div>
    </Show>
  )
}

export function LoadingProvider(props: { children: JSX.Element }) {
  const [loading, setLoading] = createSignal<LoadingConf>({
    show: false,
    msg: ''
  })

  return (
    <UIContext.Provider
      value={{
        loading,
        setLoading
      }}
    >
      {props.children}
      <LoadingWrap />
    </UIContext.Provider>
  )
}

export function useLoading() {
  const { setLoading: setLoading } = useContext(UIContext)!
  return {
    show: (msg: string) => {
      setLoading({
        show: true,
        msg
      })
    },
    hide: () => {
      setLoading({
        show: false,
        msg: ''
      })
    }
  }
}
