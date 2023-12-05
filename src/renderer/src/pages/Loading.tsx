import Loading from '@renderer/components/ui/Loading'

export default function () {
  return (
    <div class="flex h-full flex-col items-center justify-center gap-6 pb-20 text-white">
      <Loading />
      <span class="bg-cyber-pro bg-clip-text text-right text-transparent">
        “这是我在夜之城唯一能守护你的办法”
        <br />
        --- 赛博朋克边缘行者
      </span>
    </div>
  )
}
