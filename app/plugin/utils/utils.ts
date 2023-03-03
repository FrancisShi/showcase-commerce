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
