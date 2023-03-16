import { Init, AvatarParams } from "@mindverse/avatar";
import React, { CSSProperties, useEffect } from "react";
export interface AvatarProps {
  model: string;
  style: CSSProperties;
}

export default function Avatar3D(props: AvatarProps) {
  const { model, style } = props;

  useEffect(() => {
    setTimeout(() => {
      const avatarContainer = document.getElementById("#avatarContainerNew");
      if (avatarContainer) {
        avatarContainer.style.transform = `scale(0.45, 0.45) translate(85%, 105%)`;
        new Init({
          model: model,
          defaultCanvasCssWidth: avatarContainer.clientWidth,
          defaultCanvasCssHeight: avatarContainer.clientHeight,
        });
      }
    }, 500);
  }, []);

  return (
    <>
      <div
        style={{
          right: `0px`,
          bottom: `0px`,
          position: `absolute`,
          width: "40%",
          height: "40%",
          zIndex: `50`,
          overflow: "hidden",
        }}
      >
        <div
          id="#avatarContainerNew"
          style={{
            width: "250%",
            height: `250%`,
            right: `0px`,
            bottom: `0px`,
            position: `absolute`,
            zIndex: `50`,
            // ...style,
          }}
        />
      </div>
    </>
  );
}
