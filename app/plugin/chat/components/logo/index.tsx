import React from 'react';

export interface LogoProps {}

export default function Logo(props: LogoProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '84px',
        left: '20px',
      }}
    >
      <a
        style={{display: 'flex', flexDirection: 'row', alignItems: 'baseline'}}
        href="https://mindos.mindverse.ai"
        target="_blank"
        rel="noreferrer"
      >
        <div
          style={{
            fontSize: '9px',
            color: '#FFFFFF',
          }}
        >
          Powered by
        </div>

        <img
          style={{
            width: '50px',
            height: '11px',
            marginLeft: '4px',
          }}
          src="https://cdn.mindverse.com/img/zzzz202303141678776165922%E7%BB%84%20%281%29.png"
          alt=""
        />
      </a>
    </div>
  );
}
