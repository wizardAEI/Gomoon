import { Show, createContext, createSignal, useContext } from 'solid-js';
import Loading from './Loading';
const UIContext = createContext();
function LoadingWrap() {
    return (<Show when={useContext(UIContext)?.loading().show}>
      <div class="bg-mask fixed left-0 top-0 z-40 flex h-screen w-screen select-none items-center justify-center">
        <div class="flex translate-y-[-60px] flex-col items-center gap-4 text-text1">
          <Loading />
          {useContext(UIContext)?.loading().msg}
        </div>
      </div>
    </Show>);
}
export function LoadingProvider(props) {
    const [loading, setLoading] = createSignal({
        show: false,
        msg: ''
    });
    return (<UIContext.Provider value={{
            loading,
            setLoading
        }}>
      {props.children}
      <LoadingWrap />
    </UIContext.Provider>);
}
export function useLoading() {
    const { setLoading: setLoading } = useContext(UIContext);
    return {
        show: (msg) => {
            setLoading({
                show: true,
                msg
            });
        },
        hide: () => {
            setLoading({
                show: false,
                msg: ''
            });
        }
    };
}
