<script lang="tsx" setup>
import { defaultMockModelName, modelMappingList, triggerModelTermination } from '@/components/MarkdownPreview/models'
import { type InputInst } from 'naive-ui'
import type { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import { isGithubDeployed } from '@/config'

import { UAParser } from 'ua-parser-js'

import NavHistory from '@/components/Navigation/NavHistory.vue'

const route = useRoute()
const router = useRouter()
const businessStore = useBusinessStore()//获取全局业务状态（当前选中的模型名、发送请求的方法）


const modelListSelections = computed(() => {
  return modelMappingList.map<SelectBaseOption>((modelItem) => {
    let disabled = false
    if (isGithubDeployed && modelItem.modelName !== defaultMockModelName) {
      disabled = true
    }

    return {
      label: modelItem.label,
      value: modelItem.modelName,
      // Github 演示环境禁用模型切换，拉取代码后可按自己需求修改
      disabled
    }
  })
})


const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 700)

//关键状态：AI是否正在生成回答
const stylizingLoading = ref(false)


/**
 * 输入字符串
 */
const inputTextString = ref('')
const refInputTextString = ref<InputInst | null>()

/**
 * 输出字符串 Reader 流（风格化的）
 */
const outputTextReader = ref<ReadableStreamDefaultReader | null>()

const refReaderMarkdownPreview = ref<any>()

const onFailedReader = () => {
  outputTextReader.value = null
  stylizingLoading.value = false
  if (refReaderMarkdownPreview.value) {
    refReaderMarkdownPreview.value.initializeEnd()
  }
  window.$ModalMessage.error('转换失败，请重试')
  setTimeout(() => {
    if (refInputTextString.value) {
      refInputTextString.value.focus()
    }
  })
  triggerModelTermination()
}
const onCompletedReader = (fullText: string = '') => {
  stylizingLoading.value = false
  if (isRestoringHistory.value) {
    isRestoringHistory.value = false // 恢复标志位
    triggerModelTermination()
    return
  }
  setTimeout(() => {
    if (refInputTextString.value) {
      refInputTextString.value.focus()
    }
  })
  // 1. 尝试第一种：组件传参
  // 2. 尝试第二种：组件暴露的变量
  // 3. 尝试第三种（保底）：直接抓取页面上渲染出来的文字
  const domContent = (document.querySelector('.markdown-wrapper') as HTMLElement)?.innerText || ''

  const finalContent = fullText || refReaderMarkdownPreview.value?.getExposeContent?.() || domContent

  // console.log('最终抓取到的内容:', finalContent)

  if (finalContent && userQuestion.value) {
    businessStore.saveToHistory(userQuestion.value, finalContent)
    // console.log('✅ 保存成功！你可以刷新页面看看左侧了')
  } else {
    // console.error('❌ 保存依然失败，内容为空')
  }

  triggerModelTermination()

}

const handleCreateStylized = async () => {
  // 若正在加载，则点击后恢复初始状态
  if (stylizingLoading.value) {
    refReaderMarkdownPreview.value.abortReader()
    onCompletedReader()
    return
  }


  if (refInputTextString.value && !inputTextString.value.trim()) {
    inputTextString.value = ''
    refInputTextString.value.focus()
    return
  }

  refReaderMarkdownPreview.value.resetStatus()
  refReaderMarkdownPreview.value.initializeStart()

  stylizingLoading.value = true
  const textContent = inputTextString.value
  userQuestion.value = textContent
  inputTextString.value = ''
  const { error, reader } = await businessStore.createAssistantWriterStylized({
    text: textContent
  })

  if (error) {
    onFailedReader()
    return
  }

  if (reader) {
    outputTextReader.value = reader
  }
}


const keys = useMagicKeys()
const enterCommand = keys['Meta+Enter']
const enterCtrl = keys['Ctrl+Enter']

const activeElement = useActiveElement()//实时告诉当前鼠标光标停在网页哪个元素上
const notUsingInput = computed(() => activeElement.value?.tagName !== 'TEXTAREA')

const parser = new UAParser()
const isMacos = computed(() => {
  const os = parser.getOS()
  if (!os) return

  const osName = os.name ?? ''
  return osName
    .toLocaleLowerCase()
    .includes?.('macos')
})

const placeholder = computed(() => {
  if (stylizingLoading.value) {
    return `输入任意问题...`
  }
  return `输入任意问题, 按 ${ isMacos.value ? 'Command' : 'Ctrl' } + Enter 键快捷开始...`
})

watch(
  () => enterCommand.value,
  () => {
    if (!isMacos.value || notUsingInput.value) return

    if (stylizingLoading.value) return

    if (!enterCommand.value) {
      handleCreateStylized()
    }
  },
  {
    deep: true
  }
)

watch(
  () => enterCtrl.value,
  () => {
    if (isMacos.value || notUsingInput.value) return

    if (stylizingLoading.value) return

    if (!enterCtrl.value) {
      handleCreateStylized()
    }
  },
  {
    deep: true
  }
)
const userQuestion = ref('')

const handleResetState = () => {
  inputTextString.value = ''

  userQuestion.value = ''

  stylizingLoading.value = false
  nextTick(() => {
    refInputTextString.value?.focus()
  })
  refReaderMarkdownPreview.value?.abortReader()
  refReaderMarkdownPreview.value?.resetStatus()
}
handleResetState()


const PromptTag = defineComponent({
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const handleClick = () => {
      inputTextString.value = props.text
      nextTick(() => {
        refInputTextString.value?.focus()
      })
    }
    return {
      handleClick
    }
  },
  render() {
    return (
      <div
        b="~ solid transparent"
        hover="shadow-[--shadow] b-primary bg-#e8e8e8"
        class={[
          'px-10 py-2 rounded-7 text-12',
          'max-w-230 transition-all-300 select-none cursor-pointer',
          'c-#525252 bg-#ededed'
        ]}
        style={{
          '--shadow': '3px 3px 3px -1px rgba(0,0,0,0.1)'
        }}
        onClick={this.handleClick}
      >
        <n-ellipsis
          tooltip={{
            contentClass: 'wrapper-tooltip-scroller',
            keepAliveOnHover: true
          }}
        >
          {{
            tooltip: () => this.text,
            default: () => this.text
          }}
        </n-ellipsis>
      </div>
    )
  }
})

const promptTextList = ref([
  '打个招呼吧，并告诉我你的名字',
  '使用中文，回答以下两个问题，分段表示\n1、你是什么模型？\n2、请分别使用 Vue3 和 React 编写一个 Button 组件，要求在 Vue3 中使用 Setup Composition API 语法糖，在 React 中使用 TSX 语法'
])
const showHistory = ref(true) // 默认显示

// 切换函数
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}
const isRestoringHistory = ref(false)
const onSelectHistory = (item: any) => {
  // 1. 将历史的问题填入你的 userQuestion
  userQuestion.value = item.question
  isRestoringHistory.value = true // 标记当前正在回显历史

  // 重置 Markdown 组件的打字机状态
  if (refReaderMarkdownPreview.value) {
    refReaderMarkdownPreview.value.resetStatus()
    refReaderMarkdownPreview.value.initializeStart()
  }

  // 【核心魔法】：伪造一个瞬间完成的数据流（Mock Reader）
  let isRead = false
  const mockReader = {
    read: async () => {
      if (!isRead) {
        isRead = true
        // 第一次读取：瞬间把历史回答的所有文字全部吐给组件
        return {
          done: false,
          value: item.answer
        }
      }
      // 第二次读取：告诉组件“我吐完了”
      return {
        done: true,
        value: undefined
      }
    },
    cancel: async () => {}
  }

  // 把伪造的流塞给组件，它就会乖乖渲染出来了
  outputTextReader.value = mockReader as any
}
const onNewChat = () => {
  // 1. 清空页面上的提问气泡、输入框、重置 Markdown 预览状态
  handleResetState()

  // 2. 如果你在小屏幕下有抽屉控制逻辑，可以在这里把侧边栏收起（可选）
  // if (window.innerWidth < 768) showHistory.value = false
}
</script>

<template>
  <LayoutCenterPanel
    :loading="loading"
  >
    <!-- 内容区域 -->
    <div
      flex="~ row"
      h-full
      overflow-hidden
    >
      <div
        :class="showHistory ? 'w-260px' : 'w-0'"
        class="transition-all duration-300 ease-in-out overflow-hidden border-r border-solid border-#efeff5 bg-#fafafa flex-shrink-0"
      >
        <NavHistory
          @select="onSelectHistory"
          @new-chat="onNewChat"
        />
      </div>
      <div
        flex="1 ~ col"
        min-w-0
        h-full
      >
        <div
          flex="~ justify-between items-center"
        >
          <n-button
            quaternary
            circle
            class="ml-10px"
            @click="toggleHistory"
          >
            <i
              :class="showHistory ? 'i-hugeicons:menu-open' : 'i-hugeicons:menu-01'"
              class="w-22px h-22px"
            ></i>
          </n-button>
          <NavigationNavBar>
            <template #right>
              <div
                flex="~ justify-center items-center wrap"
                class="text-16 line-height-16"
              >
                <span class="lt-xs:hidden">当前模型：</span>
                <div
                  flex="~ justify-center items-center"
                >
                  <n-select
                    v-model:value="businessStore.systemModelName"
                    class="w-280 lt-xs:w-260 pr-10 font-italic font-bold"
                    placeholder="请选择模型"
                    :disabled="stylizingLoading"
                    :options="modelListSelections"
                  />
                  <CustomTooltip
                    :disabled="false"
                  >
                    <div>注意：</div>
                    <div>
                      演示环境仅支持 “模拟数据模型”
                    </div>
                    <div>
                      如需测试其他模型请克隆<a
                        href="https://github.com/llm490/ai-chat-platform"
                        target="_blank"
                        class="px-2 underline c-warning font-bold"
                      >本仓库</a>到本地运行
                    </div>
                    <template #trigger>
                      <span
                        class="cursor-help font-bold c-primary text-17 i-ic:sharp-help"
                        ml-10
                        mr-24
                      ></span>
                    </template>
                  </CustomTooltip>
                </div>
              </div>
            </template>
          </NavigationNavBar>
        </div>

        <div
          flex="1 ~ col"
          min-h-0
          pb-20
        >
          <div
            v-if="userQuestion"
            class="px-24px mb-16px flex justify-end items-start gap-12px"
          >
            <div class="flex flex-col items-end max-w-70%">
              <div class="text-12 c-#909399 mb-4px font-bold">我的提问</div>

              <div class="px-16px py-10px bg-primary rounded-8px rounded-tr-0 whitespace-pre-wrap text-15 c-white shadow-sm">
                {{ userQuestion }}
              </div>
            </div>

            <div class="w-38px h-38px flex-shrink-0 rounded-full bg-white dark:bg-#2a2a2a flex items-center justify-center border-1 border-solid border-#e0e0e0 dark:border-#444 shadow-sm">
              <i class="i-arcticons:cat-avatar-generator w-26px h-26px c-#555 dark:c-#eee"></i>
            </div>
          </div>
          <MarkdownPreview
            ref="refReaderMarkdownPreview"
            v-model:reader="outputTextReader"
            :model="businessStore.currentModelItem?.modelName"
            :transform-stream-fn="businessStore.currentModelItem?.transformStreamValue"
            @failed="onFailedReader"
            @completed="onCompletedReader"
          />
        </div>

        <div
          flex="~ col items-center"
          flex-basis="10%"
          p="14px"
          py="0"
        >
          <div
            w-full
            flex="~ justify-start"
            class="px-1em pb-10"
          >
            <n-space>
              <PromptTag
                v-for="(textItem, idx) in promptTextList"
                :key="idx"
                :text="textItem"
              />
            </n-space>
          </div>
          <div
            relative
            flex="1"
            w-full
            px-1em
          >
            <n-input
              ref="refInputTextString"
              v-model:value="inputTextString"
              type="textarea"
              autofocus
              h-full
              class="textarea-resize-none text-15"
              :style="{
                '--n-border-radius': '20px',
                '--n-padding-left': '20px',
                '--n-padding-right': '20px',
                '--n-padding-vertical': '10px',
              }"
              :placeholder="placeholder"
            />
            <n-float-button
              position="absolute"
              :right="40"
              bottom="50%"
              :type="stylizingLoading ? 'primary' : 'default'"
              color
              :class="[
                stylizingLoading && 'opacity-90',
                'translate-y-50%'
              ]"
              @click.stop="handleCreateStylized()"
            >
              <div
                v-if="stylizingLoading"
                class="i-svg-spinners:pulse-2 c-#fff"
              ></div>
              <div
                v-else
                class="transform-rotate-z--90 text-22 c-#303133/70 i-hugeicons:start-up-02"
              ></div>
            </n-float-button>
          </div>
        </div>
      </div>
    </div>
    <!-- </div> -->
  </LayoutCenterPanel>
</template>

<style lang="scss" scoped>

</style>
