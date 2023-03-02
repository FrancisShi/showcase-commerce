import React, {useEffect, useRef, useState, CSSProperties} from 'react';
import {
  WS_MIND_TYPE,
  WS_MSG_DATA_TYPE,
  WS_MSG_TYPE,
} from '@mindverse/accessor-open/src/type';
import {Config} from '@mindverse/accessor-open/src/env';
import {Session, setConfig, userRegister} from '@mindverse/accessor-open';
import ChatList from './chat';
import MessageItem, {
  isSameMessage,
  MessageItemType,
  transformNewMsg,
} from './chat/model/message-item';
import Avatar, {TYPE_AVATAR} from './avatar';
import ShortChat from './chat/shortchat';

export const EVENT = {
  EVENT_ROUTER: 'mv_client_container_router',
  EVENT_AVATAR_OPEN: 'MV_CONTAINER_EVENT_IS_EXPAND.true',
  EVENT_AVATAR_CLOSE: 'MV_CONTAINER_EVENT_IS_EXPAND.false',
};
export interface MindConfig {
  mindId: string;
  mindType: WS_MIND_TYPE;
}

export interface UserConfig {
  userName: string;
  avatar: string;
}

export enum DevelopType {
  SCRIPT,
  NPM,
}

const DEFAUT_CONFIG = {
  COLOR_BG_DARK: 'rgba(115, 129, 137, 0.5)',
  COLOR_BG_LIGHT: '#DEEFF9',
};

let colorBgDark: string = DEFAUT_CONFIG.COLOR_BG_DARK;
let colorBgLight: string = DEFAUT_CONFIG.COLOR_BG_LIGHT;
let developType: DevelopType = DevelopType.SCRIPT;

export const getColorBgDark = () => {
  return colorBgDark;
};

export const getColorBgLight = () => {
  return colorBgLight;
};

export const getDevelopType = () => {
  return developType;
};

function App(props: {
  sessionCb: (sessionId: string) => void;
  config: {
    mindConfig: MindConfig;
    socketConfig: Config;
    userConfig: UserConfig;
    bgDark?: string;
    bgLight?: string;
    dynamicHeight?: boolean;
    openStyle?: CSSProperties;
    closeStyle?: CSSProperties;
    developType?: DevelopType;
  };
}) {
  const mindConfig = props.config.mindConfig;
  if (!mindConfig.mindId) {
    return null;
  }

  const socketConfig = props.config.socketConfig;
  const userConfig = props.config.userConfig;
  colorBgDark = props.config?.bgDark ?? DEFAUT_CONFIG.COLOR_BG_DARK;
  colorBgLight = props.config?.bgLight ?? DEFAUT_CONFIG.COLOR_BG_LIGHT;
  const dynamicHeight = props.config?.dynamicHeight ?? false;
  const openStyle = props.config?.openStyle ?? {};
  const closeStyle = props.config?.closeStyle ?? {};
  developType = props.config?.developType ?? DevelopType.SCRIPT;

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const heightRef = useRef<number>(0);

  const sessionRef = useRef<Session>();
  const [inputValue, setInputValue] = useState('');
  const msgListRef = useRef<MessageItem[]>([]);
  const [showListLoading, setShowListLoading] = useState(false);
  const [, updateState] = useState<any>();
  const [isExpand, setIsExpand] = useState(false);

  const shortMsgRef = useRef<boolean>(true);

  useEffect(() => {
    if (shortMsgRef.current && msgListRef.current.length > 0) {
      setTimeout(() => {
        shortMsgRef.current = false;
        updateState({});
      }, 5000);
    }
  }, [msgListRef.current]);

  // input 不改变网页大小
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content =
      'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  // size 响应
  useEffect(() => {
    // 每次 resize 都会根据父类大小来定自身大小
    const resize = () => {
      const parent = document.getElementById('mvMindContainer')?.parentElement;
      heightRef.current = parent?.clientHeight ?? 800;
      setWidth(parent?.clientWidth ?? 400);
      setHeight(parent?.clientHeight ?? 800);
    };
    window.addEventListener('resize', resize);

    window.addEventListener('message', (e) => {
      console.log('iFrame receive message~', e);
    });
    resize();
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  // 忽略背景滑动、点击
  useEffect(() => {
    const fixedContainer = document.getElementById('mvMindContainer');
    const eventAreaStart = (e: TouchEvent | MouseEvent) => {
      document.body.style.overflow = 'hidden';
    };
    const eventAreaFinish = (e: TouchEvent | MouseEvent) => {
      document.body.style.overflow = '';
    };
    // pc
    fixedContainer?.addEventListener('mouseenter', eventAreaStart, false);
    fixedContainer?.addEventListener('mouseleave', eventAreaFinish, false);
    // mobile
    fixedContainer?.addEventListener('touchstart', eventAreaStart, false);
    fixedContainer?.addEventListener('touchend', eventAreaFinish, false);
    fixedContainer?.addEventListener('touchcancel', eventAreaFinish, false);
    return () => {
      // pc
      fixedContainer?.removeEventListener('mouseenter', eventAreaStart);
      fixedContainer?.removeEventListener('mouseleave', eventAreaFinish);
      // mobile
      fixedContainer?.removeEventListener('touchstart', eventAreaStart);
      fixedContainer?.removeEventListener('touchend', eventAreaFinish);
      fixedContainer?.removeEventListener('touchcancel', eventAreaFinish);
    };
  }, []);

  // 初始化对话
  useEffect(() => {
    sessionRef.current?.closeSession();
    msgListRef.current = [];

    // createLongLink
    setConfig(socketConfig);

    const openSession = () => {
      sessionRef.current?.openSession({
        mindId: mindConfig.mindId,
        mindType: mindConfig.mindType,
        retryCount: 0,
        callback: (res: any) => {
          props?.sessionCb &&
            res.data.sessionId?.sessionId &&
            props.sessionCb(res.data.sessionId?.sessionId);
        },
      });
    };

    userRegister(userConfig.userName, userConfig.avatar).then((res) => {
      sessionRef.current = new Session(666)
        .setOnMsgUpdateListener((msgList) => {
          console.warn('更新msgList', msgList);
          if (msgList) {
            const remoteLastMsg = msgList[msgList.length - 1];
            const newMsg = transformNewMsg(remoteLastMsg);
            if (remoteLastMsg.type !== WS_MSG_TYPE.msg) {
              return;
            }
            // 只处理消息
            if (hasSameMessage(newMsg)) {
              return;
            }
            // 没有相同的消息的情况下才需要添加
            appendMsg(newMsg);
          }
        })
        .setOnSessionInvalidListener(() => {
          console.error('Session Error');
        });
      openSession();
    });
  }, []);

  // 改变 expand 模式
  // 如果后面要加动画的话
  useEffect(() => {
    if (!isExpand) {
      document.body.style.overflow = '';
    }
    if (isExpand) {
      window.parent.postMessage(EVENT.EVENT_AVATAR_OPEN, '*');
    } else {
      window.parent.postMessage(EVENT.EVENT_AVATAR_CLOSE, '*');
    }

    const openAvatar = () => {
      setIsExpand(true);
    };
    const closeAvatar = () => {
      setIsExpand(false);
    };
    const eventRouter = () => {
      // 商品卡跳转了，展示新的短消息
      shortMsgRef.current = true;
    };
    window.addEventListener(EVENT.EVENT_AVATAR_OPEN, openAvatar);
    window.addEventListener(EVENT.EVENT_AVATAR_CLOSE, closeAvatar);

    window.addEventListener(EVENT.EVENT_ROUTER, eventRouter);

    return () => {
      window.removeEventListener(EVENT.EVENT_AVATAR_OPEN, openAvatar);
      window.removeEventListener(EVENT.EVENT_AVATAR_CLOSE, closeAvatar);
      window.removeEventListener(EVENT.EVENT_ROUTER, eventRouter);
    };
  }, [isExpand]);

  // 回车发送消息
  useEffect(() => {
    const input = document.getElementById('mv_container_input');
    const pressEvent = (event: KeyboardEvent) => {
      if (event.key == 'Enter') {
        event.preventDefault();
        handleSendMsg(inputValue);
      }
    };
    input?.addEventListener('keypress', pressEvent);
    return () => {
      input?.removeEventListener('keypress', pressEvent);
    };
  }, [inputValue]);

  function appendMsg(item: MessageItem) {
    if (item.type === MessageItemType.RECEIVE) {
      appendReceivedMsg(item);
    } else if (item.type === MessageItemType.SEND) {
      msgListRef.current = [...msgListRef.current, item];
    }
    checkHeight();
  }

  // scroll 需要给定高度
  const checkHeight = () => {
    const container = document.getElementById('mvMindContainer');
    if (container && container?.clientHeight === heightRef.current) {
      container.style.height = `${heightRef.current}px`;
    }
  };

  const appendReceivedMsg = (item: MessageItem) => {
    msgListRef.current = [...msgListRef.current, item];

    // 由于 UMM 默认返回2条数据，所以在只有一条的时候，使用 loading，等待第二条消息
    // 连续取2个top的消息，仅有第一个是 clientType："receive"
    // 此时展示 loading，7秒后重新判断此条件，依然仅有一个clientType："receive"，则loading消失
    let onlyOneReceive = false;
    if (
      msgListRef.current.length >= 2 &&
      msgListRef.current[msgListRef.current.length - 1].type ===
        MessageItemType.RECEIVE &&
      msgListRef.current[msgListRef.current.length - 2].type !==
        MessageItemType.RECEIVE
    ) {
      onlyOneReceive = true;
    }
    if (onlyOneReceive) {
      setShowListLoading(true);
      setTimeout(() => {
        // 如果如果倒数第一条不是发送，那么就需要隐藏，loading。因为如果是发送出去的，应该由 send 的逻辑处理
        if (
          msgListRef.current[msgListRef.current.length - 1].type !==
          MessageItemType.SEND
        ) {
          setShowListLoading(false);
        }
      }, 7000);
    } else {
      setShowListLoading(false);
    }

    updateState({});
  };

  const hasSameMessage = (item: MessageItem) => {
    let hasMessage = false;
    if (msgListRef.current.length > 0) {
      hasMessage =
        hasMessage ||
        isSameMessage(item, msgListRef.current[msgListRef.current.length - 1]);
    }
    return hasMessage;
  };

  const handleSendMsg = (value: string) => {
    if (!value) return;
    sessionRef.current?.sendMsg('text', {content: value});
    setShowListLoading(true);
    setInputValue('');
  };

  return (
    <>
      <div
        id="mvMindContainer"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: `${width}px`,
          minHeight: `${height / 2}px`,
          maxHeight: `${height}px`,
          height: dynamicHeight ? 'auto' : `${height}px`,
          backgroundColor: colorBgDark,
          backdropFilter: 'blur(1.8px)',
          borderRadius: '4px',
          zIndex: 50,
          visibility: !isExpand ? 'hidden' : 'visible',
          ...openStyle,
        }}
      >
        {/* 返回框 */}
        <div
          style={{
            position: 'absolute',
            top: '-27px',
            left: '50%',
            transform: 'translate(-50%, 0%)',
            height: '27px',
            width: '54px',
            borderRadius: '100px 100px 0 0',
            backgroundColor: getColorBgDark(),
            cursor: 'pointer',
          }}
          onClick={() => {
            setIsExpand(!isExpand);
          }}
        >
          <div
            style={{
              height: '38px',
              width: '38px',
              borderRadius: '50%',
              marginLeft: '8px',
              marginTop: '8px',
              backgroundColor: 'rgba(52, 52, 52, 0.8)',
              position: 'relative',
            }}
          >
            <img
              style={{
                position: 'absolute',
                width: '38px',
                height: '20px',
                top: '12px',
                objectFit: 'cover',
              }}
              src="https://cdn.mindverse.com/img/zzzz202302241677219088692%E7%BB%84%2014.png"
              alt=""
            />
          </div>
        </div>

        {/* 聊天框 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            maxHeight: `${height - 94}px`,
            marginBottom: '70px',
            marginTop: '24px',
          }}
        >
          <ChatList
            id="assistantChatList"
            msgList={msgListRef.current}
            isLoading={showListLoading}
          />
        </div>

        {/* avatar */}
        <div style={{}}>
          <Avatar
            style={{
              position: 'absolute',
              bottom: '0px',
              left: '17px',
              width: '100px',
              height: '140px',
              zIndex: 50,
            }}
            type={TYPE_AVATAR.PICTURE}
            data={{picture: userConfig.avatar}}
          />
        </div>

        {/* 底部输入框 */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '0px',
            right: 0,
            paddingLeft: '17px',
            paddingRight: '17px',
            height: '70px',
            backgroundColor: '#343434',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              marginLeft: '117px',
              marginTop: '17px',
            }}
          >
            <input
              id="mv_container_input"
              enterKeyHint="send"
              style={{
                paddingLeft: '22px',
                paddingRight: '22px',
                width: '100%',
                height: '30px',
                color: 'black',
                outline: 'none',
                fontSize: '12px',
                borderRadius: '15px',
                borderColor: '#000000',
                borderWidth: '1px',
              }}
              placeholder={'Message'}
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: `0px`,
          right: `0px`,
          width: `${width}px`,
          height: `${140}px`,
          zIndex: 50,
          visibility: isExpand ? 'hidden' : 'visible',
          cursor: 'pointer',
          ...closeStyle,
        }}
        onClick={() => {
          setIsExpand(!isExpand);
          shortMsgRef.current = false;
        }}
      >
        <img
          style={{
            position: 'absolute',
            objectFit: 'cover',
            left: '17px',
            width: '100px',
            height: '140px',
          }}
          src={userConfig.avatar}
          alt=""
        />

        {/* 简短消息 */}
        {shortMsgRef.current && msgListRef.current.length > 0 && (
          <ShortChat
            msgItem={msgListRef.current[msgListRef.current.length - 1]}
            style={{
              position: 'absolute',
              top: 0,
              left: '127px',
              backgroundColor: getColorBgLight(),
              marginRight: '20px',
            }}
          />
        )}
      </div>
    </>
  );
}

export default App;
