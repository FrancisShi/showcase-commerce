import React from 'react';
import Markdown from '../../../markdown';

export interface ChatTextProps {
  className?: string;
  content: string;
  sources?: string[];
}

export default function ChatText(props: ChatTextProps) {
  const {content, sources} = props;

  return (
    <div
      style={{
        whiteSpace: 'normal',
        wordBreak: 'break-all',
        boxSizing: 'border-box',
        borderRadius: '4px',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '4px',
        paddingBottom: '4px',
        fontSize: '14px',
        color: 'black',
        borderStyle: 'solid',
        borderWidth: '2px',
        borderColor: '#333333',
      }}
    >
      {/* {content} */}
      <Markdown content={content}></Markdown>
    </div>
  );
}
