import React, {CSSProperties} from 'react';
export interface PictureProps {
  style: CSSProperties;
  picture: string;
}

export default function AvatarPicture(props: PictureProps) {
  const {picture, style} = props;
  return (
    <img
      style={{
        objectFit: 'cover',
        ...style,
      }}
      src={picture}
      alt=""
    />
  );
}
