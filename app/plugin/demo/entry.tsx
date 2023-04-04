/**
 * 业务接入样例
 */
import {useEffect, useState} from 'react';
import Fingerprint2 from 'fingerprintjs2'; // 引入fingerprintjs2
// import App, {DevelopType, CONTAINER_EVENT, request} from '../index';
import App, {DevelopType, CONTAINER_EVENT, request} from '@mindverse/container';
import {WS_MIND_TYPE} from '@mindverse/accessor-open/src/type';
import {useNavigate} from '@remix-run/react';
import {Readability} from '@mozilla/readability';

const EVENT_MV_CONTAINER = {
  REOPEN_SESSION: 'mv_EVENT_MV_CONTAINER_REOPEN_SESSION',
};

let sessionId = '';
export function Container({...props}: {[key: string]: any}) {
  const [isMobile, setIsMobile] = useState(false);

  // todo 增加 MindId 前缀
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
    const browserId = localStorage.getItem('browserId');
    if (browserId) {
      setRefUserId(browserId);
    } else {
      // 选择哪些信息作为浏览器指纹生成的依据
      const options = {
        fonts: {
          extendedJsFonts: true,
        },
        excludes: {
          audio: true,
          userAgent: true,
          enumerateDevices: true,
          touchSupport: true,
        },
      };
      // 浏览器指纹
      const fingerprint = Fingerprint2.get(options, (components) => {
        // 参数只有回调函数或者options为{}时，默认浏览器指纹依据所有配置信息进行生成
        const values = components.map((component) => component.value); // 配置的值的数组
        const murmur = Fingerprint2.x64hash128(values.join(''), 31); // 生成浏览器指纹
        localStorage.setItem('browserId', murmur); // 存储浏览器指纹，在项目中用于校验用户身份和埋点
        setRefUserId(murmur);
      });
    }

    // 接受消息 reopen session
    const reopenSession = () => {
      const userId = localStorage.getItem('browserId');
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
                mindId: '85538147164884992',
                mindType: WS_MIND_TYPE.original,
              },
              socketConfig: {
                apiVersion: '1.3.0',
                platform: 'web',
                appId: 'os_6749495f-ae3c-4f87-9233-f233d670e3dc',
                bizType: '',
                merchantId: 'c1dyy',
                mAuthType: 'STATION_KEY',

                refUserId,

                merchantBaseURL: 'https://gateway.sg.mindverse.ai',
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
              openStyle: {
                position: 'fixed',
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
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone).parse();
      data.freetext = article;
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
