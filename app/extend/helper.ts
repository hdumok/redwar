import * as crypto from 'crypto';
import * as moment from 'moment';

export default {

  Decimal (num: number): number {
    return parseFloat(Number(num).toFixed(2));
  },

  getDate (time: number | string = Date.now()): string {
    return moment(new Date(time)).format('GGGG-MM-DD');
  },

  getDateTime (time: number | string = Date.now()): string {
    return moment(new Date(time)).format('GGGG-MM-DD HH:mm:ss');
  },

  getDayStart (time: number | string = Date.now()): number {
    return new Date(time).setHours(0, 0, 0, 0);
  },

  getDayEnd (time: number | string = Date.now()): number {
    return new Date(new Date(time).getTime() + 24 * 3600 * 1000).setHours(
      0,
      0,
      0,
      0
    );
  },

  getDayRang (time: number | string = Date.now()): any {
    return {
      $gte: new Date(time).setHours(0, 0, 0, 0),
      $lte: new Date(new Date(time).getTime() + 24 * 3600 * 1000).setHours(
        0,
        0,
        0,
        0
      )
    };
  },

  thisMonth (): number {
    return new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);
  },

  lastMonth (): number {
    return new Date(
      new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(1)
    ).setHours(0, 0, 0, 0);
  },

  getNoceStr (length): string {
    let chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let maxPos = chars.length;
    let noceStr = '';
    for (let i = 0; i < (length || 32); i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
  },

  getRandom (n = 0): string {
    let num = '';
    for (let i = 0; i < n; i++) {
      num += Math.floor(Math.random() * 10);
    }
    return num;
  },

  getDuration (started, finished = Date.now()): number {
    return (new Date(finished).getTime() - new Date(started).getTime()) / 1000;
  },

  getOrderId (id = 0): string {
    return moment().format('GGMMDDHHmmss') + this.getRandom(3);
  },

  getUid (id: number): number {
    return id + 124800;
  },
  md5 (str: string): string {
    return crypto.createHash('md5').update(str + '').digest('hex');
  },

  parseObj (value, defaultValue = {}): any {
    if (!value || value === '{}') {
      return defaultValue;
    }

    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        this.logger.warn('parseObj error, ', value, e);
        value = defaultValue;
      }
    }

    if (typeof value !== 'object') {
      this.logger.warn('parseObj warning, value:', value);
      value = defaultValue;
    }

    return value;
  },

  stringifyObj (value, defaultValue = {}): string {
    if (!value) {
      value = defaultValue;
    }

    //如果传过来就字符串，可能被序列化过了，也可能有问题
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
        if (typeof value !== 'object') throw value;
      } catch (e) {
        this.logger.warn('stringifyObj error, ', value, e);
        value = defaultValue;
      }
    }

    return JSON.stringify(value);
  }
};
