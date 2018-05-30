/**
 * 这是redux私有的活动类型
 * 对于一些未知的活动，你必须返回现在的状态
 * 如果现在的状态不存在，你必须返回初始状态
 * 不要在你的代码里使用这些活动类型
 */

const randomString = () => (
    Math.random()
        .toString(36)   //转为36进制
        .substring(7)   //总开头第七位截取到最后一位
        .split('')      //分割每个字符
        .join('.')      //在每个字符间插入"."
)

const ActionTypes = {
    INIT: `@@redux/INIT${randomString()}`,
    REPLACE: `@@redux/REPLACE${randomString()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}

export default ActionTypes