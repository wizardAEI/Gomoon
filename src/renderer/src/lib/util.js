// 消息中心 （发布订阅）
// eslint-disable-next-line @typescript-eslint/ban-types
const Events = new Map();
export const event = {
    on(event, callback) {
        if (!Events.has(event)) {
            Events.set(event, new Set());
        }
        Events.get(event).add(callback);
    },
    off(event, callback) {
        if (Events.has(event)) {
            Events.get(event).delete(callback);
        }
    },
    emit(event, ...args) {
        if (Events.has(event)) {
            for (const callback of Events.get(event)) {
                callback(...args);
            }
        }
    }
};
export const getSystem = () => {
    const ua = navigator.userAgent;
    if (ua.match(/windows/i)) {
        return 'win';
    }
    if (ua.match(/mac/i)) {
        return 'mac';
    }
    return 'linux';
};
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (err) {
        return false;
    }
};
export const getRandomString = (len) => {
    const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < len; i++) {
        result += str[Math.floor(Math.random() * str.length)];
    }
    return result;
};
