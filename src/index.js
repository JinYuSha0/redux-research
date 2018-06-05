import warning from './utils/warning'
import createStore from './createStore'
import compose from './compose'
import applyMiddleware from './applyMiddleware'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import __DO_NOT_USE_ActionTypes from './utils/actionTypes'

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
    applyMiddleware,
    combineReducers,
    bindActionCreators,
    __DO_NOT_USE_ActionTypes,
}