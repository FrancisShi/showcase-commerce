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
      className={`whitespace-normal break-words box-border rounded py-1 px-3 text-sm font-normal max-w-40 text-black ${className}`}
    >
      {content}
    </div>
  );
}
