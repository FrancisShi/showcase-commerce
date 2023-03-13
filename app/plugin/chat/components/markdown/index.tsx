import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
export interface MarkdownInterface {
  content: string;
}

export default function Markdown(props: MarkdownInterface) {
  const { content } = props;
  const [markdown, setMarkdown] = useState<string>(content);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = marked.parse(content);
    setMarkdown(html);
    // 修复markdown html中，p标签自动加边距的情况
    setTimeout(() => {
      const container = containerRef.current;
      const pList = container?.getElementsByTagName('p');
      if (pList && pList.length > 0) {
        for (let i = 0; i < pList.length; i++) {
          const ele = pList[i];
          if (ele.parentElement?.id === 'mv_markdown') {
            // 处理 p
            ele.style.margin = '0px';
            // 处理 img
            const children = ele.getElementsByTagName('img');
            if (children && children.length > 0) {
              for (let i = 0; i < children.length; i++) {
                children[i].style.maxWidth = '100%';
              }
            }
          }
        }
      }

      const codes = container?.getElementsByTagName('code');
      if (codes && codes.length > 0) {
        for (let i = 0; i < codes.length; i++) {
          const ele = codes[i];
          ele.style.setProperty('white-space', 'pre-wrap', 'important');
        }
      }

      const handleList = (list: HTMLCollectionOf<any>, style: string) => {
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            const ele = list[i];
            // 处理 ul
            ele.style.listStyleType = style ?? 'disc';
            ele.style.paddingLeft = '16px';
            ele.style.marginTop = '16px';
            ele.style.marginBottom = '16px';
          }
        }
      };
      if (container) {
        const ulList = container.getElementsByTagName('ul');
        handleList(ulList, 'disc');
        const olList = container.getElementsByTagName('ol');
        handleList(olList, 'decimal');
      }
    }, 0);
  }, [content]);

  return (
    <div
      ref={containerRef}
      id={`mv_markdown`}
      style={{ width: '100%', overflowX: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
}