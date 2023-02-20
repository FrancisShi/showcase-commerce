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
  }, [content]);

  return (
    <div
      contentEditable="true"
      dangerouslySetInnerHTML={{__html: markdown}}
    ></div>
  );
}
