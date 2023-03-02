import React from 'react';
import {WS_MSG_MULTIPLE_TEMPLATE} from '@mindverse/accessor-open/src/type';

export interface TemplateInterface {
  content: string;
}

export default function Template(props: TemplateInterface) {
  const {content} = props;

  const clickTemplate = (link: string) => {
    const e = new Event('mv_client_container_router');
    // @ts-ignore
    e.detail = link;
    window.dispatchEvent(e);
    // todo
    // 增加 script 接入的形式，通过 a 链接跳转
  };

  const template = JSON.parse(content) as WS_MSG_MULTIPLE_TEMPLATE;
  if (!template) {
    return null;
  }

  if (template.templateName === 'shopifyCard') {
    const data = template.params;

    return (
      <div
        style={{marginBottom: '10px', marginTop: '10px', position: 'relative'}}
      >
        <div
          onClick={() => clickTemplate(data.link)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100px',
            borderRadius: '2px',
            opacity: 1,
            background: 'white',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <img
            style={{
              objectFit: 'cover',
              width: '86px',
              height: '86px',
              marginLeft: '8px',
              marginTop: '7px',
            }}
            src={data.pic}
            alt=""
          />
        </div>
        <div
          style={{
            position: 'absolute',
            lineHeight: '20px',
            height: '40px',
            overflow: 'hidden',
            top: '14px',
            left: '110px',
            fontSize: '12px',
            color: '#3D3D3D',
            wordBreak: 'break-all',
          }}
        >
          {data.title}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '17px',
            left: '110px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#3D3D3D',
          }}
        >
          {data.price}
        </div>
      </div>
    );
  }
  return null;
}
