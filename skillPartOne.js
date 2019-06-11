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
    return _debounce
}