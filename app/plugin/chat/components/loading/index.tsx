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
          top:28px;
          height:5px;
          border-radius: 50px 50px 25px 25px;
          transform: scaleX(1.5);
      }
      40%{
          height:6px;
          border-radius: 50%;
          transform: scaleX(1);
      }
      100%{
          top:15px;
      }
  }
  `);

    addAnimation(`
      @keyframes shadow{
        0%{
            transform: scaleX(1.5);
        }
        40%{
            transform: scaleX(1);
            opacity: .7;
        }
        100%{
            transform: scaleX(.2);
            opacity: .4;
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
          width: '6px',
          height: '6px',
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: '#fff',
          left: '30%',
          zIndex: 5,
          transformOrigin: '50%',
          animation: 'circle .5s alternate infinite ease',
        }}
      />
      <div
        style={{
          width: '6px',
          height: '6px',
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: '#fff',
          left: '48%',
          zIndex: 5,
          transformOrigin: '50%',
          animation: 'circle .5s alternate infinite ease',
          animationDelay: '.2s',
        }}
      />
      <div
        style={{
          width: '6px',
          height: '6px',
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: '#fff',
          left: '66%',
          zIndex: 5,
          transformOrigin: '50%',
          animation: 'circle .5s alternate infinite ease',
          animationDelay: '.3s',
        }}
      />

      {/* shadow */}
      <div
        style={{
          width: '6px',
          height: '3px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,.5)',
          position: 'absolute',
          top: '31px',
          transformOrigin: '50%',
          zIndex: 1,
          left: '30%',
          filter: `blur(1px)`,
          animation: `shadow .5s alternate infinite ease`,
        }}
      />

      <div
        style={{
          width: '6px',
          height: '3px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,.5)',
          position: 'absolute',
          top: '31px',
          transformOrigin: '50%',
          zIndex: 1,
          left: '48%',
          filter: `blur(1px)`,
          animation: `shadow .5s alternate infinite ease`,
          animationDelay: '.2s',
        }}
      />

      <div
        style={{
          width: '6px',
          height: '3px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,.5)',
          position: 'absolute',
          top: '31px',
          transformOrigin: '50%',
          zIndex: 1,
          left: '66%',
          filter: `blur(1px)`,
          animation: `shadow .5s alternate infinite ease`,
          animationDelay: '.3s',
        }}
      />
    </div>
  );
}
