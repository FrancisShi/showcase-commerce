import React, { useEffect, useState, useRef } from "react";
import { marked } from "marked";
export interface MarkdownInterface {
  content: string;
}

export default function Markdown(props: MarkdownInterface) {
  const { content } = props;
  const [markdown, setMarkdown] = useState<string>(content);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const test = `Based on my search, I would recommend the following three beds:

1. ZTOZZ Pezzolla-D LED Bed Queen Size with 4 Drawers - Low Profile Platform Bed with 16 Colors LED Lights Headboard and Footboard, priced at $100. This bed is perfect for those who want a modern and stylish bed with LED lights and storage drawers.

2. Ipormis King Size Bed Frame with Aesthetic Wingback, Upholstered Platform Bed with Diamond Tufting Headboard, priced at $263.99. This bed is perfect for those who want a luxurious and elegant bed with a diamond tufting headboard. 
    
3. Allewie Full Size Metal Platform Bed Frame with Victorian Style Wrought Iron-Art Headboard/Footboard, No Box Spring Needed, priced at $99.99{"link":"https://showcase-commerce-049eb715bd4aa0080860.o2.myshopify.dev/products/allewie-full-size-metal-platform-bed-frame-with-victorian-style-wrought-iron-art-headboard-footboard-no-bo","citationId":"3","pic":"https://cdn.shopify.com/s/files/1/0724/4188/9082/products/91s3WLQaJWL._AC_UL320.jpg?v=1678594927","id":"8191296307514","title":"allewie full size metal platform bed frame with victorian style wrought iron-art headboard/footboard, no bo..."}`;

    const test1 = `Hi ack, long time no see. I see here that you bought an ASUS HW2500 all-in-one machine from us. Its graphics card is RTX3090. If you play StarCraft 2, {"citationId": "1", "link": "http://www.baidu.com"}
  there is indeed an overload risk.ong time no see. I see here that you bought an ASUS HW2500 all-in-one. {"citationId": "2", "link": "http://www.taobao.com"} machine from us. Its graphics card is RTX3090.`;

    const parseCitation = (content: string) => {
      let newContent = content
      let result = "";
      const regex = /\{.*?\}/g;
      // 抽取 原点数据
      const matches = newContent.match(regex);
      if (matches) {
        let replacedMessage = newContent.replace(
          /\{(.*?)\}/g,
          "---CITATION_PLACEHOLDER---"
        );
        let matchesIndex = 0;
        let arr = replacedMessage.split(/(---CITATION_PLACEHOLDER---)/);

        arr.map((arrItem: string) => {
          if (arrItem) {
            if (arrItem === "---CITATION_PLACEHOLDER---") {
              const jsonStr = matches[matchesIndex];
              if (jsonStr) {
                const jsonObj = JSON.parse(jsonStr);
                if (jsonObj.citationId && jsonObj.link) {
                  result += `<a href=${jsonObj.link} target="_bank" style="cursor:pointer; display:inline-block; text-align:center; vertical-align:text-top; width:15px; height:15px; font-size:10px; background-color:#6FA293; color:white; border-radius:50%" >${jsonObj.citationId}</a>`;
                }
              }
              matchesIndex++;
            } else {
              result += arrItem;
            }
          }
        });
      }
      
      if (!result) {
        return newContent;
      }
      return result;
    };

    const html = marked.parse(parseCitation(content));

    setMarkdown(html);
    // 修复markdown html中，p标签自动加边距的情况
    setTimeout(() => {
      const container = containerRef.current;
      const pList = container?.getElementsByTagName("p");
      if (pList && pList.length > 0) {
        for (let i = 0; i < pList.length; i++) {
          const ele = pList[i];
          if (ele.parentElement?.id === "mv_markdown") {
            // 处理 p
            ele.style.margin = "0px";
            // ele.style.display = "inline";
            // 处理 img
            const children = ele.getElementsByTagName("img");
            if (children && children.length > 0) {
              for (let i = 0; i < children.length; i++) {
                children[i].style.maxWidth = "100%";
              }
            }
          }
        }
      }

      const codes = container?.getElementsByTagName("code");
      if (codes && codes.length > 0) {
        for (let i = 0; i < codes.length; i++) {
          const ele = codes[i];
          ele.style.setProperty("white-space", "pre-wrap", "important");
        }
      }

      const handleList = (list: HTMLCollectionOf<any>, style: string) => {
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            const ele = list[i];
            // 处理 ul
            ele.style.listStyleType = style ?? "disc";
            ele.style.paddingLeft = "16px";
            ele.style.marginTop = "16px";
            ele.style.marginBottom = "16px";
          }
        }
      };
      if (container) {
        const ulList = container.getElementsByTagName("ul");
        handleList(ulList, "disc");
        const olList = container.getElementsByTagName("ol");
        handleList(olList, "decimal");
      }
    }, 0);
  }, [content]);

  return (
    <div
      ref={containerRef}
      id={`mv_markdown`}
      style={{ width: "100%", overflowX: "hidden" }}
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
}
