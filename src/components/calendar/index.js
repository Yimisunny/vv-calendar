import Calendar from "./Calendar.vue";
// import Vue from "vue";
// import NutUI from "@nutui/nutui";
// import "@nutui/nutui/dist/nutui.css";
// NutUI.install(Vue);

Calendar.install = Vue => Vue.component(Calendar.name, Calendar); //注册组件 // 标签的方式引入，留到后面再另开新篇讨论 //Vue.component(sumFunction.name, sumFunction); //}

if (typeof window !== 'undefined' && window.Vue) {
 install(window.Vue);
}

export default Calendar;
