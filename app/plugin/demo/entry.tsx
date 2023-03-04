/**
 * 业务接入样例
 */
import {useEffect, useRef, useState} from 'react';
import App, {DevelopType, EVENT} from '../index';
// import App, {DevelopType, EVENT} from '@mindverse/container';
import {isBrowser} from 'browser-or-node';
import request from '../utils/request';
import {Config} from '@mindverse/accessor-open/src/env';
import {WS_MIND_TYPE} from '@mindverse/accessor-open/src/type';
import {useNavigate} from '@remix-run/react';

const EVENT_MV_CONTAINER = {
  REOPEN_SESSION: 'mv_EVENT_MV_CONTAINER_REOPEN_SESSION',
};

let sessionId = '';
export function Container({...props}: {[key: string]: any}) {
  const [isMobile, setIsMobile] = useState(false);
  const [refUserId, setRefUserId] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    window.addEventListener(EVENT.EVENT_ROUTER, (e) => {
      // @ts-ignore
      const router = e.detail;
      if (router) {
        const arr = router.split('/');
        if (arr && arr.length > 1) {
          const path1 = arr[arr.length - 2];
          const path2 = arr[arr.length - 1];
          console.warn('router', `/${path1}/${path2}`);
          navigate(`/${path1}/${path2}`);
        }
      }
    });
  }, []);

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
    <div style={{position: 'absolute', right: 0, bottom: 0}}>
      <div
        style={{
          position: 'relative',
          ...(isMobile
            ? {width: '100vw', height: '80vh'}
            : {width: '400px', height: '600px'}),
        }}
      >
        {refUserId && (
          <App
            sessionCb={(_sessionId: string) => {
              sessionId = _sessionId;
            }}
            config={{
              mindConfig: {
                mindId: '76643513529405440',
                mindType: WS_MIND_TYPE.original,
              },
              socketConfig: {
                apiVersion: '1.3.0',
                platform: 'web',
                appId: 'os_742e9fcd-d543-4c99-94d7-404119bea18a',
                bizType: '',
                merchantId: 'c1e3x',
                mAuthType: 'STATION_KEY',

                refUserId,

                merchantBaseURL: 'https://gateway-test.mindverse.com/chat',
                merchantSocketPath: '/rest/general/ws/create',
                merchantSessionOpenPath: '/rest/general/session/create',
                merchantSessionClosePath: '/rest/general/session/close',
                merchantUserRegisterPath: '/rest/general/user/register',
                merchantSocketCheckPath: '/rest/general/ws/get',
                merchantSessionCheckPath: '/rest/general/session/get',

                headers: {},
              },
              userConfig: {
                userName: 'shitou-demo', // document.getElementById("#nickname").value,
                avatar:
                  'https://cdn.mindverse.com/img/zzzz202302211676948571901%E5%BF%83%E8%AF%86%E5%BC%95%E5%AF%BC%E5%91%98.png',
              },
              dynamicHeight: true,
              developType: DevelopType.NPM,
            }}
          />
        )}
      </div>
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
  }
}
