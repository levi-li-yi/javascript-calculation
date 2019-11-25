/*1、判断Object的数据类型(主要使用Object.prototype.toString)*/
const isType = function(type) {
    return function(target) {
        return `[object ${type}]` === Object.prototype.toString.call(target)
    }
}
// 箭头函数写法：const isType = type => target => `[object ${type}]` === Object.prototype.toString.call(target)
const isArray = isType('Array')
console.log(isArray([]))

/*2、ES5实现map方法*/
const selfMap = function (fn, context) {
    // 获取数组
    let arr = Array.prototype.slice.call(this)
    let mappedArr = []
    for(let i =0; i<arr.length; i++) {
        // 稀疏数组时跳过后续处理直接到下一循环
        if(!arr.hasOwnProperty(i)) continue
        // fn.call(context, arr[i], i, this) 向map中添加了 item,index, this(即使arr),
        // call是立即执行故立即返回了：arr[i]
        mappedArr.push(fn.call(context, arr[i], i, this))
    }
    return mappedArr
}

let arr = [1,2,3]
Array.prototype.selfMap = selfMap
console.log(arr.selfMap((item) => item))

/*3、使用reduce实现数组map方法*/
const selfMap2 = function(fn, context) {
    let arr = Array.prototype.slice.call(this)
    return arr.reduce((pre, cur, index) => {
        return [...pre, fn.call(context, cur, index, this)]
    }, [])
}
 let arr1 = [3,2,1]
Array.prototype.selfMap2 = selfMap2
console.log(arr1.selfMap2((item) => item))

/*4、ES5实现filter*/
 const selfFilter = function(fn, context) {
     const arr = Array.prototype.slice.call(this)
     const filterArr = []
     for(let i=0; i<arr.length; i++) {
         if (!arr.hasOwnProperty(i)) continue
         // fn.call(context, arr[i], i, this)立即执行：得出过滤条件是否满足
         fn.call(context, arr[i], i, this) && filterArr.push(arr[i])
     }
     return filterArr
 }

 Array.prototype.selfFilter = selfFilter
let arrFilter = [{id: '1', name: 'asc'}, {id: '2', name: 'asec'}, {id: '3', name: 'asbc'}]
console.log(arrFilter.selfFilter((item) => item.id === '3'))

/*5、reduce实现filter*/
const selfFilter2 = function(fn, context) {
    let arr = Array.prototype.slice.call(this)
    arr.reduce((pre, cur, index) => {
        return fn.call(context, cur, index, this) ? [...pre, cur] : [...pre]
    }, [])
}
/*6、ES5实现reduce方法*/
const selfReduce = function (fn, initValue) {
    let arr = Array.prototype.slice.call(this)
    let res
    let startIndex
    if (initValue === undefined) {
        for(let i = 0; i< arr.length; i++) {
            if(!arr.hasOwnProperty(i)) continue
            startIndex = i
            res = arr[i]
            break
        }
    } else {
        res = initValue
    }

    for(let i = ++ startIndex || 0; i < arr.length; i++) {
        if(!arr.hasOwnProperty(i)) continue
        // res等于reduce回调方法(同样调取了res)返回值, 采用闭包存储的方式实现了累积计算
        res = fn.call(null, res, arr[i], i , this)
    }
    return res
}

Array.prototype.selfReduce = selfReduce
let reduceArr = [1,2,3]
console.log(reduceArr.selfReduce((pre, cur, index) => {
    return pre + cur
}, 1));

/*7、实现ES6的class*/
function inherit(subType, superType) {
    // subType：子类；superType：父类
    subType.prototype = Object.create(superType.prototype, {
        constructor: {
            enumerable: false,
            configurable: true,
            writable: true,
            value: superType.constructor
        }
    })
    Object.setPrototypeOf(subType, superType)
    /*需要研究Object、prototype等相关知识*/
}
/*8、函数柯里化: 把使用多个参数的函数转化成一系列使用一个参数的函数就叫函数柯里化*/
/*柯里化中心思想：用闭包把传入参数保存起来，当传入参数的数量足够执行函数时，就开始执行函数*/
/*使用场景：延迟计算、动态创建函数、参数复用*/
 function currying(fn, length) {
     length =length || fn.length
     return function(...args) {
         return args.length >= length ? fn.apply(this, args) : currying(fn.bind(this, ...args), length - args.length)
     }
 }
 const fn = currying(function(a,b,c){
     console.log(a, b, c)
 })

fn(1,2,3)

const currying2 = fn => judge => (...args) => args.length >= fn.length ? fn(...args) : (...arg) => judge(...args, ...arg)
 const fn2 = currying2(function(a,b,c){
     console.log(a, b, c)
 })
fn2('a','b','c')
/*9、偏函数*/
const partialFunc = (fn, ...args) => {
    let num = 0
    return (...args2) => {
        args2.forEach(arg => {
            let index = args.findIndex(item => item === '_')
            if (index < 0) return
            args[index] = arg
            num++
        })
        if (num < args2.length) {
            args2 = args2.slice(num, args2.length)
        }
        console.log([...args, ...args2]) //  [1, 3, 2, 1, 3]
        return fn.apply(this, [...args, ...args2])
    }
}

let add = (a, b, c, d) => a + b + c + d
let partAdd = partialFunc(add, '_', '_', 2)
console.log(partAdd(1, 3))


/*10、bind函数实现方法*/
const isComplexDataType = obj => (typeof obj === 'object' || typeof obj === 'function') && obj !== null

const selfBind = function (target, ...args1) {
    //target {name: 'test'}sub对象
    console.log(target)
    if (typeof this !== 'function')
        throw new TypeError('Bind must be called on a function')
    let fn = this
    let boundFn = function (...args2) {
        let args = [...args1, ...args2]
        if (new.target) {
            let res = fn.apply(this, args) // 核心使用apply
            if (isComplexDataType(res)) return res
            return this
        } else {
            fn.apply(target, args)// 核心使用apply
        }
    }
    /*原型链继承*/
    this.prototype && (boundFn.prototype = Object.create(this.prototype))
    let desc = Object.getOwnPropertyDescriptors(fn)
    console.log(desc)
    Object.defineProperties(boundFn, {
        length: desc.length,
        name: Object.assign(desc.name, {
            value: `bound${desc.name.value}`
        })
    })
    return boundFn
}
Function.prototype.selfBind = selfBind
let sub = {
    name: 'test'
}
let sup = function () {
    console.log(this.name)
}
const result = sup.selfBind(sub)
result()

/*11、函数call实现*/
const selfCall = function (context, ...args) {
    let fn = this
    context || (context = window)
    if (typeof fn !== 'function') throw new TypeError('this is not a fucntion')
    let caller = Symbol('caller')
    context[caller] = fn
    // 立即执行
    let res = context[caller](...args)
    delete context[caller]
    return res
}

Function.prototype.selfCall = selfCall

let subCall = {
    name: 'call name'
}

let callFn = function () {
    console.log(this.name)
}
callFn.selfCall(subCall)

/*12、简易CO模块*/
function run (generatorFunc) {
    let it = generatorFunc()
    let result = it.next()
    return new Promise((resolve, reject) => {
        const next = function (result) {
            if (result.done) {
                resolve(result.value)
            }
            result.value = Promise.resolve(result.value)
            result.value.then(res => {
                let result = it.next(res)
                next(result)
            }).catch(err => {
                reject(err)
            })
        }
        next(result)
    })
}

function api(data) {
    return data
}

/*定义一个生成器函数*/
function* func() {
    /*const data = 0
    let res = yield api(data)
    console.log(res)
    let res2 = yield api(data)
    console.log(res2)
    let res3 = yield api(data)
    console.log(res3)*/
}
//run(func)

/*13、防抖函数*/
const debounce = (func, time = 17,
    options = {
        leading: true,
        trailing: true,
        context: null
    }
) => {
    let timer
    const _debounce = function(...args) {
        if (timer) {
            clearTimeout(timer)
        }
        if (options.length && !timer) {
            timer = setTimeout(null, time)
            func.apply(options.context, args)
        } else if (options.trailing) {
            timer = setTimeout(() => {
                func.apply(options.context, args)
                timer = null
            }, time)
        }
    }
    /*防抖函数向外部暴露的cancel 可以从外部清除计时器*/
    _debounce.cancel = function() {
        clearTimeout(time)
        timer = null
    }
    return _debounce
}

/*14、函数节流*/
const throttle = (
    func,
    time = 17,
    options = {
        leading: true,
        trailing: false,
        context: null
    }
) => {
    let previous = new Date(0).getTime()
    let timer
    const _throttle = function (...args) {
        let now = new Date().getTime()

        if (!options.leading) {
            if (timer) return
            timer = setTimeout(() => {
                timer = null
                func.apply(options.context, args)
            })
        } else if (now - previous > time) {
            func.apply(options.context, args)
            previous = now
        } else if (options.trailing) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                func.apply(options.context, args)
            }, time)
        }
    }
    _throttle.cancel = function() {
        clearTimeout(time)
        timer = null
    }
    return _throttle
}
/*15、图片懒加载*/
let imgList = [...document.querySelectorAll('img')]
let num = imgList.length

let lazyLoad = (function() {
    let count = 0
    return function() {
        let deleteIndexList = []
        imgList.forEach((img, index) => {
            /*获取图片元素上、左、右、下四条边界相对于浏览器窗口左上角的偏移像素值。*/
            let rect = img.getBoundingClientRect()
            if (rect.top < window.innerHeight) {
                img.src = img.dataset.src
                deleteIndexList.push(index)
                count++
                if (count === num) {
                    document.removeEventListener(('scroll', lazyLoad))
                }
            }
        })
        imgList = imgList.filter((_, index) => !deleteIndexList.includes(index))
    }
})()

/*添加scroll事件*/
// document.addEventListener('scroll', lazyLoad)

// IntersectionObserver接口 提供了一种异步观察目标元素与其祖先元素或顶级文档视窗(viewport)交叉状态的方法
// IntersectionObserver的支持性不是很好；
// .intersectionRatio > 0表示元素出现在设备的可视区域内
let lazyLoad1 = function() {
    let observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                entry.target.src = entry.target.dataset.src
                observer.unobserve(entry.target)
            }
        })
        imgList.forEach(img => {
            observer.observe(img)
        })
    })
}

/*16、new 关键字实现*/
/* const isComplexDataType2 = obj =>
     (typrof obj === 'object' || typeof obj === 'function') && obj !== null*/

const selfNew = function(fn, ...rest) {
     let instance = Object.create(fn.prototype)
    let res = fn.apply(instance, rest)
    return isComplexDataType ? res : instance
}

/*17、Object.assgin实现*/
const selfAssgin = function(target, ...source) {
    if (target === null)
        throw new TypeError('is null')
    return source.reduce((acc, cur) =>
    {
        isComplexDataType(acc) || (acc = new Object(acc))
        if (cur === null) {
            return acc
        } else {
            const list = [...Object.keys(cur), ...Object.getOwnPropertySymbols(cur)]
            list.forEach((key) => {
                acc[key] = cur[key]
            })
            return acc
        }
    },target)
}
Object.prototype.selfAssgin = selfAssgin
console.log(Object.selfAssgin({name: '张三', type: true}, {id: '123', type: false}))

/*18、私有变量--proxy*/
// handler.ownKeys() 方法用于拦截 Reflect.ownKeys().
const proxy = function(obj) {
    return new Proxy(obj, {
        get(target, key) {
            if (key.startsWith('_')) {
                throw new Error('private key')
            }
            // Reflect.get() 方法的工作方式，就像从 object (target[propertyKey]) 中获取属性，但它是作为一个函数执行的。
            return Reflect.get(target, key)
        },
        ownKays(target) {
            // 静态方法 Reflect.ownKeys() 返回一个由目标对象自身的属性键组成的数组
            return Reflect.ownKeys(target).filter(key => !key.startsWith('_'))
        }
    })
}
/*19、私有变量--闭包*/
const Person = (function() {
    const _name = Symbol('name')
    class Person {
        constructor(name) {
            this[_name] = name
        }
        getName() {
            return this[_name]
        }
    }
    return Person
})()

let p1 = new Person('jack')
console.log(p1.getName())

/*20、私有变量--类*/
 class Person3 {
     constructor (name) {
         let _name = name
         this.getName = function () {
             return _name
         }
     }
 }

/*21、私有变量--WeakMap*/
/*WeakMap 相对于普通的 Map，也是键值对集合，只不过 WeakMap 的 key 只能是非空对象（non-null object）。
WeakMap 对它的 key 仅保持弱引用，也就是说它不阻止垃圾回收器回收它所引用的 key。
WeakMap 最大的好处是可以避免内存泄漏。一个仅被 WeakMap 作为 key 而引用的对象，会被垃圾回收器回收掉。*/
// WeakMap同样和map拥有set/get/has/delete,但是没有size
const Person2 = (function() {
    let wp = new WeakMap()
    class Person {
        constructor(name) {
            wp.set(this, {name})
        }
        getName() {
            return wp.get(this).name
        }
    }
    return Person
})()

/*22、洗牌算法--原位算法*/
function shuffle(arr) {
    for (let i=0; i<arr.length; i++) {
        let randomIndex = i + Math.floor(Math.random()*(arr.length - i));
            [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]]
    }
    return arr
}

/*23、洗牌算法--非原位算法*/
function shuffle2(arr) {
    let _arr = []
    while (arr.length) {
        let randomIndex = Math.floor(Math.random()*arr.length)
        _arr.push(arr.splice(randomIndex, 1)[0])
    }
    return _arr
}

/*24、单例模式*/
// Reflect.construct() 方法的行为有点像 new 操作符 构造函数 ， 相当于运行 new target(...args).
function proxy(func) {
    let instance
    let handler = {
        constructor(target, args) {
            if (!instance) {
                instance = Reflect.construct(func, args)
            }
            return instance
        }
    }
    return new Proxy(func, handler)
}