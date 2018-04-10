import Vue from 'vue'
import App from './App'
import router from './router'
import VCharts from 'v-charts'
import {Radio, Slider, Select, Option, Input, Button, Message, Cascader} from 'element-ui'
import {request} from './tools'

Vue.prototype.$http = request

Vue.component(Radio.name, Radio)
Vue.component(Slider.name, Slider)
Vue.component(Select.name, Select)
Vue.component(Option.name, Option)
Vue.component(Input.name, Input)
Vue.component(Button.name, Button)
Vue.component(Message.name, Message)
Vue.component(Cascader.name, Cascader)
Vue.prototype.$message = Message

Vue.use(VCharts)

Vue.config.productionTip = false

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
