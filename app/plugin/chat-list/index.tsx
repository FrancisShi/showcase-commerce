import React, {CSSProperties, forwardRef, useEffect} from 'react';
import ChatLink from './components/link';
import ChatImg from './components/img';
import ChatText from './components/text';
import MessageItem, {MessageItemType} from './model/message-item';
import {
  WS_MSG_DATA_TYPE,
  WS_MSG_MULTIPLE_DATA,
} from '@mindverse/accessor-open/src/type';

export interface ChatListProps {
  id?: string;
  className?: string;
  msgList: MessageItem[];
  isLoading: boolean;
}

export default forwardRef<HTMLDivElement, ChatListProps>(
  (props: ChatListProps, ref) => {
    const {id = 'msgList', className, msgList, isLoading} = props;

    function scrollToBottom() {
      const itemList = document.getElementById(id);
      if (itemList) {
        itemList.scrollTop = itemList.scrollHeight;
      }
      [];
    }

    useEffect(() => {
      scrollToBottom();
    }, [msgList]);

    function renderItemList() {
      if (msgList.length == 0) {
        return [];
      }

      const receivedItem = (content: JSX.Element, index: number) => {
        return (
          <div
            style={{display: 'flex', justifyContent: 'start', maxWidth: '66%'}}
            key={index}
          >
            {content}
          </div>
        );
      };

      const receiveItemDetail = (
        item: WS_MSG_MULTIPLE_DATA,
        sources?: string[],
      ) => {
        switch (item.singleDataType) {
          case WS_MSG_DATA_TYPE.link:
            return <ChatLink link={item.modal.link ?? ''} />;
          case WS_MSG_DATA_TYPE.image:
            return <ChatImg imgUrl={item.modal.image ?? ''}></ChatImg>;
          case WS_MSG_DATA_TYPE.text:
            return (
              <ChatText
                content={item.modal.answer ?? ''}
                sources={sources}
              ></ChatText>
            );
          default:
            return null;
        }
      };

      const divider = (content: string, index: number) => {
        return (
          <div
            key={index}
            // eslint-disable-next-line react/no-children-prop
            children={content}
            style={{
              backgroundColor: 'white',
              fontSize: '14px',
              paddingRight: '24px',
            }}
          />
        );
      };

      const renderItems = msgList.map((item, index) => {
        if (item.type === MessageItemType.RECEIVE) {
          return item.multipleData.map((element) => {
            const result = receiveItemDetail(element, item.sources);
            if (result) {
              return receivedItem(result, index);
            } else {
              return <></>;
            }
          });
        } else if (item.type === MessageItemType.SEND) {
          // 发送消息
          return (
            // eslint-disable-next-line react/jsx-key
            <div className={`flex justify-end`}>
              <div
                style={{display: 'flex', marginTop: '8px', maxWidth: '66%'}}
                key={index}
              >
                <ChatText content={item.data.content ?? ''}></ChatText>
              </div>
            </div>
          );
        } else if (item.type === MessageItemType.SYSTEM) {
          return divider(item.dividerContent ?? '', index);
        } else {
          return null;
        }
      });
      return renderItems;
    }

    const showStyle: CSSProperties = {
      display: isLoading ? 'inline-block' : 'none',
    };

    return (
      <div
        style={{
          height: '100%',
          paddingTop: '8px',
          overflow: 'auto',
          overflowX: 'hidden',
          marginLeft: '24px',
          marginRight: '24px',
        }}
        className={`${className}`}
        id={id}
        ref={ref}
      >
        {renderItemList()}

        {/* loading */}
        <div
          style={{
            ...{
              backgroundColor: 'white',
              display: 'flex',
              marginTop: '8px',
              justifyContent: 'start',
              borderRadius: '8px',
              height: '40px',
              width: '88px',
            },
            ...showStyle,
          }}
        >
          <img
            src={
              'https://cdn.mindverse.com/files/zzzz202302161676550136968loading-loading-forever.gif'
            }
            style={{
              width: '20px',
              height: '20px',
              marginLeft: '32px',
              marginTop: '10px',
            }}
            alt=""
          />
        </div>
      </div>
    );
  },
);
