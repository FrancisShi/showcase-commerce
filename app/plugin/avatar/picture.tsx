import React from 'react';
import {getColorBgDark, getColorBgLight} from '../app';

export interface PictureProps {
  picture: string;
}

export default function ChatImg(props: PictureProps) {
  const {picture} = props;
  return (
    <img
      style={{
        position: 'absolute',
        objectFit: 'cover',
        left: '16px',
        top: '-40px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        borderColor: getColorBgDark(),
        backgroundColor: getColorBgLight(),
        borderWidth: '3px',
      }}
      src={picture}
      alt=""
    />
  );
}
