export function collapse(
  idMain: string,
  idSub: string,
  height: number,
  stateCb: () => void,
) {
  const ANIM_TIME = 300;
  const ANIM_TIME_ALPHA = 100;

  const main = document.getElementById(idMain);
  if (main) {
    main.animate([{bottom: `${0}px`}, {bottom: `-${height}px`}], {
      duration: ANIM_TIME,
      fill: 'forwards',
    });
    setTimeout(() => {
      stateCb && stateCb();
      const sub = document.getElementById(idSub);
      if (sub) {
        sub.animate([{opacity: 0}, {opacity: 1}], {
          duration: ANIM_TIME_ALPHA,
          fill: 'forwards',
        });
      }
    }, ANIM_TIME);
  }
}

export function expand(
  idMain: string,
  idSub: string,
  height: number,
  stateCb: () => void,
) {
  const ANIM_TIME = 300;
  const ANIM_TIME_ALPHA = 100;
  const sub = document.getElementById(idSub);
  if (sub) {
    sub.animate([{opacity: 1}, {opacity: 0}], {
      duration: ANIM_TIME_ALPHA,
      fill: 'forwards',
    });
  }
  setTimeout(() => {
    stateCb && stateCb();
    const main = document.getElementById(idMain);
    if (main) {
      main.animate([{bottom: `-${height}px`}, {bottom: `${0}px`}], {
        duration: ANIM_TIME,
        fill: 'forwards',
      });
    }
  }, ANIM_TIME_ALPHA);
}

export function showMenu(menuId: string, width: number, stateCb: () => void) {
  const ANIM_TIME = 300;
  const menu = document.getElementById(menuId);
  if (menu) {
    stateCb && stateCb();
    menu.animate(
      [{transform: `translateX(${width}px)`}, {transform: 'translateX(0px)'}],
      {
        duration: ANIM_TIME,
        fill: 'forwards',
      },
    );
  }
}

export function hideMenu(menuId: string, width: number, stateCb: () => void) {
  const ANIM_TIME = 300;
  const menu = document.getElementById(menuId);
  if (menu) {
    menu.animate(
      [{transform: 'translateX(0px)'}, {transform: `translateX(${width}px)`}],
      {
        duration: ANIM_TIME,
        fill: 'forwards',
      },
    );
    setTimeout(() => {
      stateCb && stateCb();
    }, ANIM_TIME);
  }
}
