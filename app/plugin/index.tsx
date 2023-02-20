import {useEffect, useRef} from 'react';
// import App from './app';
import App from '@mindverse/container';
import request from './request';


let sessionId = '';
export function Container({...props}: {[key: string]: any}) {
  return (
    <App
      sessionCb={(_sessionId: string) => {
        sessionId = _sessionId;
      }}
    />
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
  }
}
