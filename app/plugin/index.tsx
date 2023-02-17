import {useEffect, useRef} from 'react';
import App from './app';
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
export function injectHook(key: string, data: PRODUCT) {
  if (sessionId) {
    if (key === 'product' && data) {
      data.sessionId = sessionId;
      data.pageType = 'PRODUCT';
      request({
        url: '/rest/demo/push/page',
        method: 'post',
        data,
      })
        .then((res) => {
          console.warn('product', res);
        })
        .catch((res) => {
          console.error('sessionCheck 调用失败', res);
        });
    }
  }
}
