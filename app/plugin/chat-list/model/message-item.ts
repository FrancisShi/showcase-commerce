import {MSG_TYPE} from '@mindverse/accessor-open/src/socket';
import {
  WS_DATA_TYPE_TEXT,
  WS_MSG_CLIENT_TYPE,
  WS_MSG_DATA_TYPE,
  WS_MSG_MULTIPLE_DATA,
} from '@mindverse/accessor-open/src/type';

export enum MessageItemType {
  RECEIVE = 'RECEIVE', // 接收的信息
  SEND = 'SEND', // 发送的信息
  SYSTEM = 'SYSTEM', // 用于处理分割线
}

export default interface MessageItem {
  type: MessageItemType;
  multipleData: WS_MSG_MULTIPLE_DATA[]; // 接收的数据
  data: WS_DATA_TYPE_TEXT; // 发送的数据
  dividerContent?: string;
  messageId?: string;
  seqId: string;
  sources?: string[];
}

// 将收到的消息进行转换
export const transformNewMsg: (msg: MSG_TYPE) => MessageItem = (
  msg: MSG_TYPE,
) => {
  return {
    type:
      msg.__clientType === WS_MSG_CLIENT_TYPE.RECEIVE
        ? MessageItemType.RECEIVE
        : MessageItemType.SEND,
    data:
      msg.__clientType === WS_MSG_CLIENT_TYPE.SEND
        ? (msg.data as WS_DATA_TYPE_TEXT)
        : {content: ''},
    multipleData: msg.multipleData,
    messageId: msg.messageId,
    seqId: msg.seqId,
    sources: msg.sources,
  };
};

/**
 * 消息是否相同
 * @param left left Message
 * @param right right Message
 * @returns is Same
 */
export const isSameMessage = (left: MessageItem, right: MessageItem) => {
  return (
    left.type === right.type &&
    left.messageId === right.messageId &&
    left.seqId === right.seqId
  );
};

/**
 * 用于内部展示的铺平后的逻辑
 */
export interface ChatListItem {
  type: MessageItemType; // 消息类型是接受还是发送
  singleDataType: WS_MSG_DATA_TYPE; // 单条消息的类型
  content: string;
  sources: string[];
}

export const flatMessages = (originSource: MessageItem[]) => {
  const msgList: ChatListItem[] = [];

  const msgCache: Record<string, ChatListItem> = {};

  // 解析结构内容
  originSource.forEach((msgItem) => {
    switch (msgItem.type) {
      case MessageItemType.RECEIVE:
        msgItem.multipleData.forEach((singleData) => {
          let content: string | undefined;
          switch (singleData.singleDataType) {
            case WS_MSG_DATA_TYPE.text:
              content = singleData.modal.answer;
              break;
            case WS_MSG_DATA_TYPE.image:
              content = singleData.modal.image;
              break;
            case WS_MSG_DATA_TYPE.link:
              content = singleData.modal.link;
              break;
            default:
              break;
          }

          if ((content?.length ?? 0) === 0) {
            return;
          }
          const newItem: ChatListItem = {
            type: msgItem.type,
            singleDataType: singleData.singleDataType,
            content: content ?? '',
            sources: msgItem.sources ?? [],
          };

          if (msgItem.messageId && msgItem.messageId.length > 0) {
            if (
              msgCache[msgItem.messageId] &&
              msgCache[msgItem.messageId].singleDataType ===
                WS_MSG_DATA_TYPE.text
            ) {
              msgCache[msgItem.messageId].content =
                msgCache[msgItem.messageId].content + newItem.content;
              msgCache[msgItem.messageId].sources = Array.from(
                new Set([
                  ...msgCache[msgItem.messageId].sources,
                  ...newItem.sources,
                ]),
              );
            } else {
              if (newItem.singleDataType === WS_MSG_DATA_TYPE.text) {
                msgCache[msgItem.messageId] = newItem;
              }
              msgList.push(newItem);
            }
          } else {
            msgList.push(newItem);
          }
        });
        break;
      case MessageItemType.SEND:
        msgList.push({
          type: msgItem.type,
          singleDataType: WS_MSG_DATA_TYPE.text,
          content: msgItem.data.content,
          sources: [],
        });
        break;
      case MessageItemType.SYSTEM:
        msgList.push({
          type: msgItem.type,
          singleDataType: WS_MSG_DATA_TYPE.text,
          content: msgItem.dividerContent ?? '',
          sources: [],
        });
        break;
    }
    return msgList;
  });

  return msgList;
};
