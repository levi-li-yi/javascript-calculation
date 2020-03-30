class PubSub {
    constructor() {
        this.subscribers = {}
    }
    subscribe(type, fn) {
        if (!Object.hasOwnProperty.call(this.subscribers, type)) {
            this.subscribers[type] = []
        }
        this.subscribers[type].push(fn)
    }
    unsubscribe(type, fn) {
        let listeners = this.subscribers[type]
        if (!listeners || !listeners.length) return
        const index = listeners.indexOf(fn)
        this.subscribers[type] = this.subscribers.splice(index, 1)
    }
    publish(type, ...args) {
        let listeners = this.subscribers[type]
        if (!listeners || !listeners.length) return
        listeners.forEach((fn) => fn(...args))
    }
}

let pubsub = new PubSub()

function one(val) {
    console.log('one' + val)
}
function two(val) {
    console.log('two' + val)
}
pubsub.subscribe('one', one)
pubsub.subscribe('two', two)

pubsub.publish('one', 1)
pubsub.publish('two', 2)