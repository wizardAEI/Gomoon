/**
 * Migrate old Models format to new ModelsConfig (providers + enabledModels)
 */
import { ulid } from 'ulid';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isOldModels(m) {
    if (!m || typeof m !== 'object')
        return false;
    const o = m;
    return 'OpenAI' in o || 'providers' in o;
}
function hasNewFormat(m) {
    if (!m || typeof m !== 'object')
        return false;
    const o = m;
    return Array.isArray(o.providers) && Array.isArray(o.enabledModels);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateModels(models) {
    if (hasNewFormat(models))
        return models;
    if (!isOldModels(models))
        return { providers: [], enabledModels: [] };
    const providers = [];
    const enabledModels = [];
    const addProvider = (name, apiKey, baseURL) => {
        if (!apiKey && !baseURL)
            return null;
        const id = ulid();
        providers.push({ id, name, apiKey: apiKey || '', baseURL: baseURL || '' });
        return id;
    };
    const addModel = (providerId, modelId, label, temp = 0.3) => {
        enabledModels.push({
            id: ulid(),
            providerId,
            modelId,
            label: label || modelId,
            temperature: temp
        });
    };
    // OpenAI
    const openai = models.OpenAI;
    if (openai?.apiKey || openai?.baseURL) {
        const pid = addProvider('OpenAI', openai.apiKey || '', openai.baseURL || '');
        if (pid) {
            addModel(pid, openai.customModel || 'gpt-4o', 'GPT-4o', openai.temperature ?? 0.3);
            addModel(pid, 'gpt-4o-mini', 'GPT-4 Mini', openai.temperature ?? 0.3);
        }
    }
    // DeepSeek
    const deepseek = models.DeepSeek;
    if (deepseek?.apiKey) {
        const pid = addProvider('DeepSeek', deepseek.apiKey, 'https://api.deepseek.com/v1');
        if (pid) {
            addModel(pid, 'deepseek-chat', 'DeepSeek V3', deepseek.temperature ?? 0.3);
            addModel(pid, 'deepseek-reasoner', 'DeepSeek R1', deepseek.temperature ?? 0.3);
        }
    }
    // Moonshot
    const moonshot = models.Moonshot;
    if (moonshot?.apiKey) {
        const pid = addProvider('Moonshot', moonshot.apiKey, moonshot.baseURL || 'https://api.moonshot.cn/v1');
        if (pid) {
            addModel(pid, 'moonshot-v1-8k', 'KIMI 8k', moonshot.temperature ?? 0.3);
            addModel(pid, 'moonshot-v1-32k', 'KIMI 32k', moonshot.temperature ?? 0.3);
            addModel(pid, 'moonshot-v1-128k', 'KIMI 128k', moonshot.temperature ?? 0.3);
        }
    }
    // Claude
    const claude = models.Claude;
    if (claude?.apiKey) {
        const pid = addProvider('Claude', claude.apiKey, claude.baseURL || '');
        if (pid) {
            addModel(pid, 'claude-3-5-sonnet-20240620', 'Claude Sonnet', claude.temperature ?? 0.3);
            addModel(pid, 'claude-3-opus-20240229', 'Claude Opus', claude.temperature ?? 0.3);
            addModel(pid, 'claude-3-haiku-20240307', 'Claude Haiku', claude.temperature ?? 0.3);
        }
    }
    // Ali QWen (OpenAI compatible)
    const qwen = models.AliQWen;
    if (qwen?.apiKey) {
        const pid = addProvider('千问', qwen.apiKey, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
        if (pid) {
            addModel(pid, 'qwen-turbo', '千问 Turbo', qwen.temperature ?? 0.3);
            addModel(pid, 'qwen-max', '千问 Max', qwen.temperature ?? 0.3);
            addModel(pid, 'qwen-long', '千问 Long', qwen.temperature ?? 0.3);
        }
    }
    // Ollama
    const ollama = models.Ollama;
    if (ollama?.address && ollama.model) {
        const baseURL = ollama.address.startsWith('http')
            ? `${ollama.address.replace(/\/$/, '')}/v1`
            : `http://${ollama.address}/v1`;
        const pid = addProvider('Ollama', 'ollama', baseURL);
        if (pid) {
            addModel(pid, ollama.model, 'Ollama', ollama.temperature ?? 0.3);
            if (ollama.model1)
                addModel(pid, ollama.model1, 'Ollama 备用1', ollama.temperature ?? 0.3);
            if (ollama.model2)
                addModel(pid, ollama.model2, 'Ollama 备用2', ollama.temperature ?? 0.3);
        }
    }
    // CustomModel
    const custom = models.CustomModel;
    if (custom?.models?.length) {
        for (const m of custom.models) {
            if (m.apiKey && m.customModel) {
                const pid = addProvider('自定义', m.apiKey, m.baseURL || '');
                if (pid)
                    addModel(pid, m.customModel, m.customModel, m.temperature ?? 0.3);
            }
        }
    }
    return { providers, enabledModels };
}
