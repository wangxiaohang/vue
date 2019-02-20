一、数据驱动
Vue:构造函数 

  通过new调用
  Vue.prototype._init(options)：合并配置，初始化
  Vue.protoype.$mount(el)：挂载

    el:不能是body/html

    无render函数：      
      获取template: 1.定义的template: string || node
                    2.未定义:template: el
                    => html字符串
      生成render: compileToFunctions(template...)
    
    挂载：Vue.prototype.mount.call(this,el);
      mountComponent(this,el):
      1.创建更新DOM的函数：
        updateComponent(){ vm._update(vm._render())} // 生成VNode实例并挂载
      2.创建Wathcer:初始化执行回调 + 数据更新执行回调
        new Watcher(vm, updateComponent) // 创建观察者


>>
Vue.prototype._render: 生成VNode实例
  调用createElement：
    1. 处理参数
    2. 调用 _createElement
      a. children规范化：一维数组
      b. VNode创建

Vue.prototype._update: 把VNode渲染成真实的DOM
>>