import { MSG_TYPE } from "@mindverse/accessor-open/src/socket"
import { WS_DATA_TYPE_TEXT, WS_MSG_CLIENT_TYPE, WS_MSG_MULTIPLE_DATA } from "@mindverse/accessor-open/src/type"

export enum MessageItemType {
    RECEIVE = "RECEIVE",    // 接收的信息
    SEND = "SEND",  // 发送的信息
    SYSTEM = "SYSTEM"   // 用于处理分割线
}

export default interface MessageItem {
    type: MessageItemType
    multipleData: WS_MSG_MULTIPLE_DATA[]    // 接收的数据
    data: WS_DATA_TYPE_TEXT // 发送的数据
    dividerContent?: string
    messageId?: string
    seqId: string
    sources?: string[]
}

// 将收到的消息进行转换
export const transformNewMsg: (msg: MSG_TYPE) => MessageItem = (msg: MSG_TYPE) => {
    return {
      type: msg.__clientType === WS_MSG_CLIENT_TYPE.RECEIVE ? MessageItemType.RECEIVE : MessageItemType.SEND,
      data: msg.__clientType === WS_MSG_CLIENT_TYPE.SEND ? (msg.data as WS_DATA_TYPE_TEXT) : {content: ""},
      multipleData: msg.multipleData,
      messageId: msg.messageId,
      seqId: msg.seqId,
      sources: msg.sources
    }
}

/**
 * 消息是否相同 
 * @param left left Message
 * @param right right Message
 * @returns is Same
 */
export const isSameMessage = (left: MessageItem, right: MessageItem) => {
    return left.type === right.type && left.messageId === right.messageId && left.seqId === right.seqId
}