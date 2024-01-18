import Plus from '@renderer/assets/icon/base/Plus'

export default function () {
  return (
    <div class="max-w-[100%] overflow-hidden">
      <div class="mb-5 animate-scale-down-entrance select-none p-2">
        <label for="file" class="cursor-pointer">
          <div
            class="group/create relative m-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4"
            onClick={() => {}}
          >
            <Plus
              height={30}
              width={30}
              class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
            />

            <span class="text-base">添加一个记忆胶囊 💊</span>
            <input
              id="file"
              type="file"
              class="hidden"
              accept=".md"
              multiple={false}
              onChange={async (e) => {
                const file = e.target.files![0]
                e.target.value = ''
                if (file) {
                  console.log(file)
                }
              }}
            />
          </div>
        </label>
      </div>
    </div>
  )
}
