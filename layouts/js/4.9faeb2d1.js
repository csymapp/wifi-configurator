(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4],{"713b":function(e,t,a){"use strict";a.r(t);var s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("q-layout",[a("q-page-container",[a("q-page",{staticClass:"window-height window-width row justify-center items-center",staticStyle:{background:"linear-gradient(#8274C5, #5A4A9F)"}},[a("div",{staticClass:"column q-pa-lg"},[a("div",{staticClass:"row"},[a("q-card",{staticClass:"shadow-24",staticStyle:{width:"300px",height:"485px"},attrs:{square:""}},[a("q-card-section",{staticClass:"bg-deep-purple-7"},[a("h4",{staticClass:"text-h5 text-white q-my-md text-center"},[e._v(e._s(e.appName))]),a("div",{staticClass:"text-center"},[e._v("WiFi Configuration")])]),a("q-card-section",[a("div",{staticClass:"text-center"},[e._v(e._s(e.deviceName))]),a("q-form",{staticClass:"q-px-sm q-pt-xl"},[a("q-input",{attrs:{square:"",clearable:"",type:"text",label:"Username",error:e.showError.username,"error-message":e.errorMessage.username},on:{focus:function(t){e.showError.username=!1}},scopedSlots:e._u([{key:"prepend",fn:function(){return[a("q-icon",{attrs:{name:"person"}})]},proxy:!0}]),model:{value:e.username,callback:function(t){e.username=t},expression:"username"}}),a("q-input",{attrs:{square:"",clearable:"",type:"password",label:"Password",required:"",error:e.showError.password,"error-message":e.errorMessage.password},on:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.login()},focus:function(t){e.showError.password=!1}},scopedSlots:e._u([{key:"prepend",fn:function(){return[a("q-icon",{attrs:{name:"lock"}})]},proxy:!0}]),model:{value:e.password,callback:function(t){e.password=t},expression:"password"}})],1)],1),a("q-card-actions",{staticClass:"q-px-lg"},[a("q-btn",{staticClass:"full-width text-white",attrs:{unelevated:"",size:"lg",color:"purple-4",label:"Sign In"},on:{click:function(t){return e.login()}}})],1)],1)],1)])])],1)],1)},r=[];const o=a("bc3a");var n={name:"Login",data(){return{username:"",password:"",root:"",appName:"No Application",deviceName:"anon",showError:{username:!1,password:!1},errorMessage:{password:"Please enter a password",username:"Please enter a username"}}},created(){this.logedIn(),o.get(this.root+"/app").then((e=>this.appName=e.data.app)),o.get(this.root+"/device").then((e=>this.deviceName=e.data.device))},methods:{logedIn(){let e=window.localStorage.getItem("wifi-config-token")||"",t={"content-type":"application/json",Authorization:"bearer "+e};o.post(this.root+"/token",{},{headers:t}).then((e=>{window.localStorage.setItem("wifi-config-token",e.data.token),this.$q.notify("Logging in"),window.location.href="/#/home"})).catch((e=>{}))},login(){""!==this.username?""!==this.password?o.post(this.root+"/login",{username:this.username,password:this.password}).then((e=>{window.localStorage.setItem("wifi-config-token",e.data.token),this.logedIn()})).catch((e=>{try{e=e.response.data.error}catch(t){e="unknown error"}this.errorMessage.password=e,this.showError.password=!0})):this.showError.password=!0:this.showError.username=!0}}},i=n,c=a("2877"),l=a("4d5a"),d=a("09e3"),p=a("9989"),u=a("f09f"),w=a("a370"),h=a("0378"),m=a("27f9"),g=a("0016"),f=a("4b7e"),q=a("9c40"),k=a("eebe"),y=a.n(k),b=Object(c["a"])(i,s,r,!1,null,null,null);t["default"]=b.exports;y()(b,"components",{QLayout:l["a"],QPageContainer:d["a"],QPage:p["a"],QCard:u["a"],QCardSection:w["a"],QForm:h["a"],QInput:m["a"],QIcon:g["a"],QCardActions:f["a"],QBtn:q["a"]})}}]);