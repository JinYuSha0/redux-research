import {
    applyMiddleware,
    createStore,
    compose,
    __DO_NOT_USE_ActionTypes as privateActionType
} from './index'

const action = { type: 'increase', payload: 1 }
const reducer = (state, action) => {
    switch (action.type) {
        case 'increase':
            return state + action.payload
            break
        case 'decrease':
            return state - action.payload
            break
        default:
            return state
            break
    }
}

const middleware = []
const enhancer = []

const loggerMiddleware = () =>    {
    return ({ getState, dispatch }) => {
        return next => {
            return action => {
                let log = {
                    prevState: getState(),
                    action,
                    nextState: null
                }
                let returnValue  = next(action)
                log.nextState= getState()
                console.log(log)
                return returnValue
            }
        }
    }
}
const countMiddleware = () => {
    return ({ getState, dispatch }) => {
        return next => {
            let count = 0
            return action => {
                console.log(`dispatch次数:${++count}`)
                return next(action)
            }
        }
    }
}

middleware.push(loggerMiddleware())
middleware.push(countMiddleware())
enhancer.push(applyMiddleware(...middleware))

console.log(privateActionType)

const store = createStore(reducer, 0, compose(...enhancer))

//中间件实现(函数式编程)
/*const composeDispatch = (dispatch) => {
    let next = dispatch

    return (next => {
        let count = 0
        return action => {
            return (_next => {
                return (__next => {
                    return __next(action)
                    //...更多中间件

                })(() => {
                    let log = {
                        prevState: store.getState(),
                        action,
                        nextState: null
                    }
                    let returnValue  = _next(action)
                    log.nextState= store.getState()
                    console.log(log)
                    return returnValue
                })
            })(() => {
                console.log(`dispatch次数:${++count}`)
                return next(action)
            })
        }
    })(next)
}
const dispatch = store.dispatch = composeDispatch(store.dispatch)*/

store.dispatch(action)
store.dispatch(action)
store.dispatch(action)

