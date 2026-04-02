/*
 * @Author: llm llm@itcast.cn
 * @Date: 2026-03-23 10:17:00
 * @LastEditors: llm llm@itcast.cn
 * @LastEditTime: 2026-03-26 18:46:31
 * @FilePath: \chatgpt-vue3-light-mvp-main\src\types\global.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
interface Window {
  $ModalMessage: import('naive-ui').MessageProviderInst//从屏幕顶部掉下来的轻量级提示（比如“保存成功”）
  $ModalNotification: import('naive-ui').NotificationProviderInst//从屏幕右上角弹出的带标题和内容的大卡片通知
  $ModalDialog: import('naive-ui').DialogProviderInst//屏幕正中间的确认对话框（比如“你确定要删除这条历史记录吗？”）
  $ModalLoadingBar: import('naive-ui').LoadingBarProviderInst//浏览器最顶部的细细的那根加载进度条
}
