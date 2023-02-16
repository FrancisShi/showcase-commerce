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
          <div className={`flex mt-2 justify-start max-w-2/3`} key={index}>
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
                className={'border-solid border-2 border-gray-200'}
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
            className={'bg-white text-xs pr-3'}
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
              <div className={`flex mt-2 max-w-2/3`} key={index}>
                <ChatText
                  className={'bg-white border-solid border-2 border-gray-100'}
                  content={item.data.content ?? ''}
                ></ChatText>
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
        className={`h-full pt-2 overflow-y-auto overflow-x-hidden ml-3 mr-3 flex-1 ${className}`}
        id={id}
        ref={ref}
      >
        {renderItemList()}

        {/* loading */}
        <div
          className={'w-16 h-8 bg-white flex mt-2 justify-start rounded'}
          style={showStyle}
        >
          <img
            src={
              'https://cdn.mindverse.com/files/zzzz202302161676550136968loading-loading-forever.gif'
            }
            className={'w-5 h-5 ml-4 mt-2'}
            alt=""
          />
        </div>
      </div>
    );
  },
);
