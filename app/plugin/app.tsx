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

function App() {
  const sessionRef = useRef<Session>();
  const [inputValue, setInputValue] = useState('');
  const msgListRef = useRef<MessageItem[]>([]);
  const [showListLoading, setShowListLoading] = useState(false);
  const [, updateState] = useState<any>();

  useEffect(() => {
    // createLongLink
    setConfig({
      apiVersion: '1.2.0',
      platform: 'web',
      appId: 'os-internal',
      bizType: 'mindos',

      refUserId: '',

      merchantBaseURL: 'https://gateway-test.mindverse.com',
      merchantSocketPath: '/in/rest/os/ws/create',
      merchantSessionOpenPath: '/in/rest/os/session/open',
      merchantSessionClosePath: '/in/rest/os/session/close',
      merchantUserRegisterPath: '/in/rest/os/user/register',
      merchantSocketCheckPath: '/in/rest/os/ws/get',
      merchantSessionCheckPath: '/in/rest/os/session/get',

      headers: {token: '5dbb4bcb-cecb-400a-85f7-bcb5a9de53541676481219222'},
    });

    userRegister(
      'inner-user', // document.getElementById("#nickname").value,
      'https://cdn.mindverse.com/img/zzzz202211091668001738693img_v2_5fc578b1-c983-4f72-bc81-b8e6d76af1ag.png', //document.getElementById("#avatar").value
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
        mindId: '75262283839836160',
        mindType: WS_MIND_TYPE.original,
        retryCount: 0,
        callback: (res: any) => {
          console.warn('openSession', res);
          sessionStorage.setItem('isSessionIdUpdate', 'true');
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
    <div className="fixed bottom-0 right-0 w-64 h-96 bg-indigo-300/90 rounded z-50">
      <div className={'w-full h-full pb-12'}>
        <ChatList
          className={'w-full h-full'}
          id="assistantChatList"
          msgList={msgListRef.current}
          isLoading={showListLoading}
        />
      </div>

      {/* 底部输入框 */}
      <div className="absolute bottom-2 left-0 right-0 mx-3 h-10 bg-white rounded-md flex">
        <input
          id="mv_container_input"
          className="p-2 w-11/12 rounded-md bg-red text-black outline-none"
          placeholder={'start chat'}
          value={inputValue}
          onChange={(e: any) => setInputValue(e.target.value)}
        />
        <div
          className="w-1/12 flex justify-center items-center"
          onClick={() => {
            handleSendMsg(inputValue);
          }}
        >
          <img
            className="h-2 w-3"
            src="https://cdn.mindverse.com/img/zzzz202210121665569536009%E8%B7%AF%E5%BE%84%20%289%29.png"
            alt="enter"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
