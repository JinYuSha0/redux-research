function bindActionCreator(actionCreator, dispatch) {
    return function () {
        return dispatch(actionCreator.apply(this, arguments))
    }
}

export default function bindActionCreators(actionCreators, dispatch) {
    if(typeof actionCreators === 'function') {
        return bindActionCreator(actionCreators, dispatch)
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
        throw new Error(
            `bindActionCreators 接受一个function或者object, 而不是 ${
                actionCreators === null ? 'null' : typeof actionCreators
                }. ` +
            `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
        )
    }

    const keys = Object.keys(actionCreators)
    const boundActionCreators = {}

    for (let i = 0; i < keys.length; i++) {
        const key  = keys[i]
        const actionCreator = actionCreators[key]
        if(typeof actionCreator === 'function') {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
        }
    }

    return boundActionCreators
}