export default function warning(msg) {
    if(
        typeof console !== 'undefined' &&
        typeof console.error === 'function'
    ) {
        console.error(msg)
    }
    try {
        throw new Error(msg)
    } catch (e) {}
}