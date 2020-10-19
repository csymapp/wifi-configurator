(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{2710:function(e,s,r){"use strict";r.r(s);var t=function(){var e=this,s=e.$createElement,t=e._self._c||s;return t("q-layout",{attrs:{view:"hHh lpR fFf"}},[t("q-header",{staticClass:"bg-primary text-white",attrs:{elevated:"","height-hint":"98"}},[t("q-toolbar",[t("q-toolbar-title",[t("q-avatar",[t("img",{attrs:{src:r("4b7b")}})]),e._v("\n                "+e._s(e.appName)+"\n            ")],1),t("q-btn",{attrs:{dense:"",flat:"",round:"",icon:"logout"},on:{click:e.logout}})],1),t("q-tabs",{attrs:{align:"left"}},[t("q-route-tab",{attrs:{to:"#",label:"Networks",icon:"wifi"},on:{click:function(s){return e.showNetworks()}}}),t("q-route-tab",{attrs:{to:"#",label:"Users",icon:"people"},on:{click:function(s){return e.showUsers()}}}),t("q-route-tab",{attrs:{to:"#",label:"Profile",icon:"person"},on:{click:function(s){return e.showProfile()}}})],1)],1),t("q-page-container",[t("div",{staticClass:"text-center text-grey text-bold q-mb-md q-mt-md"},[t("span",[e._v("Configurations for ")]),t("span",{staticClass:"text-black"},[e._v(e._s(e.deviceName))])]),t("div",{staticClass:"q-ml-md q-mr-md"},[e.showingNetworks?t("div",[t("div",{staticClass:"row q-mb-md"},[t("q-input",{staticClass:"col",attrs:{placeholder:"Add New Network"},model:{value:e.newNetwork.SSID,callback:function(s){e.$set(e.newNetwork,"SSID",s)},expression:"newNetwork.SSID"}}),t("q-input",{staticClass:"col",attrs:{placeholder:"Password",type:"password"},model:{value:e.newNetwork.password,callback:function(s){e.$set(e.newNetwork,"password",s)},expression:"newNetwork.password"}}),t("q-btn",{attrs:{size:"sm",color:"primary",label:"Add"}})],1),t("div",{staticClass:"row"},[t("q-list",{staticClass:"col",attrs:{bordered:"",separator:""}},[t("q-item-label",{attrs:{header:""}},[e._v("Saved Networks")]),e._l(e.networks,(function(s,r){return t("q-item",[t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{color:"primary",name:"signal_wifi_off"}})],1),t("q-item-section",[e._v(e._s(s[0]))]),t("q-item-section",{attrs:{side:""}},[t("q-icon",{attrs:{name:"check"}})],1)],1)})),t("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],attrs:{clickable:""}},[t("q-item-section",[t("q-item-label",[e._v("Item with caption")]),t("q-item-label",{attrs:{caption:""}},[e._v("Caption")])],1)],1),t("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],attrs:{clickable:""}},[t("q-item-section",[t("q-item-label",{attrs:{overline:""}},[e._v("OVERLINE")]),t("q-item-label",[e._v("Item with caption")])],1)],1)],2)],1)]):e._e(),e.showingUsers?t("div",[t("div",{staticClass:" q-mb-md text-center"},[t("q-input",{ref:"username",staticClass:"col",attrs:{placeholder:"UserName",type:"text",error:e.showError.newUser.userName,"error-message":e.errorMessage.newUser.userName},on:{focus:function(s){e.showError.newUser.userName=!1},keydown:function(s){e.showError.newUser.userName=!1},keyup:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.addUser(s)}},model:{value:e.newUser.userName,callback:function(s){e.$set(e.newUser,"userName",s)},expression:"newUser.userName"}}),t("q-input",{ref:"password",staticClass:"col",attrs:{placeholder:"Password",type:"password",error:e.showError.newUser.password,"error-message":e.errorMessage.newUser.password},on:{focus:function(s){e.showError.newUser.password=!1},keydown:function(s){e.showError.newUser.password=!1},keyup:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.addUser(s)}},model:{value:e.newUser.password,callback:function(s){e.$set(e.newUser,"password",s)},expression:"newUser.password"}}),t("q-btn",{attrs:{size:"sm",color:"primary",label:"Add User"},on:{click:e.addUser}})],1),t("div",{staticClass:"row"},[t("q-list",{staticClass:"col",attrs:{bordered:"",separator:"",highlight:""}},[t("q-item-label",{attrs:{header:""}},[e._v("Users")]),e._l(e.users,(function(s,r){return t("q-item",{attrs:{clickable:""}},[t("q-item-section",{attrs:{avatar:""}},[t("q-icon",{attrs:{color:"primary",name:"person"}})],1),t("q-item-section",[e._v(e._s(s))]),t("q-item-section",{attrs:{side:""}},[t("q-icon",{attrs:{name:"close",color:"red"},on:{click:function(r){return e.removeUser(s)}}})],1)],1)}))],2)],1)]):e._e(),e.showingProfile?t("div",[t("div",{staticClass:" q-mb-md text-center"},[t("q-input",{staticClass:"col",attrs:{placeholder:"New UserName",readonly:""},model:{value:e.user.name,callback:function(s){e.$set(e.user,"name",s)},expression:"user.name"}}),t("q-input",{ref:"password",staticClass:"col",attrs:{placeholder:"Old Password",type:"password",error:e.showError.user.password,"error-message":e.errorMessage.user.password},on:{focus:function(s){e.showError.user.password=!1},keydown:function(s){e.showError.user.password=!1},keyup:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.changePassword(s)}},model:{value:e.user.password,callback:function(s){e.$set(e.user,"password",s)},expression:"user.password"}}),t("q-input",{staticClass:"col",attrs:{placeholder:"New Password",type:"password",error:e.showError.user.newPassword,"error-message":e.errorMessage.user.newPassword},on:{focus:function(s){e.showError.user.newPassword=!1},keydown:function(s){e.showError.user.newPassword=!1},keyup:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.changePassword(s)}},model:{value:e.user.newPassword,callback:function(s){e.$set(e.user,"newPassword",s)},expression:"user.newPassword"}}),t("q-btn",{attrs:{size:"sm",color:"primary",label:"Change Password"},on:{click:e.changePassword}})],1)]):e._e()])]),t("q-footer",{staticClass:"bg-grey-8 text-white",attrs:{elevated:""}},[t("q-toolbar",[t("q-toolbar-title",{staticClass:"text-center"},[e._v("\n                WiFi-Configurator\n            ")])],1)],1)],1)},o=[];r("4e82");const a=r("bc3a");var n={name:"HomeLayout",components:{},created(){this.logedIn(),a.get(this.root+"/app").then((e=>this.appName=e.data.app)),a.get(this.root+"/device").then((e=>this.deviceName=e.data.device)),this.showNetworks()},data(){return{root:"",appName:"No Application",deviceName:"anon",user:{name:"",password:"",newPassword:""},newUser:{userName:"",password:""},showingNetworks:!0,showingUsers:!1,showingProfile:!1,newNetwork:{SSID:"",password:""},networks:[],users:[],showError:{user:{password:!1,newPassword:!1},newUser:{password:!1,userName:!1}},errorMessage:{user:{password:"",newPassword:""},newUser:{password:"",userName:""}}}},methods:{showNetworks(){this.showingUsers=!1,this.showingProfile=!1,this.showingNetworks=!0,a.get(this.root+"/savednetworks",{headers:this.headers()}).then((e=>{let s=[],r=e.data.networks;for(let t in r){let e=r[t];s.push([Object.keys(e)[0],Object.values(e)[0]])}s.sort(),console.log(s),this.networks=s})),this.scanNetworks()},scanNetworks(){a.get(this.root+"/availablenetworks",{headers:this.headers()}).then((e=>{let s=e.data.networks;for(let r in s){let e=s[r];console.log(e)}}))},showUsers(){this.showingProfile=!1,this.showingNetworks=!1,this.showingUsers=!0,a.get(this.root+"/users",{headers:this.headers()}).then((e=>{this.users=e.data.users.filter((e=>e!==this.user.name))}))},showProfile(){this.showingUsers=!1,this.showingNetworks=!1,this.showingProfile=!0,this.$nextTick((()=>this.$refs.password.focus()))},headers(){let e=window.localStorage.getItem("wifi-config-token")||"",s={"content-type":"application/json",Authorization:"bearer "+e};return s},logedIn(){a.post(this.root+"/token",{},{headers:this.headers()}).then((e=>{console.log(e.data),window.localStorage.setItem("wifi-config-token",e.data.token),this.user.name=e.data.username})).catch((e=>{this.logout()}))},logout(){window.localStorage.removeItem("wifi-config-token"),this.$q.notify("Logging out"),window.location.href="/"},changePassword(){let e=!1;if(""===this.user.password&&(this.showError.user.password=!0,this.errorMessage.user.password="Old Password is required",e=!0),""===this.user.newPassword&&(this.showError.user.newPassword=!0,this.errorMessage.user.newPassword="New Password is required",e=!0),e)return;this.showError.user.password=!1,this.showError.user.newPassword=!1;let s={password:this.user.password,newPassword:this.user.newPassword};a.post(this.root+"/password",s,{headers:this.headers()}).then((e=>{console.log(e.data.msg),this.$q.notify({type:"positive",message:e.data.msg||e.data.message}),this.user.password="",this.user.newPassword=""})).catch((e=>{let s="unknown error";try{s=e.response.data.error}catch(e){}s||(s="unknown error"),this.showError.user.password=!0,this.errorMessage.user.password=s,this.$q.notify({type:"negative",message:s})}))},addUser(){let e=!1;if(""===this.newUser.password&&(this.showError.newUser.password=!0,this.errorMessage.newUser.password="Password is required",e=!0),""===this.newUser.userName&&(this.showError.newUser.userName=!0,this.errorMessage.newUser.userName="Username is required",e=!0),e)return;this.showError.newUser.password=!1,this.showError.newUser.userName=!1;let s={username:this.newUser.userName,password:this.newUser.password};a.post(this.root+"/user",s,{headers:this.headers()}).then((e=>{this.$q.notify({type:"positive",message:e.data.msg||e.data.message}),this.showUsers();for(let s in this.newUser)this.newUser[s]=""})).catch((e=>{let s="unknown error";try{s=e.response.data.error}catch(e){}s||(s="unknown error"),this.showError.user.password=!0,this.errorMessage.user.password=s,this.$q.notify({type:"negative",message:s})}))},removeUser(e){this.$q.dialog({parent:this,title:"Remove Users",message:"Are you sure you want to delete "+e,ok:"Yes",cancel:"No"}).onOk((()=>{a.delete(this.root+"/user/"+e,{headers:this.headers()}).then((e=>{this.$q.notify({type:"positive",message:e.data.msg||e.data.message}),this.showUsers()})).catch((e=>{let s="unknown error";try{s=e.response.data.error}catch(e){}s&&"undefined"!=s&&void 0!==s&&0!==Object.keys(s).length||(s="unknown error"),this.$q.notify({type:"negative",message:s})}))})).onCancel((()=>{})).onDismiss((()=>{}))}}},i=n,w=r("2877"),l=r("4d5a"),d=r("e359"),c=r("65c6"),h=r("6ac5"),u=r("cb32"),p=r("9c40"),m=r("429b"),g=r("7867"),k=r("09e3"),f=r("27f9"),q=r("1c1c"),b=r("0170"),v=r("66e5"),U=r("4074"),A=r("0016"),y=r("7ff0"),C=r("714f"),N=r("eebe"),P=r.n(N),E=Object(w["a"])(i,t,o,!1,null,null,null);s["default"]=E.exports;P()(E,"components",{QLayout:l["a"],QHeader:d["a"],QToolbar:c["a"],QToolbarTitle:h["a"],QAvatar:u["a"],QBtn:p["a"],QTabs:m["a"],QRouteTab:g["a"],QPageContainer:k["a"],QInput:f["a"],QList:q["a"],QItemLabel:b["a"],QItem:v["a"],QItemSection:U["a"],QIcon:A["a"],QFooter:y["a"]}),P()(E,"directives",{Ripple:C["a"]})},"4b7b":function(e,s){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAE3klEQVR4Xu2bT28bRRjGfzO7G9sxqUNbAlURCeUAQhQJxA2VXuDEkUMPCCFxQIKqB6Se+BSgqlwoXBAC8RkAgRAFJMqhJypEG0u0tIg2aVzHdnb3falqaZVd2xp7Y2p7k0ca7cGzM/M8O/P4ef2HXY49GLah/unLR8Kt6Kxgj6lItVBErW0alfOeeqePvPvNxYwAXfKddvSbQWsLJfAshUIs0OiAKBvlSvDc8ltfXwbw6YKwHZ41qrXlB5XAo5DYX4H6mtkXdsIzwKspAUT0WK2sBFZBKSQCCwsluN3S4wApAVSk6gGIUmT4AEq1RwBUQbvXQkO7LStAQn53CGAYsAN0F+8AZkcAUWh0DLGSgmdgoaRY4xAABuwApl8AUaivW0KhL25tGpYXxSnCzJrgRtsQxsrKiY8wS0fTvG5cZPWrkzTaUCsP4KEGVGfXBGMxoPSQBzAPPwsKkTCYh+qMm6A6gpqLh+psm6B7fW4BgL0d0F+APQGk2yaATgyboe3hVvKUaqCZIGPJwsEje/90mWAzNFy74w2Y2rBYVpbm49Q6d2aCOsAEYSICrLUs8w89ztKJczD3AAlUaP34Add/+ZKD5e0JT8liNB46XR4QCSwcXEmTBzCW0qGjoF8QxTDn6bg8YKqCkIOUgmaIqXEUOzojQcgtQJb8uDxgCgXAQWq8AkxVEnSQUiBLXneSBO+fCTZDSycmBWMM875Q8jTNkYkegfGb4D8tn/WOpR+MsRyuRveESD214URwCTb5KBwrrLcNj7z4OpWX3gPjkaCzwY3P3mRt7TLz1didPZg1E0xqdqV06Jk0eYDSPipLT9D498+EyHAL7l5nIwkqw7p6mqTb2GYkCerw29ot+iyaoDp2gWZEUhxJ8H6YoEjSdgwxIDKYlApoMpe7fE3Wpd2rGPrCzSO5P1cQEjU0Qtv/8/hAsEYzHqA5jsCUBiFRQ73pEw5Q/1bHslwNsWb7ls1hgtMahDa2LGFsWHn7c8zh59N8/vqV1Y/foLFlqM2J8+FDHwGY8iAUC6DaQx7APPoCqBJJ6guWMZrg5IPQSBO7j0A2/k6wHM4RIFwBJCGY4whMZxDKvwN05wKoToUJjmY+yrB9XWNP3gTze8DYaoECmiApkRyxefIfiY1qVI4k6HgXmLokmN8Ex+UBBTDB2UiC4qjKBr7We79aUHGImYw3ZF91rDEHjxF+IzSksztMyGmC+Y9XTh7ZJOgIL4xQttJtOarBXOPm4zF+DxjdB3A9/f/XA2ya4ODmE4MqWv+ZLHT1p1Qf3wio0qlfAIlJobVO6+rvBEa2jS20rl2C9m1SkJjO6oVkzBHX0a/lD0ILXsQtfFY/fI1+CIzc64MqFmXRD7n+7Sdwt2VhDBwubSVz7fe3uPr3H1x5/2n6YTGIsCqjrGP8SdCiLFdaNCKPUG0veT/Gbrt3KWhTtR5t8dDMOFUvpmQlsYh5G/FYaZNm7CEYEqGAso3v9UfzrMMtQDLbpZMH9EAQciDYosi4Gc7dbQFPnr1piv5z+fzVYPHg9oA9AYyhGYmpFl2ASAyo3ukVQOR8Q+wr+31DYIQiIlRLI7J48H2PAF4cnQ6t/0O9Vdm34EeJCMUi76OY27G0T/X/6+w7tSNhJGdi5ThQpVhoeobvIg1PPXWufYU97AGA/wCDuKHhGJizWgAAAABJRU5ErkJggg=="}}]);