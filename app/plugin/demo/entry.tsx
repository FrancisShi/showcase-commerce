/**
 * 业务接入样例
 */
import {useEffect, useState} from 'react';
// import App, {DevelopType} from '../index';
import App, {DevelopType, CONTAINER_EVENT} from '@mindverse/container';
import request from '../utils/request';
import {WS_MIND_TYPE} from '@mindverse/accessor-open/src/type';
import {useNavigate} from '@remix-run/react';
import {CONTAINER_EVENT} from '../utils/utils';

const EVENT_MV_CONTAINER = {
  REOPEN_SESSION: 'mv_EVENT_MV_CONTAINER_REOPEN_SESSION',
};

let sessionId = '';
export function Container({...props}: {[key: string]: any}) {
  const [isMobile, setIsMobile] = useState(false);
  const [refUserId, setRefUserId] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    window.addEventListener(CONTAINER_EVENT.EVENT_ROUTER, (e) => {
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
                mindId: '81870359162392576', // pre
                // mindId: '76643513529405440', // test
                mindType: WS_MIND_TYPE.original,
              },
              socketConfig: {
                apiVersion: '1.3.0',
                platform: 'web',
                appId: 'os_54b9f83c-58e2-4e32-8cc8-b1dcb872c0aa', // pre
                // appId: 'os_742e9fcd-d543-4c99-94d7-404119bea18a', // test
                bizType: '',
                merchantId: 'c1dyf', // pre
                // merchantId: 'c1e3x', // test
                mAuthType: 'STATION_KEY',

                refUserId,

                merchantBaseURL: 'https://gateway-pre.mindverse.com', // pre
                // merchantBaseURL: 'https://gateway-test.mindverse.com', // test
                merchantSocketPath: '/chat/rest/general/ws/create',
                merchantSessionOpenPath: '/chat/rest/general/session/create',
                merchantSessionClosePath: '/chat/rest/general/session/close',
                merchantUserRegisterPath: '/chat/rest/general/user/register',
                merchantSocketCheckPath: '/chat/rest/general/ws/get',
                merchantSessionCheckPath: '/chat/rest/general/session/get',

                headers: {},
              },
              userConfig: {
                userName: 'shitou-demo',
                picture:
                  'https://cdn.mindverse.com/files/zzzz20230308167826913484720230308-175144.gif',
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
        url: '/chat/rest/general/session/env/page/push',
        method: 'post',
        data,
      })
        .then((res) => {
          console.log('product', res);
        })
        .catch((res) => {
          console.error('/chat/rest/demo/push/page 调用失败', res);
        });
    }
  }
}
