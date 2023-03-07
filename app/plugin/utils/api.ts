import request from './request';

export const userInit = (
  refUserId: string,
  user: {
    name: string;
    gender: string;
    profession: string;
    age: string;
    description: string;
  },
) => {
  return request({
    url: '/chat/rest/general/user/init',
    method: 'post',
    data: {...user, refUserId},
  }).catch((res) => {
    console.error('/chat/rest/demo/user/init 调用失败', res);
  });
};

export const userGet = (params: {refUserId: string}) => {
  return request({
    url: '/chat/rest/general/user/ref/user/info/query',
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
      console.error('/chat/rest/general/user/ref/user/info/query', res);
    });
};

export const speech2Text = (data: {voiceBase64: string}) => {
  return request({
    url: '/chat/rest/general/voice/speech/2/text',
    method: 'post',
    data,
  })
    .then((res) => {
      return res.data.data;
    })
    .catch((res) => {
      console.error('/chat/rest/general/voice/speech/2/text', res);
    });
};

export const conversationAttitude = (data: {
  sessionId: string;
  msgId: string;
  attitude: number; //1赞成2反对0无观点
}) => {
  return request({
    url: '/umm/UmmBenchmark/benchmark/conversation/attitude/express',
    method: 'post',
    data,
  }).catch((res) => {
    console.error(
      '/umm/UmmBenchmark/benchmark/conversation/attitude/express',
      res,
    );
  });
};
