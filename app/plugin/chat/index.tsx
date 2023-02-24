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
import MessageItem, {
  ChatListItem,
  flatMessages,
  MessageItemType,
} from './model/message-item';
import {
  WS_MSG_DATA_TYPE,
  WS_MSG_MULTIPLE_DATA,
} from '@mindverse/accessor-open/src/type';
import {getColorBgDark, getColorBgLight} from '..';
export interface ChatListProps {
  id?: string;
  className?: string;
  msgList: MessageItem[];
  isLoading: boolean;
}

export default forwardRef<HTMLDivElement, ChatListProps>(
  (props: ChatListProps, ref) => {
    const {id = 'msgList', className, msgList, isLoading} = props;
    const flatMessageList = useRef<ChatListItem[]>([]);
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

      const renderItems = flatMessageList.current.map((item, index) => {
        if (item.type === MessageItemType.RECEIVE) {
          const result = receiveItemDetail(
            item.singleDataType,
            item.content,
            item.sources,
          );
          if (result) {
            return (
              // 接受消息，wrapper
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'start',
                  maxWidth: '90%',
                  backgroundColor: getColorBgLight(),
                  color: '#3D3D3D',
                  marginBottom: '20px',
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
          } else {
            return <></>;
          }
        } else if (item.type === MessageItemType.SEND) {
          // 发送消息
          return (
            // eslint-disable-next-line react/jsx-key
            <div style={{display: 'flex', justifyContent: 'end'}}>
              <div
                style={{
                  display: 'flex',
                  marginBottom: '20px',
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
                <ChatText content={item.content ?? ''}></ChatText>
              </div>
            </div>
          );
        } else if (item.type === MessageItemType.SYSTEM) {
          return divider(item.content ?? '', index);
        } else {
          return null;
        }
      });
      return renderItems;
    }

    return (
      <div
        style={{
          height: '100%',
          paddingTop: '8px',
          overflow: 'auto',
          overflowX: 'hidden',
          marginLeft: '16px',
          marginRight: '16px',
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
              backgroundColor: '#F6F6F6',
              marginBottom: '20px',
              justifyContent: 'start',
              height: '54px',
              width: '120px',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '15px',
              display: isLoading ? 'inline-block' : 'none',
            },
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
            }}
            alt=""
          />
        </div>
      </div>
    );
  },
);
