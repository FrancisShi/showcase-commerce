import React, {useEffect, useState} from 'react';
import showdown from 'showdown';

const temp = `<div style="position: relative; width: 100%; height: 100px; border-radius:2px; opacity: 1; background: white; display:flex; flex-direction:row;">
<img
  style="object-fit: cover; width: 86px; height: 86px; margin-left: 8px; margin-top: 7px;"
  src="https://cdn.shopify.com/s/files/1/0724/4188/9082/products/screenshot-20230222-170516.png?v=1677056793"
  alt=""
/>
  <a href="https://showcase-commerce-049eb715bd4aa0080860.o2.myshopify.dev/products/vevelstad-bed-frame-white-180x200-cm">
    <div style="position: absolute;line-height:20px; height:40px; overflow:hidden; top:14px; left: 110px; font-size: 12px; color: #3D3D3D;">
      VEVELSTAD Bed frame, white, 180x200 cm131231231231312hellohellohellohellohello
    </div>
  </a>
<div style="position: absolute; bottom:17px; left: 110px; font-size: 16px; font-weight: bold; color: #3D3D3D;">
  1833.00
</div>
</div>`;

export interface MarkdownInterface {
  content: string;
}

export default function Markdown(props: MarkdownInterface) {
  const {content} = props;
  const [markdown, setMarkdown] = useState<string>(content);

  useEffect(() => {
    const converter = new showdown.Converter();
    const html = converter.makeHtml(content);
    setMarkdown(html);
    // 修复markdown html中，p标签自动加边距的情况
    setTimeout(() => {
      const pList = document.getElementsByTagName('p');
      if (pList && pList.length > 0) {
        for (let i = 0; i < pList.length; i++) {
          const ele = pList[i];
          if (ele.parentElement?.id === 'mv_markdown') {
            ele.style.margin = '0px';
          }
        }
      }
    }, 0);
  }, [content]);

  return (
    <div
      id={`mv_markdown`}
      style={{width: '100%'}}
      dangerouslySetInnerHTML={{__html: markdown}}
    ></div>
  );
}
