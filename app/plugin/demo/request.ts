/**
 * 网络请求配置
 */
import axios from 'axios';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';

const BASE_URL = 'https://test-accessor.mindverse.com';
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    bizType: 'SAAS',
    appId: 'os_742e9fcd-d543-4c99-94d7-404119bea18a',
    platform: 'Saas',
    merchantId: 'c1e3x',
    'M-AuthType': 'SAAS_KEY',
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
