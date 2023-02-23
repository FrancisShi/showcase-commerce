import React from 'react';

export interface HtmlInterface {
  content: string;
}

export default function Html(props: HtmlInterface) {
  const {content} = props;

  return <div dangerouslySetInnerHTML={{__html: content}}></div>;
}
