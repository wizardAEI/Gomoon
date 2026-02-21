import Card from '@renderer/components/ui/Card';
import Switch from '@renderer/components/ui/SwitchItem';
import { onCleanup, onMount } from 'solid-js';
import SettingIcon from '@renderer/assets/icon/base/SettingIcon';
import QuestionMention from '@renderer/components/ui/QuestionMention';
import Select from '@renderer/components/ui/Select';
import Slider from '@renderer/components/ui/Slider';
import { setChatFontSize, setFontFamily, setOpenAtLogin, setQuicklyAnsKey, setTheme } from '@renderer/store/setting';
import { useToast } from '@renderer/components/ui/Toast';
import { settingStore, setIsOnTop, updateModelsToFile, setSendWithCmdOrCtrl, setQuicklyWakeUpKeys } from '../../store/setting';
import VersionDesc from './VersionDesc';
import { fontFamilyOption, themeOptions } from './theme';
import ModelEngineConfig from './ModelEngineConfig';
export default function Setting() {
    const toast = useToast();
    onMount(() => {
        onCleanup(() => {
            updateModelsToFile();
        });
    });
    return (<div class="flex h-full select-none flex-col gap-3 px-3 pt-2">
      <div class="flex select-none items-center gap-1 text-lg text-text1 lg:justify-center">
        <SettingIcon width={20} height={20}/> <span class="text-base font-medium">应用设置</span>{' '}
      </div>
      <div class="mx-auto flex w-full flex-col gap-3 overflow-auto pb-3 lg:max-w-4xl">
        <Card title="模型引擎配置" noPadding>
          <div class="px-4 pb-1 pt-2">
            <ModelEngineConfig />
          </div>
        </Card>
        <Card title="应用设置">
          <div class="flex flex-col gap-2">
            <Switch label="开机启动" checked={settingStore.openAtLogin} onCheckedChange={(v) => {
            setOpenAtLogin(v);
        }}/>
            <Switch label="是否将应用置顶" hint="置顶后也可以通过唤起快捷键隐藏和唤起" checked={settingStore.isOnTop} onCheckedChange={setIsOnTop}/>
            <div class="item-center flex justify-between gap-3">
              <span class="h-6">唤起应用快捷键</span>
              <input class={`px-2 py-[1px] text-center ${settingStore.quicklyWakeUpKeys.split('+').length > 2 ? 'max-w-[150px]' : 'max-w-[90px]'}`} value={settingStore.quicklyWakeUpKeys} placeholder="唤起应用快捷键" onKeyDown={(e) => {
            e.preventDefault();
            // 如果没有按下 Shift, Meta, Alt, Control 等特殊键, 则返回
            if (!e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                return false;
            }
            let SpecialKey = '';
            e.altKey && (SpecialKey += 'Alt+');
            e.shiftKey && (SpecialKey += 'Shift+');
            if (e.metaKey) {
                if (navigator.userAgent.includes('Mac')) {
                    SpecialKey += 'Cmd+';
                }
                else {
                    SpecialKey += 'Super+';
                }
            }
            e.ctrlKey && (SpecialKey += 'Ctrl+');
            // 判断是否是 Shift, Meta, Alt, Control 等特殊键, 如果是则阻止默认事件
            if (e.key === 'Shift' ||
                e.key === 'Meta' ||
                e.key === 'Alt' ||
                e.key === 'Control') {
                return false;
            }
            let key = e.key;
            // 空格
            if (key === ' ') {
                key = 'Space';
            }
            if (key.length === 1) {
                key = key.toUpperCase();
            }
            setQuicklyWakeUpKeys(SpecialKey + key);
            e.currentTarget.blur();
            return true;
        }}/>
            </div>
            <div class="item-center flex justify-between gap-3">
              <span class="h-6">
                快速问答快捷键 <QuestionMention content="通过快速连按唤起问答"/>{' '}
              </span>
              <div>
                {navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} + C +{' '}
                <input class="w-[24px] px-1 py-[1px] text-center" value={settingStore.quicklyAnsKey} placeholder="唤起应用快捷键" onKeyDown={(e) => {
            e.preventDefault();
            // 如果不是字母，则提示并返回
            if (!/[a-zA-Z]/.test(e.key) || e.key.length > 1) {
                toast.info('请在英文输入法下，输入字母');
                return false;
            }
            setQuicklyAnsKey(e.key.toUpperCase());
            return true;
        }}/>
              </div>
            </div>
            <Switch label={navigator.userAgent.includes('Mac')
            ? '使用 Command+Enter 发送信息'
            : '使用 Ctrl+Enter 发送信息'} hint="关闭后使用 Enter 发起对话" checked={settingStore.sendWithCmdOrCtrl} onCheckedChange={setSendWithCmdOrCtrl}/>
            <div class="item-center relative flex justify-between gap-3">
              <span class="h-6">主题设置</span>
              <div class="absolute right-0">
                <Select defaultValue={settingStore.theme} options={themeOptions} onSelect={(v) => {
            const slogan = themeOptions.find((item) => item.value === v.trim())?.slogan;
            slogan && toast.info(slogan);
            setTheme(v);
        }}/>
              </div>
            </div>
            <div class="item-center flex justify-between gap-3">
              <span class="h-6">聊天文字大小</span>
              <div class="max-w-32">
                <Slider value={settingStore.chatFontSize} min={12} max={18} onChange={(v) => {
            setChatFontSize(Number(v));
        }}/>
              </div>
            </div>
            <div class="item-center relative flex justify-between gap-3">
              <span class="h-6">文字主题</span>
              <div class="absolute right-0">
                <Select defaultValue={settingStore.fontFamily} options={fontFamilyOption} onSelect={(v) => {
            setFontFamily(v);
        }}/>
              </div>
            </div>
          </div>
        </Card>
        <Card title="更多信息">
          <div class="text-sm text-text2">
            <span>本项目开源于</span>
            <a href="https://github.com/wizardAEI/Gomoon" target="_blank">
              GitHub
            </a>
            <span>，您的 Star 和建议是对该项目最大的支持。</span>
          </div>
          <div class="mt-2 text-sm text-text2">
            <span>哈喽 👋，我在</span>
            <a href="https://space.bilibili.com/434118077/channel/collectiondetail?sid=2235600" target="_blank">
              哔哩哔哩
            </a>
            发布了教学视频，可以让你更加有效的使用 Gomoon，解锁更多功能！
          </div>
          <VersionDesc />
        </Card>
      </div>
    </div>);
}
