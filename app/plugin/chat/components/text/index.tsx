import React from "react";
import Markdown from "../markdown";

export interface ChatTextProps {
  className?: string;
  content: string;
  sources?: string[];
}

export default function ChatText(props: ChatTextProps) {
  const { content, sources } = props;

  return <Markdown content={content}></Markdown>;
}
