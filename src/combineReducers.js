import ActionTypes from './utils/actionTypes'
import warning from './utils/warning'
import isPlainObject from './utils/isPlainObject'

function assertReducerShape(reducers) {
    Object.keys(reducers).forEach(key => {
        const reducer = reducers[key]
        const initialState = reducer(undefined, { type: ActionTypes.INIT })

        if(typeof initialState === 'undefined') {
            throw new Error(
                `Reducer "${key}" 在初始化的时候返回了undefined` +
                `请明确的返回初始状态，初始状态不能为undefined，` +
                `如果你不想在reducer返回任何值，请返回null代替undefined`
            )
        }

        if(typeof reducer(undefined, {
                type: ActionTypes.PROBE_UNKNOWN_ACTION()
            }) === 'undefined'
        ) {
            throw new Error(
                `Reducer "${key}" 返回了undefined，在试探的使用了一个` +
                `随机的type后，不要尝试使用 ${ActionTypes.INIT}或者` +
                `其他的actions 在 "redux/*" 作为作用域，这些都是` +
                `私有的，如果接收到一些未知的action你必须返回当前状态` +
                `除非这是undefined，不管是怎么样的action type 你必须返回` +
                `初始状态，初始状态不能为undefined，但可以为null。`
            )
        }
    })
}

function getUnexpectedStateShapeWarningMessage(
    inputState,
    reducers,
    action,
    unexpectedKeyCache
) {
    const reducerKeys = Object.keys(reducers)
    const argumentName =
        action && action.type === ActionTypes.INIT
            ? 'createStroe方法中的参数preloadedState'
            : 'reducer接收到的上一个state'

    if(reducerKeys.length === 0) {
        return (
            'Store 没有一个有效的reducer，确保combineReducers' +
            '的参数是一个Object，它就是reducers'
        )
    }

    if(!isPlainObject(inputState)) {
        return (
            `${argumentName} 是一个预期外的类型：` +
            ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
            `请确保参数是一个object并且拥有"${reducerKeys.join('", "')}"` +
            `这些键名`
        )
    }

    //剔除掉没有对应reducer的键名
    const unexpectedKeys = Object.keys(inputState).filter(
        key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
    )

    //赋值给unexpectedKeyCache储存起来
    unexpectedKeys.forEach(key => {
        unexpectedKeyCache[key] = true
    })

    //如果重置reducer不往下执行
    if (action && action.type === ActionTypes.REPLACE) return

    if(unexpectedKeys.length > 0) {
        return (
            `在 ${argumentName} 中找到预期外的键："${unexpectedKeys.join('", "')}"，` +
            `请不要使用除以下键名之外的键 "${reducerKeys.join('", "')}"。预期外的键将被忽略 `
        )
    }
}

function getUndefinedStateErrorMessage(key, action) {
    const actionType = action && action.type
    const actionDescription =
        (actionType && `action "${String(actionType)}"`) || 'an action'

    return (
        `所给的 action type ${actionDescription}, reducer "${key}" 返回undefined` +
        `为了忽略这个action，你必须明确的返回之前的状态` +
        `如果你想这个reducer保持没有值，你可以返回null来代替undefined`
    )
}

export default function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers)
    const finalReducers = {}

    for(let i=0; i< reducerKeys.length; i++) {
        const key = reducerKeys[i]

        if(process.env.NODE_ENV !== 'production') {
            if(typeof reducers[key] === 'undefined') {
                warning(`key "${key}" 没有对应的reducer`)
            }
        }

        if(typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key]
        }
    }

    const finalReducerKeys = Object.keys(finalReducers)

    let unexpectedKeyCache
    if(process.env.NODE_ENV !== 'production') {
        unexpectedKeyCache = {}
    }

    let shapeAssertionError
    try {
        assertReducerShape(finalReducers)
    } catch (e) {
        shapeAssertionError = e
    }

    //返回一个函数生成下一个状态  接收currentState 和 action两个参数
    return function combination(state = {}, action) {
        if(shapeAssertionError) {
            throw shapeAssertionError
        }

        if(process.env.NODE_ENV !== 'production') {
            const warningMessage = getUnexpectedStateShapeWarningMessage(
                state,
                finalReducers,
                action,
                unexpectedKeyCache
            )

            if(warningMessage) {
                warning(warningMessage)
            }
        }

        let hasChanged = false
        const nextState = {}

        //将action传进所有action中跑一遍  没有对应reducer的状态将在这里被剔除
        for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i]
            const reducer = finalReducers[key]

            const previousStateForKey = state[key]
            const nextStateForKey = reducer(previousStateForKey, action)
            if(typeof nextStateForKey === 'undefined') {
                const errorMessage = getUndefinedStateErrorMessage(key, action)
                throw new Error(errorMessage)
            }
            nextState[key] = nextStateForKey
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey
        }

        //判断有没有改变 有改变的话返回下一个状态
        return hasChanged ? nextState : state
    }
}