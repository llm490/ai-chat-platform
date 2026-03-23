// import request from '@/utils/request'

// /**
//  * Get 请求示例
//  */
// export function getXxxxPrompt (params) {
//   return request.get(`/xxxxxx/test/prompt`, params)
// }
/**
 * AI 对话请求 (支持流式传输 SSE)
 */
export async function chatFetch(params: any) {
  const baseURL = import.meta.env.VITE_GLOB_API_URL.replace(/\/$/, '') // 去掉末尾斜杠
  const apiKey = import.meta.env.VITE_SILICONFLOW_KEY
  const defaultModel = import.meta.env.VITE_GLOB_API_MODEL

  // 确保路径拼接正确
  const url = `${ baseURL }/chat/completions`

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ apiKey }`
    },
    body: JSON.stringify({
      ...params,
      model: params.model || defaultModel,
      stream: true
    })
  })
}
