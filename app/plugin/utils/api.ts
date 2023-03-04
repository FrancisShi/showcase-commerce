import request from './request';

export const userInit = (user: {
  name: string;
  gender: string;
  profession: string;
  age: string;
  description: string;
}) => {
  return request({
    url: '/rest/general/user/init',
    method: 'post',
    data: user,
  }).catch((res) => {
    console.error('/rest/demo/user/init 调用失败', res);
  });
};

export const userGet = (params: {refUserId: string}) => {
  return request({
    url: '/rest/general/user/ref/user/info/query',
    method: 'get',
    params,
  })
    .then((res) => {
      if (res.data.code === 0) {
        return (
          (res.data.data as {
            name: string;
            gender: string;
            profession: string;
            age: string;
            description: string;
          }) ?? {}
        );
      } else {
        return null;
      }
    })
    .catch((res) => {
      console.error('/rest/general/user/ref/user/info/query', res);
    });
};
