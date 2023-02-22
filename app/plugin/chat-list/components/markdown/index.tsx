import React, {useEffect, useState} from 'react';
import showdown from 'showdown';

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
      contentEditable="true"
      dangerouslySetInnerHTML={{__html: markdown}}
    ></div>
  );
}
