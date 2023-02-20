import React, {useEffect, useRef, useState} from 'react';
import {
  WS_MIND_TYPE,
  WS_MSG_DATA_TYPE,
  WS_MSG_TYPE,
} from '@mindverse/accessor-open/src/type';
import {Session, setConfig, userRegister} from '@mindverse/accessor-open';
import ChatList from './chat-list';
import MessageItem, {
  isSameMessage,
  MessageItemType,
  transformNewMsg,
} from './chat-list/model/message-item';

function App(props: {sessionCb: (sessionId: string) => void}) {
  const sessionRef = useRef<Session>();
  const [inputValue, setInputValue] = useState('');
  const msgListRef = useRef<MessageItem[]>([]);
  const [showListLoading, setShowListLoading] = useState(false);
  const [, updateState] = useState<any>();

  useEffect(() => {
    // createLongLink
    setConfig({
      apiVersion: '1.2.0',
      platform: 'Saas',
      appId: 'os_742e9fcd-d543-4c99-94d7-404119bea18a',
      bizType: 'SAAS',
      merchantId: 'c1e3x',
      mAuthType: 'SAAS_KEY',

      refUserId: 'shitou-demo',

      merchantBaseURL: 'https://test-accessor.mindverse.com',
      merchantSocketPath: '/rest/demo/ws/create',
      merchantSessionOpenPath: '/rest/demo/session/create',
      merchantSessionClosePath: '/rest/demo/session/close',
      merchantUserRegisterPath: '/rest/demo/user/register',
      merchantSocketCheckPath: '/rest/demo/ws/get',
      merchantSessionCheckPath: '/rest/demo/session/get',

      headers: {},
    });

    userRegister(
      'shitou-demo', // document.getElementById("#nickname").value,
      'http://shitou-demo.com', //document.getElementById("#avatar").value
    ).then((res) => {
      sessionRef.current = new Session()
        .setOnMsgUpdateListener((msgList) => {
          console.warn('更新msgList', msgList);

          // console.log
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
      sessionRef.current?.openSession({
        mindId: '76643513529405440',
        mindType: WS_MIND_TYPE.original,
        retryCount: 0,
        callback: (res: any) => {
          props?.sessionCb && props.sessionCb(res.data.sessionId.sessionId);
        },
      });
    });
  }, []);

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
    console.log('handleSendMsg');
    if (!value) return;
    sessionRef.current?.sendMsg('text', {content: value});
    setShowListLoading(true);
    setInputValue('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '320px',
        height: '480px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: '4px',
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          paddingBottom: '40px',
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
          bottom: '8px',
          left: 0,
          right: 0,
          marginLeft: '24px',
          marginRight: '24px',
          height: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          display: 'flex',
        }}
      >
        <input
          id="mv_container_input"
          style={{
            paddingLeft: '8px',
            width: '80%',
            borderRadius: '8px',
            color: 'black',
            outline: 'none',
            fontSize: '14px',
          }}
          placeholder={'start chat'}
          value={inputValue}
          onChange={(e: any) => setInputValue(e.target.value)}
        />
        <div
          style={{
            width: '20%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => {
            handleSendMsg(inputValue);
          }}
        >
          <img
            style={{
              width: '10px',
              height: '10px',
            }}
            src="https://cdn.mindverse.com/img/zzzz202210121665569536009%E8%B7%AF%E5%BE%84%20%289%29.png"
            alt="enter"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
