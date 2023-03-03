import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface UserInputProps {}

export default forwardRef<HTMLDivElement, UserInputProps>(
  (props: UserInputProps, ref) => {
    return (
      <div
        style={{
          height: '100%',
          paddingTop: '8px',
          overflow: 'scroll',
          marginLeft: '16px',
          marginRight: '16px',
        }}
        ref={ref}
      >
        userContent
      </div>
    );
  },
);
