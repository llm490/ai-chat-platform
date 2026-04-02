/*
 * @Author: llm llm@itcast.cn
 * @Date: 2026-03-23 10:17:00
 * @LastEditors: llm llm@itcast.cn
 * @LastEditTime: 2026-03-26 19:34:23
 * @FilePath: \chatgpt-vue3-light-mvp-main\src\store\business\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia'

import { sleep } from '@/utils/request'
import * as GlobalAPI from '@/api'


import * as TransformUtils from '@/components/MarkdownPreview/transform'

import { defaultModelName, modelMappingList } from '@/components/MarkdownPreview/models'

export interface BusinessState {
  systemModelName: string
  historyList: any[]
}

export const useBusinessStore = defineStore('business-store', {
  //数据仓库
  state: (): BusinessState => {
    return {
      systemModelName: defaultModelName, //使用的大模型
      historyList: JSON.parse(localStorage.getItem('chat_history') || '[]')
    }
  },
  //动态计算
  getters: {
    currentModelItem (state) {
      return modelMappingList.find(v => v.modelName === state.systemModelName)
    }
  },
  actions: {
    saveToHistory(question: string, answer: string) {
      if (!question || !answer) return

      const newItem = {
        id: Date.now(),
        // 截取提问的前20个字作为侧边栏显示的标题
        title: question.trim().slice(0, 20) || '新对话',
        question,
        answer,
        time: new Date().toLocaleString()
      }

      // 插入到数组开头（最新的在最上面）
      this.historyList.unshift(newItem)

      // 限制存储数量，比如只存最近 50 条，防止浏览器存储溢出
      if (this.historyList.length > 50) {
        this.historyList.pop()
      }

      // 同步到本地存储
      localStorage.setItem('chat_history', JSON.stringify(this.historyList))
    },
    /**
     * Event Stream 调用大模型接口
     */
    async createAssistantWriterStylized(data): Promise<{error: number
      reader: ReadableStreamDefaultReader<string> | null}> {

      // 调用当前模型的接口
      return new Promise((resolve) => {
        if (!this.currentModelItem?.chatFetch) {
          return {
            error: 1,
            reader: null
          }
        }
        this.currentModelItem.chatFetch(data.text)
          .then((res) => {
            if (res.ok && res.body) {
              const reader = res.body
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(TransformUtils.splitStream('\n'))
                .getReader()

              resolve({
                error: 0,
                reader
              })
            } else {
              console.error('🔥 拦截到大模型报错！状态码:', res.status)
              resolve({
                error: 1,
                reader: null
              })
            }
          })
          .catch((err) => {
            resolve({
              error: 1,
              reader: null
            })
          })
      })
    }
  }
})
