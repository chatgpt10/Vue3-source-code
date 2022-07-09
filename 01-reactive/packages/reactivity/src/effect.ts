export let activeEffect =undefined; //当前正在执行的effect

function cleanupEffect(effect){
  const {deps} = effect; // deps 里面装的是name对应的effect, age对应的effect
  for(let i = 0; i < deps.length;i++){
      deps[i].delete(effect); // 解除effect，重新依赖收集
  }
  effect.deps.length = 0;
}
class ReactiveEffect {
  active=true;
  deps=[]; //收集effect中使用到的属性
  parent=undefined;
  constructor( public fn){

  }
  run (){
    if(!this.active) { //如果不是激活状态
      return this.fn();
    }
    try {
      this.parent=activeEffect; //当前执行的effect就是他父亲
      activeEffect=this; //设置成正在激活的是当前的effect
      cleanupEffect(this);
      return this.fn();
      } finally {
        activeEffect=this.parent; //执行完毕后 还原activeEffect
        
      }
  }
  stop(){
    if(this.active){
        this.active = false;
        cleanupEffect(this); // 停止effect的收集
    }
}
  
}
// 核心函数
export function effect (fn,options?){
  const _effect = new ReactiveEffect(fn); 
  _effect.run();

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner; // 返回runner
}

// 追踪
const targetMap = new WeakMap(); // 记录依赖关系
export function track(target, type, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target); // {对象：map}
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set())) // {对象：{ 属性 :[ dep, dep ]}}
        }
        let shouldTrack = !dep.has(activeEffect)
        if (shouldTrack) {
            dep.add(activeEffect);
            activeEffect.deps.push(dep); // 让effect记住dep，这样后续可以用于清理
        }
    }
}

export function trigger(target,type,key,value,oldValue){
  const depsMap = targetMap.get(target);
  if(!depsMap) return; // 触发的值不在模板中使用

  let effects = depsMap.get(key); // 找到了属性对应的effect

  // 永远在执行之前 先拷贝一份来执行， 不要关联引用
  if(effects){
      triggerEffects(effects)
  }
}
export function triggerEffects(effects){
  effects = new Set(effects);
  effects.forEach(effect => {
      // 我们在执行effect的时候 又要执行自己，那我们需要屏蔽掉，不要无线调用
      if(effect !== activeEffect) {
          if(effect.scheduler){
              effect.scheduler(); // 如果用户传入了调度函数，则用用户的
          }else{
              effect.run() // 否则默认刷新视图
          }
      }
  });
}