/**
 * 把毫秒数转换成 分钟：秒，秒数2位补齐
 * @param {Number} time 毫秒
 */
export function formatTime(time: number): string {
  time /= 1000;
  const minute = Math.floor(time / 60);
  const second = Math.floor(time - minute * 60);
  return second > 9 ? `${minute}:${second}` : `${minute}:0${second}`;
}
/**
 * 把毫秒数转换成 年-月-日
 * @param {Number} milliseconds 代表日期的毫秒数
 */
export function formatDate(milliseconds: number): string {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
/**
 * 把毫秒数转换成 年-月-日 小时：分钟
 * @param {Number} milliseconds 代表日期的毫秒数
 */
export function formatDay(milliseconds: number): string {
  const date = new Date(milliseconds);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}
/**
 * 优化过的resize事件
 */
export function optimizedResize() {
  const throttle = function(
    type: string,
    name: string,
    obj: EventTarget
  ): void {
    obj = obj || window;
    let running = false;
    const func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle("resize", "optimizedResize", window);
}
/**
 *
 * @param {} target
 * @param {*} type
 * @param {*} listener
 * @param {*} addOptions
 * @param {*} removeOptions
 */
export function addEventListenerOnce(
  target: HTMLElement,
  type: string,
  listener: () => any,
  addOptions?: object,
  removeOptions?: object
) {
  target.addEventListener(type, function fn() {
    target.removeEventListener(type, fn, removeOptions);
    listener.apply(null);
  });
}
export function clipImage(
  imgUrl: string,
  width: number,
  height: number
): string {
  return `${imgUrl}?param=${width}y${height}`;
}
/**
 * format count to 万， 百万， 千万， 亿， 十亿
 * @param {Number} number The number to format
 */
export function formatCount(number: number): string {
  const n = Number(number);
  if (n < Math.pow(10, 4)) {
    return String(n);
  }
  if (n < Math.pow(10, 6)) {
    return `${(n / Math.pow(10, 4)).toFixed(2)}万`;
  }
  if (n < Math.pow(10, 7)) {
    return `${(n / Math.pow(10, 6)).toFixed(2)}百万`;
  }
  if (n < Math.pow(10, 8)) {
    return `${(n / Math.pow(10, 7)).toFixed(2)}千万`;
  }
  if (n < Math.pow(10, 9)) {
    return `${(n / Math.pow(10, 8)).toFixed(2)}亿`;
  }
  if (n < Math.pow(10, 10)) {
    return `${(n / Math.pow(10, 9)).toFixed(2)}十亿`;
  }
  if (n < Math.pow(10, 11)) {
    return `${(n / Math.pow(10, 10)).toFixed(2)}百亿`;
  }
  if (n < Math.pow(10, 12)) {
    return `${(n / Math.pow(10, 11)).toFixed(2)}千亿`;
  }
  return String(n);
}
/**
 * less than 1 minute, x秒钟以前
 * less than 1 hour, x分钟以前
 * less than 1 day, x小时以前
 * less than 1 month, x天以前
 * less than 1 year, x个月以前
 * else, x年以前
 * @param {Number} milliseconds milliseconds presents date time since January 1, 1970 00:00:00 UTC
 */
export function formatDateToBefore(milliseconds: number): string {
  const now = Date.now();
  const delta = now - milliseconds;
  if (delta < 0) {
    return formatDay(milliseconds);
  }
  const oneSecond = 1000;
  const oneMin = oneSecond * 60;
  const oneHour = oneMin * 60;
  const oneDay = oneHour * 12;
  const oneMonth = oneDay * 30;
  const oneYear = oneMonth * 12;

  const map = [oneYear, oneMonth, oneDay, oneHour, oneMin, oneSecond];
  const a = [
    "年以前",
    "个月以前",
    "天以前",
    "小时以前",
    "分钟以前",
    "秒钟以前",
    "刚刚"
  ];
  for (let i = 0; i < map.length; i++) {
    if (delta >= map[i]) {
      return Math.round(delta / map[i]) + a[i];
    }
  }
  return a[a.length - 1];
}
/**
 *  arrayJoin([a, b, c, d, e], x), return [a, x, b, x, c, x, d, x, e]
 */
export function arrayJoin(array: any[], obj: any) {
  if (!array || array.length == 0) return [];
  const ret = [array[0]];
  for (let i = 1; i < array.length; i++) {
    ret.push(obj);
    ret.push(array[i]);
  }
  return ret;
}
/**
 * download file
 * @param{String} url, file url
 * @param{String} filename, filename
 */
export function downloadFile(url: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(url).then(
      res =>
        res.blob().then(
          blob => {
            const a = document.createElement("a");
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            resolve();
          },
          error => reject(error)
        ),
      error => reject(error)
    );
  });
}
export function withIn(item: Element, container: Element) {
  return container === item || (container && container.contains(item));
}
export function isUndef(val: any) {
  return typeof val === "undefined" || val === null;
}
/**
 * Check wheter the element is in viewport, user can see it.
 * @param el The el to check.
 *
 */
export function isElementInViewPort(el: Element): boolean {
  if (isUndef(el)) {
    return false;
  }
  const { left, top, width, height } = el.getBoundingClientRect();
  return (
    (left >= 0 &&
      top >= 0 &&
      left <= (window.innerWidth || document.documentElement.clientWidth) &&
      top <= (window.innerHeight || document.documentElement.clientHeight)) ||
    (left + width >= 0 &&
      top + height >= 0 &&
      left + width <=
        (window.innerWidth || document.documentElement.clientWidth) &&
      top + height <=
        (window.innerHeight || document.documentElement.clientHeight))
  );
}

export interface QFSElement extends Element {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
}
/**
 * Toggle the element to fullscreen or exit fullscreen
 * @param el The element to toogleFullScreen
 */
export function toggleFullScreen(el: QFSElement) {
  const exitFullscreen =
    document.exitFullscreen ||
    document.msExitFullscreen ||
    document.mozExitFullscreen ||
    document.webkitExitFullscreen;
  const requestFullScreen =
    el.requestFullscreen ||
    el.msRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.webkitRequestFullscreen;
  const isFullScreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (isFullScreen) {
    exitFullscreen.call(document);
  } else {
    requestFullScreen.call(el);
  }
}
// ele.addEventListener('click', throttleFn(handleClick, 20));
export function throttleFn(
  fn: (args?: any) => any,
  time: number
): (arg?: any) => any {
  let start: number;
  return function(args?: any) {
    const now = performance.now();
    if (start === undefined || now >= start + time) {
      start = now;
      return fn(args);
    } else {
      return () => {};
    }
  };
}
export function debounceTime(
  fn: (args?: any) => any,
  time: number
): (arg?: any) => any {
  let last: number;
  let timerId: number;
  return function(args?: any) {
    const now = performance.now();
    if (last && timerId && now - last < time) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(args);
    }, time);
    last = now;
  };
}

export function createImage(
  width: number,
  height: number,
  color: string = "rgba(0, 0, 0, 0)"
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  const src = canvas.toDataURL();
  return src;
}
