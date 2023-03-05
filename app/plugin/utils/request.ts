/**
 * 网络请求配置
 */
import axios from 'axios';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';

const BASE_URL = 'https://gateway-pre.mindverse.com/chat/';
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    bizType: '',
    appId: 'os_54b9f83c-58e2-4e32-8cc8-b1dcb872c0aa',
    platform: 'web',
    merchantId: 'c1dyf',
    'M-AuthType': 'STATION_KEY',
  },
  adapter: fetchAdapter,
});

// 链式拦截器, 处理个性化
service.interceptors.request.use(
  (config) => {
    console.warn('request-interceptors', config);
    // config.headers.platform = getConfig().PLATFORM;
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
