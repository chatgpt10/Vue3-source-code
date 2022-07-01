// 通过枚举一个标识 当 当前对象已经被代理过直接返回当前对象target
export const enum ReactiveFlags {
  IS_REACTIVE='__v_isReactive'
}

export const mutableHandlers ={
  get(target,key,receiver){
    if(key===ReactiveFlags.IS_REACTIVE){
      return true;
    }
    return Reflect.get(target,key,receiver);
  },
  set(target,key,value,receiver){
    return Reflect.set(target,key,value,receiver);
  }
}