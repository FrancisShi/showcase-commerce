import React from 'react';
import Picture from './picture';

export interface ChatImgProps {
  className?: string;
  imgUrl: string;
}

export enum TYPE_AVATAR {
  PICTURE,
  THREE_D,
  LIVE_2D,
}

interface AvatarProps {
  type: TYPE_AVATAR;
  data: {
    picture: string;
  };
}

export default function Avatar(props: AvatarProps) {
  const {type, data} = props;

  if (type === TYPE_AVATAR.PICTURE) {
    return <Picture picture={data.picture}></Picture>;
  } else {
    return null;
  }
}
