import React from 'react';
import {DevelopType, EVENT, getDevelopType} from '~/plugin';
interface WS_MSG_MULTIPLE_TEMPLATE {
  templateName: string;
  params: {
    price: string;
    link: string;
    pic: string;
    title: string;
  };
}
export interface TemplateInterface {
  content: string;
}

export default function Template(props: TemplateInterface) {
  const {content} = props;

  const clickTemplate = (link: string) => {
    if (getDevelopType() === DevelopType.SCRIPT) {
      window.open(link, '_blank');
    } else if (getDevelopType() === DevelopType.NPM) {
      const e = new Event(EVENT.EVENT_ROUTER);
      // @ts-ignore
      e.detail = link;
      window.dispatchEvent(e);

      // 关闭 avatar
      const event = new Event(EVENT.EVENT_AVATAR_CLOSE);
      window.dispatchEvent(event);
    }
  };

  const template = JSON.parse(content) as WS_MSG_MULTIPLE_TEMPLATE;
  if (!template) {
    return null;
  }

  if (template.templateName === 'shopifyCard') {
    const data = template.params;

    return (
      <div
        onClick={() => {
          clickTemplate(data.link);
        }}
        style={{
          marginBottom: '10px',
          marginTop: '10px',
          position: 'relative',
          cursor: 'pointer',
        }}
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
            marginRight: '10px',
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
