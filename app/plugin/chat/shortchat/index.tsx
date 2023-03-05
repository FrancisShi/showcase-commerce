import {WS_MSG_DATA_TYPE} from '@mindverse/accessor-open/src/type';
import React, {CSSProperties, useEffect, useMemo, useState} from 'react';
import MessageItem from '../model/message-item';

function ShortChat(props: {
  id: string;
  msgList: MessageItem[];
  style: CSSProperties;
}) {
  const {id, msgList, style} = props;

  const [showMoreIcon, setShowMoreIcon] = useState(false);

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

  useEffect(() => {
    const shortMsgContentTxt = document.getElementById('shortMsgContentTxt');
    if (shortMsgContentTxt) {
      if (shortMsgContentTxt.clientHeight > 48) {
        setShowMoreIcon(true);
      }
    }
  }, [content]);

  if (!content) {
    return <></>;
  } else {
    return (
      <div
        id={id}
        style={{
          ...style,
        }}
      >
        <div
          id="shortMsgContentTxt"
          style={{
            color: '#3D3D3D',
            wordBreak: 'break-word',
            boxSizing: 'border-box',
            fontSize: '15px',
            lineHeight: '24px',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            overflow: 'hidden',
            display: '-webkit-box',
            //@ts-ignore
            webkitLineClamp: '3',
            webkitBoxOrient: 'vertical',
          }}
        >
          {content}
        </div>

        {showMoreIcon && (
          <img
            style={{
              objectFit: 'cover',
              width: '7px',
              height: '7px',
              position: 'absolute',
              right: '10px',
              bottom: '12px',
            }}
            src="https://cdn.mindverse.com/img/zzzz202303031677828575742%E5%A4%9A%E8%BE%B9%E5%BD%A2%201.png"
            alt=""
          />
        )}
      </div>
    );
  }
}

export default ShortChat;
