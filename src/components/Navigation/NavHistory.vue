<!--
 * @Author: llm llm@itcast.cn
 * @Date: 2026-03-25 10:17:51
 * @LastEditors: llm llm@itcast.cn
 * @LastEditTime: 2026-03-25 11:35:41
 * @FilePath: \chatgpt-vue3-light-mvp-main\src\components\Navigation\NavHistory.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script lang="ts">
// 显式声明组件名称，帮助 IDE 识别导出
export default {
  name: 'NavHistory'
}
</script>

<script setup lang="ts">

import { useBusinessStore } from '@/store/business'
import { computed } from 'vue'
const businessStore = useBusinessStore()
const list = computed(() => businessStore.historyList)
const emit = defineEmits([ 'select', 'new-chat'])

// 点击历史项，通知父组件切换
const handleSelect = (item: any) => {
  emit('select', item)
}
const handleNewChat = () => {
  emit('new-chat')
}
</script>

<template>
  <div class="h-full flex flex-col bg-#fafafa dark:bg-#18181c border-r border-solid border-#efeff5 dark:border-#333">
    <div class="p-16px text-16 font-bold border-b border-solid border-#efeff5 dark:border-#333 flex items-center gap-8px">
      <i class="i-hugeicons:time-schedule w-20px h-20px"></i>
      历史对话
    </div>

    <div class="flex-1 overflow-y-auto p-12px">
      <div
        v-if="businessStore.historyList.length === 0"
        class="text-center c-#999 mt-20px"
      >
        暂无记录
      </div>

      <div
        v-for="item in list"
        :key="item.id"
        class="p-12px mb-8px border-rounded cursor-pointer hover:bg-#efeff5 dark:hover:bg-#2a2a2a transition-all border-1 border-transparent hover:border-primary:30"
        @click="handleSelect(item)"
      >
        <div class="text-14 font-medium truncate mb-4px">{{ item.title }}</div>
        <div class="text-12 c-#999">{{ item.time }}</div>
      </div>
    </div>
    <div class="p-16px border-t border-solid border-#efeff5 dark:border-#333 bg-white dark:bg-#18181c">
      <n-button
        block
        strong
        secondary
        type="primary"
        @click="handleNewChat"
      >
        <template #icon>
          <i class="i-hugeicons:add-01 w-18px h-18px"></i>
        </template>
        开启新对话
      </n-button>
    </div>
  </div>
</template>
