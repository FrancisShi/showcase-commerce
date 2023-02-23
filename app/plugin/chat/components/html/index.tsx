import React from 'react';

export interface MarkdownInterface {
  content: string;
}

export default function Markdown(props: MarkdownInterface) {
  const {content} = props;

  return (
    <div
      contentEditable="true"
      dangerouslySetInnerHTML={{__html: content}}
    ></div>
  );
}
