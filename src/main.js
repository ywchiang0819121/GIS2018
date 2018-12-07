/* eslint-disable */
import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import VueGeolocation from 'vue-browser-geolocation';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.config.productionTip = false
Vue.use(VueRouter);
Vue.use(VueGeolocation);
Vue.use(VueGoogleMaps, {
    load: {
      key: ' AIzaSyA2Uzhf2HfiyuGhxNg8WUnkBSs987mJgHM ',
      libraries: 'places,drawing', 
    },
});

new Vue({
  render: h => h(App),
}).$mount('#app');
