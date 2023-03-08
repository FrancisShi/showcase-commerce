export function browserType() {
  const sUserAgent = navigator.userAgent.toLowerCase(); //浏览器的用户代理设置为小写，再进行匹配
  const isIpad = sUserAgent.match(/ipad/i)?.[0] == 'ipad'; //或者利用indexOf方法来匹配
  const isIphoneOs = sUserAgent.match(/iphone os/i)?.[0] == 'iphone os';
  const isMidp = sUserAgent.match(/midp/i)?.[0] == 'midp'; //移动信息设备描述MIDP是一套Java应用编程接口，多适用于塞班系统
  const isUc7 = sUserAgent.match(/rv:1.2.3.4/i)?.[0] == 'rv:1.2.3.4'; //CVS标签
  const isUc = sUserAgent.match(/ucweb/i)?.[0] == 'ucweb';
  const isAndroid = sUserAgent.match(/android/i)?.[0] == 'android';
  const isCe = sUserAgent.match(/windows ce/i)?.[0] == 'windows ce';
  const isWM = sUserAgent.match(/windows mobil/i)?.[0] == 'windows mobil';

  if (
    isIpad ||
    isIphoneOs ||
    isMidp ||
    isUc7 ||
    isUc ||
    isAndroid ||
    isCe ||
    isWM
  ) {
    return 'mob';
  } else {
    return 'pc';
  }
}

export function showToast(content: string) {
  const ANIM_TIME = 200;
  const TOAST_TIME = 2000;
  const container = document.getElementById('mvMindContainer');
  const toastContainer = document.createElement('div');
  if (container && toastContainer) {
    toastContainer.id = 'mvToast';
    toastContainer.style.fontSize = '14px';
    toastContainer.style.color = '#FFFFFF';
    toastContainer.style.display = 'inherit';
    toastContainer.style.height = '38px';
    toastContainer.style.borderRadius = '10px';
    toastContainer.style.background = 'rgba(52, 52, 52, 0.8)';
    toastContainer.style.paddingLeft = '22px';
    toastContainer.style.paddingRight = '22px';
    toastContainer.style.paddingTop = '10px';
    toastContainer.style.paddingBottom = '10px';
    toastContainer.style.position = 'absolute';
    toastContainer.style.top = '50%';
    toastContainer.style.left = '50%';
    toastContainer.style.transform = `translate(-50%, -50%)`;
    toastContainer.style.maxWidth = '50%';
    toastContainer.style.whiteSpace = 'nowrap';
    toastContainer.style.textOverflow = 'ellipsis';
    toastContainer.style.overflow = 'hidden';
    toastContainer.style.zIndex = '1000';
    toastContainer.style.opacity = '0';

    toastContainer.innerText = content;
    container.appendChild(toastContainer);

    toastContainer.animate([{opacity: 0}, {opacity: 1}], {
      duration: ANIM_TIME,
      fill: 'forwards',
    });
    setTimeout(() => {
      toastContainer.animate([{opacity: 1}, {opacity: 0}], {
        duration: ANIM_TIME,
        fill: 'forwards',
      });
      setTimeout(() => {
        container.removeChild(toastContainer);
      }, ANIM_TIME);
    }, TOAST_TIME);
  }
}
