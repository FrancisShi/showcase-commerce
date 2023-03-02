import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import ChatLink from './components/link';
import ChatImg from './components/img';
import ChatText from './components/text';
import ChatHtml from './components/html';
import ChatTemplate from './components/template';
import Loading from './components/loading';
import MessageItem, {
  ChatListItem,
  flatMessages,
  MessageItemType,
} from './model/message-item';
import {WS_MSG_DATA_TYPE} from '@mindverse/accessor-open/src/type';
import {getColorBgDark, getColorBgLight} from '..';

export interface ChatListProps {
  id?: string;
  msgList: MessageItem[];
  isLoading: boolean;
}

export default forwardRef<HTMLDivElement, ChatListProps>(
  (props: ChatListProps, ref) => {
    const {id = 'msgList', msgList, isLoading} = props;
    const flatMessageList = useRef<ChatListItem[][]>([]);
    const [random, setRandom] = useState<number>();

    function scrollToBottom() {
      const itemList = document.getElementById(id);
      if (itemList) {
        itemList.scrollTop = itemList.scrollHeight;
      }
      [];
    }

    useEffect(() => {
      flatMessageList.current = flatMessages(msgList);
      setRandom(Math.random());
    }, [msgList]);

    useEffect(() => {
      scrollToBottom();
    }, [random]);

    function renderItemList() {
      if (flatMessageList.current.length == 0) {
        return [];
      }

      // 接受消息，具体内容
      const receiveItemDetail = (
        type: WS_MSG_DATA_TYPE,
        content: string,
        sources?: string[],
      ) => {
        switch (type) {
          case WS_MSG_DATA_TYPE.link:
            return <ChatLink link={content} />;
          case WS_MSG_DATA_TYPE.image:
            return <ChatImg imgUrl={content}></ChatImg>;
          case WS_MSG_DATA_TYPE.text:
            return <ChatText content={content} sources={sources}></ChatText>;
          case WS_MSG_DATA_TYPE.html:
            return <ChatHtml content={content}></ChatHtml>;
          case WS_MSG_DATA_TYPE.template:
            return <ChatTemplate content={content}></ChatTemplate>;
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

      const receiveWrapView = (
        result: (JSX.Element | null)[],
        index: number,
      ) => {
        return (
          // 接受消息，wrapper
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
              maxWidth: '90%',
              backgroundColor: getColorBgLight(),
              color: '#3D3D3D',
              marginBottom:
                index === flatMessageList.current.length - 1 && !isLoading
                  ? '70px'
                  : '20px',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              boxSizing: 'border-box',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '15px',
            }}
            key={index}
          >
            {result}
          </div>
        );
      };

      console.log('Francis flatMessageList', flatMessageList);
      return flatMessageList.current.map((item, index) => {
        if (!item) {
          return null;
        } else if (item.length > 1) {
          // 多个不同类型的消息同一个 messageId
          // 一定是 receive 的
          const itemsView = item.map((singleItem) => {
            return receiveItemDetail(
              singleItem.singleDataType,
              singleItem.content,
              singleItem.sources,
            );
          });
          return receiveWrapView(itemsView, index);
        } else if (item.length === 1) {
          const singleItem = item[0];
          if (singleItem) {
            if (singleItem.type === MessageItemType.RECEIVE) {
              const result = receiveItemDetail(
                singleItem.singleDataType,
                singleItem.content,
                singleItem.sources,
              );
              if (result) {
                return receiveWrapView([result], index);
              } else {
                return <></>;
              }
            } else if (singleItem.type === MessageItemType.SEND) {
              // 发送消息
              return (
                // eslint-disable-next-line react/jsx-key
                <div style={{display: 'flex', justifyContent: 'end'}}>
                  <div
                    style={{
                      display: 'flex',
                      marginBottom:
                        index === flatMessageList.current.length - 1 &&
                        !isLoading
                          ? '70px'
                          : '20px',
                      maxWidth: '90%',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      boxSizing: 'border-box',
                      borderRadius: '14px',
                      padding: '12px',
                      fontSize: '15px',
                      backgroundColor: '#F6F6F6',
                      color: '#3D3D3D',
                    }}
                    key={index}
                  >
                    <ChatText content={singleItem.content ?? ''}></ChatText>
                  </div>
                </div>
              );
            } else if (singleItem.type === MessageItemType.SYSTEM) {
              return divider(singleItem.content ?? '', index);
            } else {
              return null;
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      });
    }

    return (
      <div
        style={{
          height: '100%',
          paddingTop: '8px',
          overflow: 'scroll',
          marginLeft: '16px',
          marginRight: '16px',
        }}
        id={id}
        ref={ref}
      >
        {renderItemList()}

        {/* loading */}
        <Loading
          style={{
            backgroundColor: getColorBgLight(),
            display: isLoading ? 'flex' : 'none',
          }}
        />
      </div>
    );
  },
);
