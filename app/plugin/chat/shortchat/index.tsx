import {WS_MSG_DATA_TYPE} from '@mindverse/accessor-open/src/type';
import React, {CSSProperties, useMemo} from 'react';
import MessageItem from '../model/message-item';

function ShortChat(props: {msgItem: MessageItem; style: CSSProperties}) {
  const {style, msgItem} = props;

  const content = useMemo(() => {
    let content: string | undefined = '';
    if (msgItem) {
      const multiData = msgItem.multipleData;
      if (multiData && multiData.length > 0) {
        if (multiData[0].singleDataType === WS_MSG_DATA_TYPE.text) {
          content = multiData[0].modal.answer;
        }
      }
    }
    return content;
  }, [msgItem]);

  if (!content) {
    return null;
  }

  return (
    <text
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
