/**
 * 判断是否一个常规的Object
 * function Foo() {}
 * var obj = new Foo()
 * typeof obj === 'Object'
 * @param obj
 * @returns {boolean}
 */

export default function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false

    let proto = obj
    //递归寻找原型链的顶层并赋值给proto
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto)
    }

    //如果父原型链不是顶层说明对象不是一个常规的Object
    return Object.getPrototypeOf(obj) === proto
}

