import React, { useMemo } from "react";

export interface CitationProps {
  content: string;
}

interface CITATION_ITEM {
  type: "normalText" | "highlightText" | "citation";
  content: string;
  link?: string;
}

export default function Citation(props: CitationProps) {
  const { content } = props;

  `Hi ack, long time no see. I see here that you bought an ASUS HW2500 all-in-one machine from us. Its graphics card is RTX3090. If you play StarCraft 2, {"citationId": "1", "link": "http://www.baidu.com"}
  there is indeed an overload risk.ong time no see. I see here that you bought an ASUS HW2500 all-in-one. {"citationId": "2", "link": "http://www.taobao.com"} machine from us. Its graphics card is RTX3090.`;

  const citationResult = useMemo(() => {
    let result: CITATION_ITEM[] = [];
    const regex = /\{.*?\}/g;
    // 抽取 原点数据
    const matches = content.match(regex);
    if (matches) {
      let replacedMessage = content.replace(
        /\{(.*?)\}/g,
        "---CITATION_PLACEHOLDER---"
      );
      replacedMessage = replacedMessage.replace(/\n/g, "");
      let matchesIndex = 0;
      let arr = replacedMessage.split(/(---CITATION_PLACEHOLDER---)/);
      let tempResult: CITATION_ITEM[] = [];
      arr.map((arrItem: string) => {
        if (arrItem === "---CITATION_PLACEHOLDER---") {
          const jsonStr = matches[matchesIndex];
          if (jsonStr) {
            const jsonObj = JSON.parse(jsonStr);
            if (jsonObj.citationId && jsonObj.link) {
              tempResult.push({
                type: "citation",
                content: jsonObj.citationId ?? "",
                link: jsonObj.link ?? "",
              });
            }
          }
          matchesIndex++;
        } else {
          tempResult.push({
            type: "normalText",
            content: arrItem,
          });
        }
      });

      let lastCitation = null;
      for (let i = tempResult.length - 1; i >= 0; i--) {
        if (tempResult[i].type === "citation") {
          result.push(tempResult[i]);
          lastCitation = tempResult[i];
        } else {
          if (tempResult[i].type === "normalText" && lastCitation) {
            let text = tempResult[i].content.trim();
            let lastChart = "";
            if (
              text[text.length - 1] === "." ||
              text[text.length - 1] === "。"
            ) {
              lastChart = text[text.length - 1];
              text = text.substring(0, text.length - 1);
            }
            // 处理当前下划线
            const lastDot = Math.max(
              text.lastIndexOf("."),
              text.lastIndexOf("。")
            );
            if (lastDot > -1) {
              const part1 = text.substring(0, lastDot + 1);
              const part2 = text.substring(lastDot + 1);
              result.push({
                type: "highlightText",
                content: part2 + lastChart,
                link: lastCitation.link,
              });
              result.push({
                type: "normalText",
                content: part1,
              });
            } else {
              result.push(tempResult[i]);
            }
          }
          lastCitation = null;
        }
      }
      return result.reverse();
    }
    return result;
  }, [content]);

  const testData: CITATION_ITEM[] = [
    {
      type: "normalText",
      content:
        "Hi ack, long time no see. I see here that you bought an ASUS HW2500 all-in-one machine from us. Its graphics card is RTX3090.",
    },
    {
      type: "highlightText",
      content: "If you play StarCraft 2,",
      link: "http://www.baidu.com",
    },
    {
      type: "citation",
      content: "1",
      link: "http://www.baidu.com",
    },

    {
      type: "normalText",
      content: "there is indeed an overload risk.ong time no see. ",
    },
    {
      type: "highlightText",
      content: "I see here that you bought an ASUS HW2500 all-in-one. ",
      link: "http://www.taobao.com",
    },
    {
      type: "citation",
      content: "2",
      link: "http://www.taobao.com",
    },
  ];

  return (
    <div>
      {citationResult.map((textItem: CITATION_ITEM) => {
        if (textItem.type === "normalText") {
          return (
            <span style={{ fontSize: 14, color: "#FFFFFF" }}>
              {textItem.content}
            </span>
          );
        } else if (textItem.type === "highlightText") {
          return (
            <span
              style={{
                borderBottom: "2px solid #6FA293",
                textDecoration: "none",
              }}
              onMouseOver={() => {}}
            >
              {textItem.content}
            </span>
          );
        } else if (textItem.type === "citation") {
          return (
            <span
              className="citation"
              style={{
                display: "inline-block",
                textAlign: "center",
                verticalAlign: "text-top",
                width: "15px",
                height: "15px",
                fontSize: "10px",
                backgroundColor: "#6FA293",
                color: "white",
                borderRadius: "50%",
              }}
              alt={`${JSON.stringify(textItem)}`}
            >
              {textItem.content}
            </span>
          );
        }
      })}
    </div>
  );
}
