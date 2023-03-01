import React, {CSSProperties, useEffect} from 'react';

export default function Loading({style}: {style: CSSProperties}) {
  useEffect(() => {
    let dynamicStyles: HTMLStyleElement | null = null;
    function addAnimation(body: string) {
      if (!dynamicStyles) {
        dynamicStyles = document.createElement('style');
        dynamicStyles.type = 'text/css';
        document.head.appendChild(dynamicStyles);
      }
      dynamicStyles.sheet?.insertRule(body);
    }

    addAnimation(`
    @keyframes circle{
      0%{
          top:25px;
          height:5px;
          border-radius: 50px 50px 25px 25px;
          transform: scaleX(1.5);
      }
      40%{
          height:10px;
          border-radius: 50%;
          transform: scaleX(1);
      }
      100%{
          top:15px;
      }
  }
  `);
  }, []);
  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '70px',
        height: '44px',
        width: '90px',
        borderRadius: '14px',
        padding: '12px',
        fontSize: '15px',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: '#fff',
          left: '20%',
          transformOrigin: '50%',
          animation: 'circle .5s alternate infinite ease',
        }}
      />
      <div
        style={{
          width: '8px',
          height: '8px',
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: '#fff',
          left: '45%',
          transformOrigin: '50%',
          animation: 'circle .5s alternate infinite ease',
          animationDelay: '.2s',
        }}
      />
      <div
        style={{
          width: '8px',
          height: '8px',
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: '#fff',
          left: '75%',
          transformOrigin: '50%',
          animation: 'circle .5s alternate infinite ease',
          animationDelay: '.3s',
        }}
      />
    </div>
  );
}
