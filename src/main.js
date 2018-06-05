import {
    applyMiddleware,
    createStore,
    compose,
    combineReducers,
    bindActionCreators,
} from './index'
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createProvider, connect } from './connect'

const action1 = { type: 'increase', payload: 1 }
const action2 = { type: 'logout' }

const preloadedState = {
    count: 0,
    user: { isLogin: true },
    test: {} //没有对应的reducer报错
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
                console.group(action)
                console.log('prevState', log.prevState)
                console.log('action', log.action)
                console.log('nextState', log.nextState)
                console.groupEnd()
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

//绑定action制造方法
const boundActionCreators = bindActionCreators({
    increase: (num) => ({ type: 'increase', payload: num }),
    logout: () => ({ type: 'logout' })
}, store.dispatch)

//react context api (跨级传递)
const Provider = createProvider()

class ButtonGroup extends Component {
    render() {
        const { user, increase, decrease, login, logout } = this.props
        return (
            <div>
                <button onClick={() => {increase(1)}}>+</button>
                <button onClick={() => {decrease(1)}}>-</button>
                {
                    user.isLogin
                        ? <button onClick={() => {logout()}}>退出</button>
                        : <button onClick={() => {login()}}>登陆</button>
                }
            </div>
        )
    }
}

const Cbutton = connect(
    ({ user, count }) => ({ user, count }),
    (dispatch) => bindActionCreators({
        increase: (num) => ({ type: 'increase', payload: num }),
        decrease: (num) => ({ type: 'decrease', payload: num }),
        login: () => ({ type: 'login' }),
        logout: () => ({ type: 'logout' })
    }, dispatch)
)(ButtonGroup)

class App extends Component {
    render() {
        const { count, user } = this.props
        return (
            <div>
                {user.isLogin ? count : '请先登录'}
                <Cbutton/>
            </div>
        )
    }
}

const Capp = connect(
    ({ user, count }) => ({ user, count }),
    (dispatch) => bindActionCreators({
    }, dispatch)
)(App)


render(<Provider store={store}>
    <Capp/>
</Provider>, document.getElementById('app'))

