import Vue from 'vue'
import Router from 'vue-router'
import Flatmap from '@/pages/Flatmap' 
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: 'flatmap/:area',
      name: 'flatmap',
      component: Flatmap
    },
  ]
})
