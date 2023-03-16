import React, { CSSProperties } from "react";
import Picture from "./picture";
import Avatar3D from "./threeD";

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
  data: {
    picture: string;
    model: string;
  };
  style: CSSProperties;
}

export default function Avatar(props: AvatarProps) {
  const { data, style } = props;

  if (data.model) {
    return <Avatar3D style={style} model={data.model} />;
  } else if (data.picture) {
    return <Picture style={style} picture={data.picture} />;
  } else {
    return null
  }
}
