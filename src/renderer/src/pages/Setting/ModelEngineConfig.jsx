import Collapse from '@renderer/components/ui/Collapse';
import EditInput from '@renderer/components/ui/EditInput';
import Slider from '@renderer/components/ui/Slider';
import QuestionMention from '@renderer/components/ui/QuestionMention';
import { For, createSignal } from 'solid-js';
import { settingStore, addProvider, updateProvider, removeProvider, addEnabledModel, updateEnabledModel, removeEnabledModel } from '@renderer/store/setting';
import { useToast } from '@renderer/components/ui/Toast';
export default function ModelEngineConfig() {
    const toast = useToast();
    const [loadingProviderId, setLoadingProviderId] = createSignal(null);
    const [providerModels, setProviderModels] = createSignal({});
    const fetchModels = async (provider) => {
        if (!provider.baseURL?.trim()) {
            toast.info('请先填写 baseURL');
            return;
        }
        setLoadingProviderId(provider.id);
        try {
            const res = await window.api.fetchProviderModels(provider.apiKey || 'ollama', provider.baseURL.replace(/\/$/, ''));
            const sorted = [...(res.data || [])].sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''));
            setProviderModels((prev) => ({ ...prev, [provider.id]: sorted }));
            toast.info(`获取到 ${(res.data || []).length} 个模型`);
        }
        catch (e) {
            toast.error(`获取模型失败: ${e instanceof Error ? e.message : String(e)}`);
            setProviderModels((prev) => ({ ...prev, [provider.id]: [] }));
        }
        finally {
            setLoadingProviderId(null);
        }
    };
    const addModel = (providerId, modelId) => {
        const provider = settingStore.models.providers.find((p) => p.id === providerId);
        if (!provider)
            return;
        const exists = settingStore.models.enabledModels.some((e) => e.providerId === providerId && e.modelId === modelId);
        if (exists) {
            toast.info('该模型已添加');
            return;
        }
        addEnabledModel({
            providerId,
            modelId,
            label: modelId,
            temperature: 0.3
        });
        toast.info(`已添加模型 ${modelId}`);
    };
    const getProviderName = (id) => settingStore.models.providers.find((p) => p.id === id)?.name ?? id;
    return (<div class="flex flex-col">
      {/* Provider 管理 */}
      <Collapse title={<div class="flex items-center gap-2">
            提供商 (Provider)
            <QuestionMention content="baseURL 需包含 /v1，如 https://api.openai.com/v1"/>
          </div>}>
        <div class="flex flex-col gap-3">
          <For each={settingStore.models.providers}>
            {(p) => (<div class="rounded-xl border border-gray/40 bg-dark-con/40 p-4 transition-colors hover:border-gray/60">
                <div class="mb-3 flex items-center justify-between">
                  <span class="font-medium text-text1">{p.name || '未命名'}</span>
                  <button class="rounded px-2 py-0.5 text-xs text-text2 transition-colors hover:bg-danger/20 hover:text-danger" onClick={() => removeProvider(p.id)}>
                    删除
                  </button>
                </div>
                <div class="flex flex-col gap-2">
                  <EditInput label="名称" value={p.name} onSave={(v) => updateProvider(p.id, { name: v.trim() })}/>
                  <EditInput label="apiKey" value={p.apiKey} onSave={(v) => updateProvider(p.id, { apiKey: v.trim() })}/>
                  <EditInput label="baseURL" value={p.baseURL} onSave={(v) => updateProvider(p.id, { baseURL: v.trim() })}/>
                </div>
                <button class="mt-3 w-fit rounded-lg bg-active/90 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:bg-active disabled:opacity-50" disabled={loadingProviderId() === p.id} onClick={() => fetchModels(p)}>
                  {loadingProviderId() === p.id ? '获取中...' : '获取可用模型'}
                </button>
                {providerModels()[p.id]?.length ? (<div class="mt-3 max-h-36 overflow-auto rounded-lg border border-gray/30 bg-dark/60 p-2">
                    <div class="mb-2 text-xs text-text2">点击添加至使用列表：</div>
                    <div class="flex flex-wrap gap-1.5">
                      <For each={providerModels()[p.id]}>
                        {(m) => (<button class="rounded-md bg-dark-con px-2.5 py-1 text-xs text-text1 transition-colors hover:bg-active hover:text-white" onClick={() => addModel(p.id, m.id)}>
                            {m.id}
                          </button>)}
                      </For>
                    </div>
                  </div>) : null}
              </div>)}
          </For>
          <button class="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray/50 px-4 py-3 text-sm text-text2 transition-colors hover:border-active hover:text-active" onClick={() => addProvider({
            name: '新建提供商',
            apiKey: '',
            baseURL: ''
        })}>
            <span class="text-base">+</span>
            新增 Provider
          </button>
        </div>
      </Collapse>

      {/* 已添加模型 */}
      <Collapse title={<div class="flex items-center gap-2">
            <span>已添加模型</span>
            <span class="rounded-full bg-active/20 px-2 py-0.5 text-xs text-active">
              {settingStore.models.enabledModels.length}
            </span>
          </div>}>
        <div class="flex flex-col gap-2">
          <For each={settingStore.models.enabledModels}>
            {(em) => (<div class="flex items-center justify-between gap-3 rounded-xl border border-gray/40 bg-dark-con/40 p-3 transition-colors hover:border-gray/60">
                <div class="min-w-0 flex-1">
                  <div class="truncate font-medium text-text1">{em.label || em.modelId}</div>
                  <div class="mt-0.5 truncate text-xs text-text2">
                    {getProviderName(em.providerId)} / {em.modelId}
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-text2">温度</span>
                    <div class="w-20">
                      <Slider value={em.temperature} percentage onChange={(v) => updateEnabledModel(em.id, { temperature: v })}/>
                    </div>
                  </div>
                  <button class="rounded px-2 py-0.5 text-xs text-text2 transition-colors hover:bg-danger/20 hover:text-danger" onClick={() => removeEnabledModel(em.id)}>
                    移除
                  </button>
                </div>
              </div>)}
          </For>
          {settingStore.models.enabledModels.length === 0 && (<div class="rounded-xl border border-dashed border-gray/40 py-8 text-center text-sm text-text2">
              暂无已添加模型，请先添加 Provider 并获取模型列表后点击添加
            </div>)}
        </div>
      </Collapse>
    </div>);
}
