/*观察者模式：示例代码*/
/*观察者*/
class Observer {
    constructor() {}
    update(val) {
        console.log(val);
    }
}

/*观察者列表*/
class ObserverList {
    constructor() {
        this.observerList = []
    }
    add(observer) {
        return this.observerList.push(observer)
    }
    remove(observer) {
        this.observerList = this.observerList.filter((ob) => ob !== observer)
    }
    count() {
        return this.observerList.length
    }
    get(index) {
        return this.observerList[index]
    }
}

/*目标*/
class Subject {
    constructor() {
        this.observers = new ObserverList()
    }
    addObserver(observer) {
        this.observers.add(observer)
    }
    removeObserver(observer) {
        this.observers.remove(observer)
    }
    notify(...args) {
        let length = this.observers.count()
        for(let i=0; i<length; i++) {
            this.observers.get(i).update(...args)
        }
    }
}

let subject = new Subject()
let ob1 = new Observer()
let ob2 = new Observer()
subject.addObserver(ob1)
subject.addObserver(ob2)
subject.notify(123)