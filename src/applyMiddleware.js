import compose from './compose'

export default function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
        const store = createStore(...args)

        let dispatch = () => {
            throw new Error(
                `dispatch未构造完成,中间件未插入`
            )
        }

        const middlewareAPI = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args)
        }

        const chain = middlewares.map(middlewares => middlewares(middlewareAPI))
        dispatch = compose(...chain)(store.dispatch)

        return {
            ...store,
            dispatch
        }
    }
}