import { AVATAR_EVENT, AVATAR_ACTIONS } from "@mindverse/avatar";

const checkPlayAction = (msg: any) => {
  // @ts-ignore
  if (msg?.indexOf) {
    if (
      msg?.indexOf("dance") > -1 ||
      msg?.indexOf("poping") > -1 ||
      msg?.indexOf("dancing") > -1
    ) {
      const event = new Event(AVATAR_EVENT.SHOW_ACTION);
      // @ts-ignore
      event.detail = AVATAR_ACTIONS.DANCE;
      dispatchEvent(event);
      return true;
    } else if (msg?.indexOf("happy") > -1 || msg?.indexOf("joyful") > -1) {
      const event = new Event(AVATAR_EVENT.SHOW_ACTION);
      // @ts-ignore
      event.detail = AVATAR_ACTIONS.LAUGHING;
      dispatchEvent(event);
      return true;
    } else if (
      msg?.indexOf("sad") > -1 ||
      msg?.indexOf("unhappy") > -1 ||
      msg?.indexOf("grieved") > -1 ||
      msg?.indexOf("pain") > -1
    ) {
      const event = new Event(AVATAR_EVENT.SHOW_ACTION);
      // @ts-ignore
      event.detail = AVATAR_ACTIONS.CRYING;
      dispatchEvent(event);
      return true;
    } else if (msg?.indexOf("start drawing") > -1) {
      const event = new Event(AVATAR_EVENT.SHOW_ACTION);
      // @ts-ignore
      event.detail = AVATAR_ACTIONS.PAINTING;
      dispatchEvent(event);
      return true;
    }
  }
  return false;
};

export { checkPlayAction };
