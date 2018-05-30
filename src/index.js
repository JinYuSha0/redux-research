import warning from './utils/warning'
import createStore from './createStore'
import compose from './compose'

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
}
