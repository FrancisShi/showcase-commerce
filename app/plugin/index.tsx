import React, {useEffect, useRef, useState} from 'react';
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

const DEFAUT_CONFIG = {
  COLOR_BG_DARK: 'rgba(115, 129, 137, 0.5)',
  COLOR_BG_LIGHT: '#DEEFF9',
};

let colorBgDark: string = DEFAUT_CONFIG.COLOR_BG_DARK;
let colorBgLight: string = DEFAUT_CONFIG.COLOR_BG_LIGHT;

export const getColorBgDark = () => {
  return colorBgDark;
};

export const getColorBgLight = () => {
  return colorBgLight;
};

export interface MindConfig {
  mindId: string;
  mindType: WS_MIND_TYPE;
}

export interface UserConfig {
  userName: string;
  avatar: string;
}

function App(props: {
  sessionCb: (sessionId: string) => void;
  config: {
    mindConfig: MindConfig;
    socketConfig: Config;
    userConfig: UserConfig;
    bgDark?: string;
    bgLight?: string;
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

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const sessionRef = useRef<Session>();
  const [inputValue, setInputValue] = useState('');
  const msgListRef = useRef<MessageItem[]>([]);
  const [showListLoading, setShowListLoading] = useState(false);
  const [, updateState] = useState<any>();
  const [isExpand, setIsExpand] = useState(true);

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
      setWidth(parent?.clientWidth ?? 400);
      setHeight(parent?.clientHeight ?? 800);
    };
    window.addEventListener('resize', resize);
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
  }

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
          height: `${height}px`,
          backgroundColor: colorBgDark,
          borderRadius: '4px',
          zIndex: 50,
          visibility: !isExpand ? 'hidden' : 'visible',
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
                width: '44px',
                height: '20px',
                top: '12px',
                objectFit: 'cover',
              }}
              src="https://cdn.mindverse.com/img/zzzz202302241677219088692%E7%BB%84%2014.png"
              alt=""
            />
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '100%',
            paddingBottom: '64px',
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
            height: '64px',
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
          bottom: `20px`,
          right: `20px`,
          width: `${80}px`,
          height: `${80}px`,
          zIndex: 50,
          visibility: isExpand ? 'hidden' : 'visible',
        }}
        onClick={() => {
          setIsExpand(!isExpand);
        }}
      >
        <img
          style={{
            position: 'absolute',
            objectFit: 'cover',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            borderColor: getColorBgDark(),
            backgroundColor: getColorBgLight(),
            borderWidth: '3px',
          }}
          src={userConfig.avatar}
          alt=""
        />
      </div>
    </>
  );
}

export default App;
