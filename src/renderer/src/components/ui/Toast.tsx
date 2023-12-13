import ErrorIcon from '@renderer/assets/icon/base/Toast/ErrorIcon'
import SuccessIcon from '@renderer/assets/icon/base/Toast/SuccessIcon'
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon'
import { Accessor, For, JSX, Setter, createContext, createSignal, useContext } from 'solid-js'
import { Portal } from 'solid-js/web'

export interface ToastType {
  id: number
  text: string
  type: string
  duration: number
  position: string
}

const UIContext = createContext<{
  toasts: Accessor<ToastType[]>
  setToasts: Setter<ToastType[]>
}>()

const Icon = {
  get success() {
    return <SuccessIcon width={20} height={20} class="text-success" />
  },
  get warning() {
    return <WarningIcon width={20} height={20} class="text-warning" />
  },
  get error() {
    return <ErrorIcon width={20} height={20} class="text-error" />
  }
}

export function ToastsContainer() {
  return (
    <Portal>
      <For each={useContext(UIContext)!.toasts()}>
        {(toast) => (
          <div class={'fixed left-1/2 z-50 -translate-x-1/2 select-none ' + toast.position}>
            <div
              class={`shadow-center mb-2 flex animate-popup items-center gap-1 rounded-lg bg-dark-con p-2 text-sm`}
            >
              {Icon[toast.type]} {toast.text}
            </div>
          </div>
        )}
      </For>
    </Portal>
  )
}

export function ToastProvider(props: { children: JSX.Element }) {
  const [showToast, setShowToast] = createSignal<ToastType[]>([])

  return (
    <UIContext.Provider
      value={{
        toasts: showToast,
        setToasts: setShowToast
      }}
    >
      {props.children}
      <ToastsContainer />
    </UIContext.Provider>
  )
}

export function useToast() {
  const { setToasts: setShowToast } = useContext(UIContext)!
  function show(text: string, type: string, duration: number, position: string) {
    const id = Date.now()
    setShowToast((t) => [...t, { id, text, type, duration, position }])
    setTimeout(() => {
      setShowToast((ts) => ts.filter((t) => t.id !== id))
    }, duration)
  }
  return {
    success: (text: string, conf = { duration: 1500, position: 'top-1/3' }) =>
      show(text, 'success', conf.duration, conf.position),
    warning: (text: string, conf = { duration: 1500, position: 'top-1/3' }) =>
      show(text, 'warning', conf.duration, conf.position),
    error: (text: string, conf = { duration: 1500, position: 'top-1/3' }) =>
      show(text, 'error', conf.duration, conf.position),
    info: (text: string, conf = { duration: 1500, position: 'top-1/3' }) =>
      show(text, 'info', conf.duration, conf.position)
  }
}
