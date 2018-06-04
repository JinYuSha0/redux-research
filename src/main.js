import {
    applyMiddleware,
    createStore,
    compose,
    combineReducers,
} from './index'

const action1 = { type: 'increase', payload: 1 }
const action2 = { type: 'logout' }

const preloadedState = {
    count: 0,
    user: { isLogin: false },
    test: {}
}

const countReducer = (state = preloadedState.count, action) => {
    switch (action.type) {
        case 'increase':
            return state + action.payload
            break
        case 'decrease':
            return state - action.payload
            break
        case 'logout':
            return 0
            break
        default:
            return state
            break
    }
}
const userReducer = (state = preloadedState.user, action) => {
    switch (action.type) {
        case 'login':
            return state = { isLogin: true }
            break
        case 'logout':
            return state = { isLogin: false }
            break
        default:
            return state
            break
    }
}
const rootReducer = combineReducers({
    count: countReducer,
    user: userReducer,
})

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

const store = createStore(rootReducer, preloadedState, compose(...enhancer))

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

store.dispatch(action1)
store.dispatch(action2)