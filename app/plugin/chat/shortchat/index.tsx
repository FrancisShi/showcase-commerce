import {WS_MSG_DATA_TYPE} from '@mindverse/accessor-open/src/type';
import React, {CSSProperties, useMemo} from 'react';
import MessageItem from '../model/message-item';

function ShortChat(props: {
  id: string;
  msgList: MessageItem[];
  style: CSSProperties;
}) {
  const {id, msgList, style} = props;

  const content = useMemo(() => {
    let content: string | undefined = '';

    if (msgList && msgList.length > 0) {
      const lastMessageId = msgList[msgList.length - 1].messageId;
      for (let i = msgList.length - 1; i >= 0; i--) {
        const msgItem = msgList[i];
        if (lastMessageId === msgItem.messageId) {
          const multiData = msgItem.multipleData;
          if (multiData && multiData.length > 0) {
            if (multiData[0].singleDataType === WS_MSG_DATA_TYPE.text) {
              content = multiData[0].modal.answer + content;
            }
          }
        } else {
          break;
        }
      }
    }
    return content;
  }, [msgList]);

  if (!content) {
    return null;
  }

  return (
    <text
      id={id}
      style={{
        color: '#3D3D3D',
        marginBottom: '20px',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        boxSizing: 'border-box',
        borderRadius: '14px',
        padding: '12px',
        fontSize: '15px',
        maxHeight: '90px',
        lineHeight: '24px',
        top: '30px',
        textOverflow: 'ellipsis',
        wordWrap: 'break-word',
        overflow: 'hidden',
        ...style,
      }}
    >
      {content}
    </text>
  );
}

export default ShortChat;
