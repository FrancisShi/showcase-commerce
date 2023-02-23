/**
 * 业务接入样例
 */
import {useEffect, useRef, useState} from 'react';
import App from '.';
// import App from '@mindverse/container';
import {isBrowser} from 'browser-or-node';
import request from './request';

const EVENT_MV_CONTAINER = {
  REOPEN_SESSION: 'mv_EVENT_MV_CONTAINER_REOPEN_SESSION',
};

let sessionId = '';
export function Container({...props}: {[key: string]: any}) {
  const [isMobile, setIsMobile] = useState(false);
  const [refUserId, setRefUserId] = useState('');

  useEffect(() => {
    const resize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', resize);
    resize();
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const ss = window.localStorage;
    const userId = ss.getItem('mv_shopify_userId');
    if (userId) {
      setRefUserId(userId);
    } else {
      const fakeId = `anonymity_${new Date().getTime()}_${
        Math.random() * 10000
      }`;
      ss.setItem('mv_shopify_userId', fakeId);
      setRefUserId(fakeId);
    }

    // 接受消息 reopen session
    const reopenSession = () => {
      const userId = ss.getItem('mv_shopify_userId');
      if (userId) {
        setRefUserId('');
        setTimeout(() => {
          setRefUserId(userId);
        }, 500);
      }
    };
    window.addEventListener(EVENT_MV_CONTAINER.REOPEN_SESSION, reopenSession);
    return () => {
      window.removeEventListener(
        EVENT_MV_CONTAINER.REOPEN_SESSION,
        reopenSession,
      );
    };
  }, []);

  return (
    <div
      style={
        isMobile
          ? {width: '100vw', height: '80vh'}
          : {width: '400px', height: '600px'}
      }
    >
      {refUserId && (
        <App
          sessionCb={(_sessionId: string) => {
            sessionId = _sessionId;
          }}
          config={{refUserId, mindId: '76712860721483776'}}
        />
      )}
    </div>
  );
}

export interface PRODUCT {
  productUrl: string;
  productTitle: string;
  productPrice: string;
  productDescription: string;
  productPic: string;
  sessionId?: string;
  pageType?: string;
}

export interface USER {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export function injectHook(key: string, data: PRODUCT | USER) {
  if (key === 'product' && data) {
    if (sessionId) {
      data = data as PRODUCT;
      data.sessionId = sessionId;
      data.pageType = 'PRODUCT';
      request({
        url: '/rest/demo/push/page',
        method: 'post',
        data,
      })
        .then((res) => {
          console.log('product', res);
        })
        .catch((res) => {
          console.error('/rest/demo/push/page 调用失败', res);
        });
    }
  } else if (key === 'user' && data) {
    data = data as USER;
    request({
      url: '/rest/demo/init/user',
      method: 'post',
      data,
    })
      .then((res) => {
        console.log('user', res);
      })
      .catch((res) => {
        console.error('/rest/demo/user/init 调用失败', res);
      });

    // check user 是否更新
    if (isBrowser) {
      const ss = window.localStorage;
      const userId = ss.getItem('mv_shopify_userId');
      if (data.id && userId && data.id !== userId) {
        ss.setItem('mv_shopify_userId', data.id);
        window.dispatchEvent(new Event(EVENT_MV_CONTAINER.REOPEN_SESSION));
      }
    }
  }
}
