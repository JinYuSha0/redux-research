/***
 * 使增强器(enhancer)一环一环嵌套在一起
 * compose(print, add, ride)(2, 3) == print(add(ride(2,3)))
 * @param funcs
 * @returns {*}
 */

export default function compose(...funcs) {
    if(funcs.length === 0) {
        return arg => arg
    }

    if(funcs.length === 1) {
        return funcs[0]
    }

    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}