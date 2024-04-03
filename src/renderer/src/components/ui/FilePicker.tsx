export default function (props: { onChange: (val: string) => void; path: string }) {
  return (
    <div class="h-full max-w-lg overflow-hidden">
      <label
        for="file"
        class="w-ful flex h-full cursor-pointer flex-nowrap items-center rounded-md p-1  hover:bg-dark-con "
      >
        <span class="w-full truncate text-ellipsis">{props.path}</span>
        <input
          id="file"
          type="file"
          class="hidden"
          accept=".bin,.gguf"
          multiple={false}
          onChange={async (e) => {
            const file = e.target.files![0]
            if (file) {
              props.onChange(file.path)
            }
          }}
        />
      </label>
    </div>
  )
}
