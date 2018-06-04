import warning from './utils/warning'
import createStore from './createStore'
import compose from './compose'
import applyMiddle from './applyMiddleware'

function isCrushed() {}

if(
    process.env.NODE_ENV !== 'production' &&
    typeof isCrushed.name === 'string' &&
    isCrushed.name !== 'isCrushed'
) {
    warning('非产品模式下被压缩')
}

export {
    createStore,
    compose,
    applyMiddle,
}

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
enhancer.push(applyMiddle(...middleware))

const store = createStore(reducer, 0/*, compose(...enhancer)*/)

const composeDispatch = (dispatch) => {
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
const dispatch = store.dispatch = composeDispatch(store.dispatch)

store.dispatch(action)


