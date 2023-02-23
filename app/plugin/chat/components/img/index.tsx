import React from 'react';
export interface ChatImgProps {
  className?: string;
  imgUrl: string;
}

export default function ChatImg(props: ChatImgProps) {
  const {className, imgUrl} = props;
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a className={`h-15 overflow-hidden rounded ${className}`}>
      <img src={imgUrl} className={'h-full'} alt="" />
    </a>
  );
}
