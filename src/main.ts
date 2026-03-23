import 'virtual:uno.css'

import { setupRouter } from '@/router'
import { setupStore } from '@/store'

import App from '@/App.vue'


const app = createApp(App)

function setupPlugins() {
  // ...
}

async function setupApp() {
  setupStore(app)
  await setupRouter(app)
  app.mount('#app')
}
console.log('当前API地址:', import.meta.env.VITE_GLOB_API_URL)
setupPlugins()
setupApp()

export default app
