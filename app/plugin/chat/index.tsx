import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ChatText from './components/text';
import ChatTemplate from './components/template';
import Loading from './components/loading';
import Logo from './components/logo';
import MessageItem, {
  ChatListItem,
  flatMessages,
  MessageItemType,
} from './model/message-item';
import {WS_MSG_DATA_TYPE} from '@mindverse/accessor-open/src/type';
import {getColorBgDark, getColorBgLight} from '..';
import {conversationAttitude} from '../utils/api';
import {MSG_TYPE} from '@mindverse/accessor-open/src/socket';

export interface ChatListProps {
  id?: string;
  hintList: MSG_TYPE[];
  msgList: MessageItem[];
  isLoading: boolean;
  style: CSSProperties;
}

function scrollTo(element: {scrollTop: any}, to: number, duration: number) {
  const easeInOutQuad = function (t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  const start = element.scrollTop;
  const change = to - start;
  let currentTime = 0;
  const increment = 20;

  const animateScroll = function () {
    currentTime += increment;
    const val = easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
}

export default forwardRef<HTMLDivElement, ChatListProps>(
  (props: ChatListProps, ref) => {
    const {id = 'msgList', hintList, msgList, isLoading, style} = props;
    const flatMessageList = useRef<ChatListItem[][]>([]);
    const isScrollingRef = useRef<boolean>(false);
    const lastMessageId = useRef<string | undefined>('');
    const [attitudeMsg, setAttitudeMsg] = useState<any>({});

    function scrollToBottom() {
      const itemList = document.getElementById(id);
      if (itemList) {
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          scrollTo(
            itemList,
            itemList.scrollHeight - itemList.clientHeight,
            300,
          );
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 300);
        }
      }
      [];
    }

    function thumbClick(messageId: string, attitude: number) {
      conversationAttitude({
        msgId: messageId,
        attitude,
      }).then((res) => {
        if (res?.data?.code === 200) {
          attitudeMsg[`${messageId}`] = attitude;
          setAttitudeMsg({...attitudeMsg});
        }
      });
    }

    flatMessageList.current = useMemo(() => {
      return flatMessages(msgList);
    }, [msgList]);

    useEffect(() => {
      if (msgList[msgList.length - 1]) {
        if (lastMessageId.current !== msgList[msgList.length - 1].messageId) {
          // 来新消息了
          scrollToBottom();
          lastMessageId.current = msgList[msgList.length - 1].messageId;
        }
      }
    }, [msgList]);

    const hitLayout = () => {
      const lastMessageId = msgList[msgList.length - 1].messageId;
      const lastHintList: MSG_TYPE[] = hintList.filter(
        (item) => item.messageId === lastMessageId,
      );
      if (lastHintList.length > 0) {
        return (
          <>
            {lastHintList.map((hint, _) => {
              return (
                <div
                  key={_}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <img
                    style={{width: '16px', height: '16px'}}
                    src="https://cdn.mindverse.com/img/zzzz202303131678715879897%E5%87%8F%E5%8E%BB%E9%A1%B6%E5%B1%82%201%20%281%29.png"
                    alt=""
                  />
                  <div
                    style={{
                      fontSize: '15px',
                      marginLeft: '10px',
                      lineHeight: '23px',
                      color: '#FFFFFF',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {hint.multipleData[0]?.modal?.answer}
                  </div>
                </div>
              );
            })}
          </>
        );
      } else {
        return <></>;
      }
    };

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
          case WS_MSG_DATA_TYPE.text:
            return <ChatText content={content} sources={sources}></ChatText>;
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
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '20px',
            }}
          >
            <div
              style={{height: '1px', backgroundColor: '#F6F6F6', flex: 1}}
            ></div>
            <div
              style={{
                fontSize: '14px',
                marginLeft: '24px',
                marginRight: '24px',
              }}
            >
              {content}
            </div>
            <div
              style={{height: '1px', backgroundColor: '#F6F6F6', flex: 1}}
            ></div>
          </div>
        );
      };

      const receiveWrapView = (
        result: (JSX.Element | null)[],
        index: number,
        messageId?: string,
      ) => {
        const isLast = index === flatMessageList.current.length - 1;

        return (
          // 接受消息，wrapper
          <div
            style={{
              marginBottom:
                isLast && !isLoading
                  ? '70px'
                  : attitudeMsg[`${messageId}`]
                  ? '35px'
                  : '20px',
            }}
          >
            {/* 最后一条消息 才展示 */}
            {isLast && hitLayout()}

            {/* 接受消息的背景 */}
            <div
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'start',
                  maxWidth: '90%',
                  backgroundColor: getColorBgLight(),
                  color: '#FFFFFF',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box',
                  borderRadius: '14px',
                  padding: '12px',
                  fontSize: '15px',
                  boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.3)',
                }}
                key={index}
              >
                {result}
              </div>

              {attitudeMsg[`${messageId}`] && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    position: 'absolute',
                    bottom: '-15px',
                    left: '0px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    style={{
                      width: '15px',
                      height: '15px',
                      objectFit: 'cover',
                    }}
                    src={
                      attitudeMsg[`${messageId}`] === 1
                        ? 'https://cdn.mindverse.com/img/zzzz202303141678774798047%E8%B7%AF%E5%BE%84%20%284%29.png'
                        : 'https://cdn.mindverse.com/img/zzzz202303141678774797120%E8%B7%AF%E5%BE%84%20%285%29.png'
                    }
                    alt=""
                  />
                </div>
              )}

              {/* 点赞点踩 */}
              {!attitudeMsg[`${messageId}`] &&
                //  非第一个的最新消息才展示
                index !== 0 &&
                flatMessageList.current.length > 0 &&
                index === flatMessageList.current.length - 1 && (
                  <div
                    style={{
                      width: '98px',
                      height: '28px',
                      borderRadius: '14px',
                      opacity: 1,
                      background: '#FFFFFF',
                      marginTop: '3px',
                      backgroundColor: getColorBgLight(),
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingLeft: '21px',
                      paddingRight: '21px',
                    }}
                  >
                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        if (messageId) {
                          thumbClick(messageId, 1);
                        }
                      }}
                    >
                      <img
                        style={{
                          width: '15px',
                          height: '15px',
                          objectFit: 'cover',
                        }}
                        src="https://cdn.mindverse.com/img/zzzz202303141678774729647%E8%B7%AF%E5%BE%84%20%282%29.png"
                        alt=""
                      />
                    </div>

                    <div
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        if (messageId) {
                          thumbClick(messageId, 2);
                        }
                      }}
                    >
                      <img
                        style={{
                          width: '15px',
                          height: '15px',
                          objectFit: 'cover',
                        }}
                        src="https://cdn.mindverse.com/img/zzzz202303141678774728651%E8%B7%AF%E5%BE%84%20%283%29.png"
                        alt=""
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        );
      };

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
          return receiveWrapView(itemsView, index, item[0].messageId);
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
                return receiveWrapView([result], index, singleItem.messageId);
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
                      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.3)',
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
          ...style,
        }}
        id={id}
        ref={ref}
      >
        <Logo />
        {renderItemList()}

        {/* loading */}
        {isLoading &&
          msgList.length > 0 &&
          msgList[msgList.length - 1].type === MessageItemType.SEND &&
          hitLayout()}
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
