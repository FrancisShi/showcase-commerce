import React, {useEffect, useRef, useState} from 'react';
import {
  WS_MIND_TYPE,
  WS_MSG_DATA_TYPE,
  WS_MSG_TYPE,
} from '@mindverse/accessor-open/src/type';
import {Session, setConfig, userRegister} from '@mindverse/accessor-open';
import ChatList from './chat';
import MessageItem, {
  isSameMessage,
  MessageItemType,
  transformNewMsg,
} from './chat/model/message-item';
import Avatar, {TYPE_AVATAR} from './avatar';

const DEFAUT_CONFIG = {
  AVATAR:
    'https://cdn.mindverse.com/img/zzzz202302211676948571901%E5%BF%83%E8%AF%86%E5%BC%95%E5%AF%BC%E5%91%98.png',
  COLOR_BG_DARK: '#738981',
  COLOR_BG_LIGHT: '#D6F3E9',
};

let colorBgDark: string = DEFAUT_CONFIG.COLOR_BG_DARK;
let colorBgLight: string = DEFAUT_CONFIG.COLOR_BG_LIGHT;

export const getColorBgDark = () => {
  return colorBgDark;
};

export const getColorBgLight = () => {
  return colorBgLight;
};

function App(props: {
  sessionCb: (sessionId: string) => void;
  config: {
    refUserId: string;
    mindId: string;
    bgDark?: string;
    bgLight?: string;
  };
}) {
  const refUserId = props.config.refUserId;
  const mindId = props.config.mindId;
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
    // createLongLink
    setConfig({
      apiVersion: '1.2.0',
      platform: 'Saas',
      appId: 'os_742e9fcd-d543-4c99-94d7-404119bea18a',
      bizType: 'SAAS',
      merchantId: 'c1e3x',
      mAuthType: 'SAAS_KEY',

      refUserId,

      merchantBaseURL: 'https://test-accessor.mindverse.com',
      merchantSocketPath: '/rest/demo/ws/create',
      merchantSessionOpenPath: '/rest/demo/session/create',
      merchantSessionClosePath: '/rest/demo/session/close',
      merchantUserRegisterPath: '/rest/demo/user/register',
      merchantSocketCheckPath: '/rest/demo/ws/get',
      merchantSessionCheckPath: '/rest/demo/session/get',

      headers: {},
    });

    const openSession = () => {
      sessionRef.current?.openSession({
        mindId,
        mindType: WS_MIND_TYPE.original,
        retryCount: 0,
        callback: (res: any) => {
          props?.sessionCb &&
            res.data.sessionId?.sessionId &&
            props.sessionCb(res.data.sessionId?.sessionId);
        },
      });
    };

    userRegister(
      'shitou-demo', // document.getElementById("#nickname").value,
      DEFAUT_CONFIG.AVATAR,
    ).then((res) => {
      sessionRef.current = new Session()
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
        {/* close */}
        <div
          style={{
            position: 'absolute',
            right: '16px',
            top: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#EAEAEA',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => {
            setIsExpand(!isExpand);
          }}
        >
          <img
            style={{width: '10px', height: '10px'}}
            src="https://cdn.mindverse.com/img/zzzz202302231677132286094Vector.png"
            alt="close"
          />
        </div>

        {/* hint */}
        <div
          style={{
            position: 'absolute',
            right: '19px',
            top: '15px',
            color: '#FFFFFF',
            fontSize: '12px',
            alignItems: 'flex-end',
            textAlign: 'end',
          }}
        >
          <div>Content is generated by AI</div>
          <div>doesn't present official views</div>
        </div>

        {/* avatar */}
        <Avatar
          type={TYPE_AVATAR.PICTURE}
          data={{picture: DEFAUT_CONFIG.AVATAR}}
        />

        <div
          style={{
            width: '100%',
            height: '100%',
            paddingBottom: '90px',
            paddingTop: '60px',
          }}
        >
          <ChatList
            id="assistantChatList"
            msgList={msgListRef.current}
            isLoading={showListLoading}
          />
        </div>

        {/* 底部输入框 */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: 0,
            right: 0,
            paddingLeft: '17px',
            paddingRight: '17px',
            height: '90px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{display: 'flex', width: '100%', marginTop: '17px'}}>
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
              placeholder={'start chat'}
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
            />
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: '10px',
              color: '#8D8D8D',
              position: 'absolute',
              bottom: '15px',
            }}
          >
            Power by MindOS
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
          src={DEFAUT_CONFIG.AVATAR}
          alt=""
        />
      </div>
    </>
  );
}

export default App;
