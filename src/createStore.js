import $$observable from 'symbol-observable'        //todo

import ActionTypes from './utils/actionTypes'       //私有活动
import isPlainObject from './utils/isPlainObject'   //判断一个对象是否常规的对象

export default function createStore(reducer, preloadedState, enhancer) {
    //参数位置调换(如果没输入第三个参数默认第二个参数是enhancer)
    if(typeof preloaderState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloaderState
        preloaderState = undefined
    }

    if(typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
            throw new Error('Expected the enhancer to be a function.')
        }

        return enhancer(createStore)(reducer, preloadedState)
    }

    if (typeof reducer !== 'function') {
        throw new Error('Expected the reducer to be a function.')
    }

    let currentReducer = reducer
    let currentState = preloadedState
    let currentListeners = []
    let nextListeners = currentListeners
    let isDispatching = false

    //保证修改nextListeners不会改了currentListeners
    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice()
        }
    }

    //获取store里所有的状态
    function getState() {
        if (isDispatching) {
            throw new Error(
                '你不能在reducer执行的时候调用store.getState()方法。'
            )
        }

        return currentState
    }

    //注册监听函数(每次对 store 进行 dispatch(action) 都会触发 subscribe 注册的函数调)
    function subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Expected the listener to be a function.')
        }

        if (isDispatching) {
            throw new Error(
                '你不能在reducer执行的时候调用store.subscribe()方法'
            )
        }

        let isSubscribed = true

        ensureCanMutateNextListeners()
        nextListeners.push(listener)

        return function unsubscribe() {
            if(!isSubscribed) {
                return
            }

            if(isDispatching) {
                throw new Error(
                    '你不能在reducer执行的时候调用unsubscribe方法'
                )
            }

            isSubscribed = false

            ensureCanMutateNextListeners()
            const index = nextListeners.indexOf(listener)
            nextListeners.splice(index, 1)
        }
    }

    /**
     * 派遣一个活动
     * @param action { type: 'xxx', payload: {...} }
     */
    function dispatch(action) {
        if (!isPlainObject(action)) {
            throw new Error(
                'Action必须是一个常规的对象'
            )
        }

        if (typeof action.type === 'undefined') {
            throw new Error(
                'Action必须有"type"这个属性，不然不知道做什么'
            )
        }

        if(isDispatching) {
            throw new Error(
                'Reducers不能派遣actions'
            )
        }

        try {
            isDispatching = true
            //reducer接受当前状态和一个action
            currentState = currentReducer(currentState, action)
        } finally {
            isDispatching = false
        }

        //使currentListeners = nextListeners
        const listeners = (currentListeners = nextListeners)
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i]
            listener()
        }

        return action
    }

    //重置reducer
    function replaceReducer(nextReducer) {
        if (typeof nextReducer !== 'function') {
            throw new Error('Expected the nextReducer to be a function.')
        }

        currentReducer = nextReducer
        dispatch({ type: ActionTypes.REPLACE })
    }

    //todo 观察者模式 具体作用不明
    function observable() {
        const outerSubscribe = subscribe
        return {
            subscribe(observer) {
                if (typeof observer !== 'object' || observer === null) {
                    throw new TypeError('Expected the observer to be an object.')
                }

                function observeState() {
                    if (observer.next) {
                        observer.next(getState())
                    }
                }

                observeState()
                const unsubscribe = outerSubscribe(observeState)
                return { unsubscribe }
            },

            [$$observable]() {
                return this
            }
        }
    }

    //初始化数据
    dispatch({ type: ActionTypes.INIT })

    return {
        dispatch,
        subscribe,
        getState,
        replaceReducer,
        [$$observable]: observable,
    }
}