import React from 'react';
export interface ChatTextProps {
  className?: string;
  content: string;
  sources?: string[];
}

export default function ChatText(props: ChatTextProps) {
  const {content, className, sources} = props;

  return (
    <div
      className={`whitespace-normal break-all box-border rounded py-1 px-2 text-xs font-normal text-black ${className}`}
    >
      {content}
    </div>
  );
}
