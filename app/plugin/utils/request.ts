/**
 * 网络请求配置
 */
import axios from 'axios';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';
import {getSocketConfig} from '..';

const BASE_URL = 'https://gateway-pre.mindverse.com/chat/';
const service = axios.create({
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  adapter: fetchAdapter,
});

// 链式拦截器, 处理个性化
service.interceptors.request.use(
  (config) => {
    const socketConfig = getSocketConfig();
    config.baseURL = socketConfig.merchantBaseURL;
    if (config.headers) {
      config.headers.bizType = socketConfig.bizType;
      config.headers.appId = socketConfig.appId;
      config.headers.platform = socketConfig.platform;
      config.headers.merchantId = socketConfig.merchantId;
      config.headers['M-AuthType'] = socketConfig.mAuthType;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    return checkStatus(response);
  },
  (error) => {
    console.log('请求出错：', error);
  },
);

const checkStatus = (response: any) => {
  if (response.status >= 200 && response.status < 300 && response.data) {
    return response;
  }
  return response.json().then((res: any) => {
    const errortext = res.message || response.statusText;
    console.error({
      message: `请求错误 ${response.status}`,
      description: `${errortext}`,
    });
  });
};

export default service;
