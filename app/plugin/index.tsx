import React, {useEffect, useRef, useState, CSSProperties} from 'react';
import {WS_MIND_TYPE, WS_MSG_TYPE} from '@mindverse/accessor-open/src/type';
import {MSG_TYPE} from '@mindverse/accessor-open/src/socket';
import {Config} from '@mindverse/accessor-open/src/env';
import {Session, setConfig, userRegister} from '@mindverse/accessor-open';
import ChatList from './chat';
import UserEdit from './user';
import MessageItem, {
  isSameMessage,
  MessageItemType,
  transformNewMsg,
} from './chat/model/message-item';
import Recorder from 'js-audio-recorder';
import Avatar, {TYPE_AVATAR} from './avatar';
import ShortChat from './chat/shortchat';
import {
  browserType,
  CONTAINER_EVENT as _CONTAINER_EVENT,
  showToast,
} from './utils/utils';
import {speech2Text} from './utils/api';
import {collapse, expand, hideMenu, showMenu} from './utils/anim';

export const CONTAINER_EVENT = _CONTAINER_EVENT;
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
  COLOR_BG_DARK: 'rgba(52, 52, 52, 0.5)',
  COLOR_BG_LIGHT: '#343434',
};

let colorBgDark: string = DEFAUT_CONFIG.COLOR_BG_DARK;
let colorBgLight: string = DEFAUT_CONFIG.COLOR_BG_LIGHT;
let developType: DevelopType = DevelopType.SCRIPT;

let socketConfig: Config;

export const getColorBgDark = () => {
  return colorBgDark;
};

export const getColorBgLight = () => {
  return colorBgLight;
};

export const getDevelopType = () => {
  return developType;
};

export const getSocketConfig = () => {
  return socketConfig;
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
    initialExpand?: boolean;
    openStyle?: CSSProperties;
    closeStyle?: CSSProperties;
    developType?: DevelopType;
  };
}) {
  const mindConfig = props.config.mindConfig;
  if (!mindConfig.mindId) {
    return null;
  }

  socketConfig = props.config.socketConfig;
  const userConfig = props.config.userConfig;
  colorBgDark = props.config?.bgDark ?? DEFAUT_CONFIG.COLOR_BG_DARK;
  colorBgLight = props.config?.bgLight ?? DEFAUT_CONFIG.COLOR_BG_LIGHT;
  const dynamicHeight = props.config?.dynamicHeight ?? false;
  const initialExpand = props.config?.initialExpand ?? false;
  const openStyle = props.config?.openStyle ?? {};
  const closeStyle = props.config?.closeStyle ?? {};
  developType = props.config?.developType ?? DevelopType.SCRIPT;

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const heightRef = useRef<number>(0);

  const sessionRef = useRef<Session>();
  const [inputValue, setInputValue] = useState('');
  const msgListRef = useRef<MessageItem[]>([]);
  const hintListRef = useRef<MSG_TYPE[]>([]);
  const [showListLoading, setShowListLoading] = useState(false);
  const [, updateState] = useState<any>();
  const isExpandRef = useRef<boolean>(initialExpand);

  // ???????????????
  const msgLastReceiveIdRef = useRef<string | undefined>('');
  const [showShowMsgState, setShowShowMsgState] = useState(false);

  const mainContentIndexRef = useRef<number>(0);

  const [sessionOpened, setSessionOpened] = useState<boolean>(false);

  const isMobile = browserType() === 'mob';
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // ????????????
  useEffect(() => {
    const mindUpdate = () => {
      if (msgListRef.current.length > 0) {
        const lastMsg = msgListRef.current[msgListRef.current.length - 1];
        if (lastMsg.dividerContent !== 'Genius Updated') {
          appendMsg({
            type: MessageItemType.SYSTEM,
            dividerContent: 'Genius Updated',
            multipleData: [],
            data: {content: ''},
            seqId: '',
          });
        }
      }
    };
    window.addEventListener(CONTAINER_EVENT.MIND_UPDATE, mindUpdate);
    return () => {
      window.removeEventListener(CONTAINER_EVENT.MIND_UPDATE, mindUpdate);
    };
  }, [msgListRef.current]);

  // ???????????????
  useEffect(() => {
    if (
      msgListRef.current.length > 0 &&
      msgListRef.current[msgListRef.current.length - 1].type ===
        MessageItemType.RECEIVE
    ) {
      if (isExpandRef.current) {
        setShowShowMsgState(false);
      } else if (
        msgLastReceiveIdRef.current !==
        msgListRef.current[msgListRef.current.length - 1].messageId
      ) {
        setShowShowMsgState(true);
        showShortAnim();
        setTimeout(() => {
          hideShortAnim(() => {
            setShowShowMsgState(false);
          });
        }, 5000);
      }
      msgLastReceiveIdRef.current =
        msgListRef.current[msgListRef.current.length - 1].messageId;
    }
  }, [msgListRef.current, isExpandRef.current]);

  const showShortAnim = () => {
    const shortChat = document.getElementById('shortChat');
    if (shortChat) {
      shortChat.animate([{opacity: 0}, {opacity: 1}], {
        duration: 500,
      });
    }
  };

  const hideShortAnim = (cb: () => void) => {
    const shortChat = document.getElementById('shortChat');
    if (shortChat) {
      shortChat.animate([{opacity: 1}, {opacity: 0}], {
        duration: 500,
      });
      setTimeout(cb, 500);
    }
  };

  // input ?????????????????????
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content =
      'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  // size ??????
  useEffect(() => {
    const mindContainer = document.getElementById('mvMindContainer');
    if (mindContainer) {
      setTimeout(() => {
        mindContainer.style.backdropFilter = 'blur(1.8px)';
        // @ts-ignore ?????? Safari
        mindContainer.style.webkitBackdropFilter = 'blur(1.8px)';
      }, 0);
    }

    // ?????? resize ??????????????????????????????????????????
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

  // ???????????????????????????
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

  // ???????????????
  useEffect(() => {
    // createLongLink
    setConfig(socketConfig);
    const openSession = () => {
      sessionRef.current?.openSession({
        mindId: mindConfig.mindId,
        mindType: mindConfig.mindType,
        retryCount: 0,
        callback: (res: any) => {
          setSessionOpened(true);
          props?.sessionCb &&
            res.data.sessionId?.sessionId &&
            props.sessionCb(res.data.sessionId?.sessionId);
        },
      });
    };

    userRegister(userConfig.userName, userConfig.avatar).then((res) => {
      sessionRef.current = new Session(666)
        .setOnMsgUpdateListener((msgList) => {
          console.warn('??????msgList', msgList);
          if (msgList) {
            const remoteLastMsg = msgList[msgList.length - 1];
            const newMsg = transformNewMsg(remoteLastMsg);
            if (remoteLastMsg.type !== WS_MSG_TYPE.msg) {
              return;
            }
            // ???????????????
            if (hasSameMessage(newMsg)) {
              return;
            }
            // ????????????????????????????????????????????????
            appendMsg(newMsg);
          }
        })
        .setOnSessionInvalidListener(() => {
          appendMsg({
            type: MessageItemType.SYSTEM,
            dividerContent: 'Session Ended',
            multipleData: [],
            data: {content: ''},
            seqId: '',
          });
        })
        .setOnHintListener((msg: MSG_TYPE) => {
          appendHint(msg);
        });
      openSession();
    });
    return () => {
      sessionRef.current?.closeSession();
      msgListRef.current = [];
      updateState({});
    };
  }, [mindConfig.mindId]);

  // ?????? expand ??????
  // ??????????????????????????????
  useEffect(() => {
    if (!isExpandRef.current) {
      document.body.style.overflow = '';
    }
    if (isExpandRef.current) {
      window.parent.postMessage(CONTAINER_EVENT.EVENT_AVATAR_OPEN, '*');
    } else {
      window.parent.postMessage(CONTAINER_EVENT.EVENT_AVATAR_CLOSE, '*');
    }

    const openAvatar = () => {
      isExpandRef.current = true;
      updateState({});
    };
    const closeAvatar = () => {
      isExpandRef.current = false;
      updateState({});
    };
    window.addEventListener(CONTAINER_EVENT.EVENT_AVATAR_OPEN, openAvatar);
    window.addEventListener(CONTAINER_EVENT.EVENT_AVATAR_CLOSE, closeAvatar);
    return () => {
      window.removeEventListener(CONTAINER_EVENT.EVENT_AVATAR_OPEN, openAvatar);
      window.removeEventListener(
        CONTAINER_EVENT.EVENT_AVATAR_CLOSE,
        closeAvatar,
      );
    };
  }, [isExpandRef.current]);

  // ??????????????????
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

  // ????????????
  useEffect(() => {
    let granted = false;
    let recorder: Recorder;

    const recorderImg = document.getElementById('voiceRecorder');
    const eventAreaStart = (e: TouchEvent | MouseEvent) => {
      if (navigator.mediaDevices.getUserMedia) {
        if (!granted) {
          const constraints = {audio: true};
          navigator.mediaDevices.getUserMedia(constraints).then(
            (stream) => {
              console.log('???????????????');
              granted = true;
            },
            () => {
              console.error('???????????????');
            },
          );
        } else {
          recorder = new Recorder({
            sampleBits: 16, // ????????????????????? 8 ??? 16????????????16
            sampleRate: 16000, // ?????????????????? 11025???16000???22050???24000???44100???48000????????????????????????????????????chrome???48000
            numChannels: 1,
          });

          recorder.start().then(
            () => {
              setIsRecording(true);
              // ????????????
              console.log('???????????????=========');
              navigator.vibrate =
                navigator.vibrate ||
                // @ts-ignore
                navigator.webkitVibrate ||
                // @ts-ignore
                navigator.mozVibrate ||
                // @ts-ignore
                navigator.msVibrate;
              // @ts-ignore
              if (navigator.vibrate) {
                navigator.vibrate(200);
                console.log('?????????????????????');
              }
            },
            (error) => {
              setIsRecording(false);
              // ?????????
              console.error(error);
            },
          );
        }
      } else {
        showToast('?????????????????? getUserMedia');
      }
    };
    const eventAreaFinish = (e: TouchEvent | MouseEvent) => {
      setIsRecording(false);
      recorder.stop();
      const wavBlob = recorder.getWAVBlob();
      const reader = new FileReader();
      reader.readAsDataURL(wavBlob);
      reader.onloadend = function () {
        const base64data = reader.result;
        if (
          typeof base64data === 'string' &&
          base64data.indexOf('data:audio/wav;base64,') === 0
        ) {
          const result = base64data.split('data:audio/wav;base64,')[1];
          if (result) {
            speech2Text({voiceBase64: result}).then((res) => {
              if (res && typeof res === 'string' && res.length > 0) {
                handleSendMsg(res);
              } else {
                showToast(`No recognizable speech detected, please try again.`);
              }
            });
          }
        }
      };
    };
    // mobile
    recorderImg?.addEventListener('touchstart', eventAreaStart, false);
    recorderImg?.addEventListener('touchend', eventAreaFinish, false);
    recorderImg?.addEventListener('touchcancel', eventAreaFinish, false);
    return () => {
      // mobile
      recorderImg?.removeEventListener('touchstart', eventAreaStart);
      recorderImg?.removeEventListener('touchend', eventAreaFinish);
      recorderImg?.removeEventListener('touchcancel', eventAreaFinish);
    };
  }, []);

  function appendMsg(item: MessageItem) {
    if (item.type === MessageItemType.RECEIVE) {
      appendReceivedMsg(item);
    } else if (item.type === MessageItemType.SEND) {
      msgListRef.current = [...msgListRef.current, item];
    } else if (item.type === MessageItemType.SYSTEM) {
      msgListRef.current = [...msgListRef.current, item];
    }
    checkHeight();
    updateState({});
  }

  function appendHint(msg: MSG_TYPE) {
    hintListRef.current = [...hintListRef.current, msg];
    updateState({});
  }

  // scroll ??????????????????
  const checkHeight = () => {
    const container = document.getElementById('mvMindContainer');
    if (container && container?.clientHeight === heightRef.current) {
      container.style.height = `${heightRef.current}px`;
    }
  };

  const appendReceivedMsg = (item: MessageItem) => {
    msgListRef.current = [...msgListRef.current, item];

    // ?????? UMM ????????????2??????????????????????????????????????????????????? loading????????????????????????
    // ?????????2???top?????????????????????????????? clientType???"receive"
    // ???????????? loading???7????????????????????????????????????????????????clientType???"receive"??????loading??????
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
        // ??????????????????????????????????????????????????????????????????loading????????????????????????????????????????????? send ???????????????
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
      {/* ???????????? */}
      <div
        id="mvMindContainer"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: `${width}px`,
          minHeight: `${532}px`,
          maxHeight: `${height}px`,
          height: dynamicHeight ? 'auto' : `${height}px`,
          backgroundColor: colorBgDark,
          borderRadius: '4px',
          zIndex: 50,
          visibility: !isExpandRef.current ? 'hidden' : 'visible',
          ...openStyle,
        }}
      >
        {/* ????????? */}
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
            collapse(
              'mvMindContainer',
              'mvMindContainerCollapse',
              height,
              () => {
                isExpandRef.current = false;
                updateState({});
              },
            );
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

        {/* ????????? */}
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
            hintList={hintListRef.current}
            isLoading={showListLoading}
            style={{
              display: mainContentIndexRef.current === 0 ? 'block' : 'none',
            }}
          />

          {/* ????????????????????? */}
          <UserEdit
            id={'userEditContainer'}
            refUserId={socketConfig.refUserId}
            style={{
              display: mainContentIndexRef.current === 1 ? 'block' : 'none',
            }}
          />
        </div>

        {/* avatar */}
        <div style={{}}>
          <Avatar
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '86px',
              height: '120px',
              zIndex: 50,
            }}
            type={TYPE_AVATAR.PICTURE}
            data={{picture: userConfig.avatar}}
          />

          {/* ?????????????????? */}
          {sessionOpened && (
            <div
              onClick={(e) => {
                if (mainContentIndexRef.current === 1) {
                  hideMenu('userEditContainer', width, () => {
                    mainContentIndexRef.current = 0;
                    updateState({});
                  });
                } else if (mainContentIndexRef.current === 0) {
                  showMenu('userEditContainer', width, () => {
                    mainContentIndexRef.current = 1;
                    updateState({});
                  });
                }
                updateState({});
                e.stopPropagation();
              }}
              style={{
                position: 'absolute',
                objectFit: 'cover',
                right: '22px',
                bottom: '120px',
                zIndex: 100,
              }}
            >
              <img
                style={{
                  width: '22px',
                  height: '22px',
                }}
                src={
                  mainContentIndexRef.current === 0
                    ? 'https://cdn.mindverse.com/img/zzzz202303031677844963805%E7%BB%84%2043.png'
                    : 'https://cdn.mindverse.com/img/zzzz202303031677845661804%E7%BB%84%2044.png'
                }
                alt=""
              />
            </div>
          )}
        </div>

        {/* ??????????????? */}
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
              marginLeft: '0px',
              marginTop: '15px',
              zIndex: 50,
              position: 'relative',
            }}
          >
            <input
              id="mv_container_input"
              enterKeyHint="send"
              style={{
                paddingLeft: '22px',
                paddingRight: isMobile ? '50px' : '22px',
                width: '100%',
                height: '40px',
                color: 'black',
                outline: 'none',
                fontSize: '12px',
                borderRadius: '20px',
                marginRight: '68px',
              }}
              placeholder={'Message'}
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
            />

            {isMobile && (
              <div style={{position: 'absolute', right: '72px', zIndex: 100}}>
                <div
                  id="voiceRecorder"
                  style={{width: '40px', height: '40px', position: 'relative'}}
                >
                  {!isRecording && (
                    <img
                      style={{
                        width: '30px',
                        height: '30px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        pointerEvents: 'none',
                        marginTop: '5px',
                      }}
                      src="https://cdn.mindverse.com/img/zzzz202303081678277823582%E8%AF%AD%E9%9F%B3%E8%BE%93%E5%85%A5%202.png"
                      alt=""
                    />
                  )}

                  {isRecording && (
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        backgroundColor: '#1B1B1B',
                        borderRadius: '50%',
                        position: 'absolute',
                        right: '-10px',
                        top: '-50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        style={{
                          width: '24px',
                          height: '41px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          pointerEvents: 'none',
                        }}
                        src="https://cdn.mindverse.com/img/zzzz202303061678103877011%E7%BB%84%206.png"
                        alt=""
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ???????????? */}
      <div
        id="mvMindContainerCollapse"
        style={{
          position: 'fixed',
          bottom: `0px`,
          right: `0px`,
          width: `${width}px`,
          height: `${120}px`,
          zIndex: 50,
          visibility: isExpandRef.current ? 'hidden' : 'visible',
          cursor: 'pointer',
          pointerEvents: 'none',
          ...closeStyle,
        }}
      >
        <div
          onClick={() => {
            expand('mvMindContainer', 'mvMindContainerCollapse', height, () => {
              isExpandRef.current = true;
              updateState({});
            });
          }}
        >
          <img
            style={{
              position: 'absolute',
              objectFit: 'cover',
              right: '0px',
              width: '86px',
              height: '120px',
              pointerEvents: 'auto',
            }}
            src={userConfig.avatar}
            alt=""
          />
        </div>

        {/* ???????????? */}
        <div
          onClick={() => {
            isExpandRef.current = !isExpandRef.current;
            updateState({});
          }}
        >
          <ShortChat
            id="shortChat"
            msgList={msgListRef.current}
            style={{
              display: showShowMsgState ? 'block' : 'none',
              position: 'absolute',
              top: '10px',
              right: '60px',
              backgroundColor: getColorBgLight(),
              marginRight: '20px',
              maxHeight: '90px',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '20px',
              pointerEvents: 'auto',
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;
