import ErrorIcon from '@renderer/assets/icon/base/Toast/ErrorIcon'
import SuccessIcon from '@renderer/assets/icon/base/Toast/SuccessIcon'
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon'
import {
  Accessor,
  For,
  JSX,
  JSXElement,
  Setter,
  Show,
  createContext,
  createSignal,
  useContext
} from 'solid-js'
import { Portal } from 'solid-js/web'

export interface ToastType {
  id: number
  text: string | JSXElement
  type: string
  duration: number
  position: string
  callback?: (res: any) => any
}

interface ToastConf {
  duration?: number
  position?: string
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
            <div class="flex animate-popup flex-col gap-2 rounded-lg bg-dark-con shadow-center">
              <div class={`m-2 flex max-w-xs items-center gap-1`}>
                <span class="flex">{Icon[toast.type]}</span>
                <span>{toast.text}</span>
              </div>
              <Show when={toast.type === 'confirm'}>
                <div class="mb-2 flex w-full justify-around">
                  <button
                    class="ml-2 text-white hover:text-opacity-70"
                    onClick={() => {
                      toast.callback!(false)
                    }}
                  >
                    取消
                  </button>
                  <button
                    class="text-white hover:text-opacity-70"
                    onClick={() => {
                      toast.callback!(true)
                    }}
                  >
                    确定
                  </button>
                </div>
              </Show>
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

  async function showConfirm(
    text: string | JSXElement,
    duration: number,
    position: string
  ): Promise<boolean> {
    const id = Date.now()
    return new Promise((resolve) => {
      setShowToast((t) => [
        ...t,
        {
          id,
          text,
          type: 'confirm',
          duration,
          position,
          callback: (res) => {
            setShowToast((ts) => ts.filter((t) => t.id !== id))
            resolve(res)
          }
        }
      ])
    })
  }
  return {
    success: (text: string, conf: ToastConf = {}) =>
      show(text, 'success', conf.duration || 1500, conf.position || 'top-1/3'),
    warning: (text: string, conf: ToastConf = {}) =>
      show(text, 'warning', conf.duration || 1500, conf.position || 'top-1/3'),
    error: (text: string, conf: ToastConf = {}) =>
      show(text, 'error', conf.duration || 1500, conf.position || 'top-1/3'),
    info: (text: string, conf: ToastConf = {}) =>
      show(text, 'info', conf.duration || 1500, conf.position || 'top-1/3'),
    confirm: (text: string | JSXElement, conf: ToastConf = {}) =>
      showConfirm(text, conf.duration || 1500, conf.position || 'top-1/3')
  }
}
