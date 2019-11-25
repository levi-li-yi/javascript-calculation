const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(executor) {
    let self = this
    self.value = null;
    self.error = null;
    self.status = PENDING;
    self.onFulfilledCallback = [];
    self.onRejectedCallback = [];

    const resolve = (value) => {
        if (self.status !== PENDING) return;
        setTimeout(() => {
            self.status = FULFILLED;
            self.value = value;
            self.onFulfilledCallback.forEach((callback) => callback(self.value))
        })
    }

    const reject = (error) => {
        if (self.status !== PENDING) return;
        setTimeout(() => {
            self.status = REJECTED;
            self.error = error;
            self.onRejectedCallback.forEach((callback) => callback(self.value))
        })
    }
    executor(resolve, reject)
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    let bridgePromise;
    let self = this;
    if (this.status === PENDING) {
        // 为了实现promise链式调用返回promise
        return bridgePromise = new MyPromise((resolve, reject) => {
            // 回调收集
            self.onFulfilledCallback.push((value) => {
                try{
                    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
                    let r = onFulfilled(value);
                    resolvePromise(bridgePromise, r, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
            // 回调收集
            self.onRejectedCallback.push((value) => {
                try{
                    onRejected = typeof onRejected === "function" ? onRejected : error => { throw error };
                    let r = onRejected(value);
                    resolvePromise(bridgePromise, r, resolve, reject)
                    //resolve(r);
                } catch (e) {
                    reject(e)
                }
            })
        })
        console.log('init');
    } else if (this.status === FULFILLED) {
        console.log('resolve');
        onFulfilled(this.value)
    } else {
        console.log('reject');
        onRejected(this.error)
    }
    return this
}

Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
}

// promise解析
function resolvePromise(bridgePromise, r, resolve, reject) {
    if (r instanceof MyPromise) {
        if (r.status === PENDING) {
            r.then(c => {
                resolvePromise(bridgePromise, c, resolve, reject)
            }, error => {
                reject(error)
            })
        } else {
            r.then(resolve, reject)
        }
    } else {
        resolve(r)
    }
}

let fn = new MyPromise((resolve, reject) => {
    let count = 0
    setTimeout(() => {
        count++
        if (count === 1) {
            resolve(count)
        }
    }, 2000)
});
fn.then((res) => {
    console.log(res);
})