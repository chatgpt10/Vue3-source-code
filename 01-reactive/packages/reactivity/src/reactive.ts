import { isObject } from "@vue/shared";
// 引入核心处理文件
import { mutableHandlers,ReactiveFlags } from "./baseHandler";
// 1.将数据转化为响应式的数据，这里target只能是对象
const reactiveMap=new WeakMap(); //key只能是对象

// 2.同一个对象代理多次返回同一个代理
// 3.代理对象被再次代理  可以直接返回
export function reactive(target) {
  if(!isObject(target)){
    return
  }
  // 如何准备代理的对象上有 代理标识，说明该对象已经被代理过了  获取值 就会走get
  if(target[ReactiveFlags.IS_REACTIVE]){
    return target
  }
  let exisitingProxy=reactiveMap.get(target);
  if(exisitingProxy){
    return exisitingProxy
  }
  // 第一次普通对象的代理 我们会直接通过new Proxy进行代理

  const proxy=new Proxy(target,mutableHandlers);
  reactiveMap.set(target,proxy);

  return proxy;
}