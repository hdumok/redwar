import { Context } from 'egg';
import { pick } from 'lodash';
import * as util from 'util';

export default {
  get logger () {
    if (this.app.config.env === 'local') {
      return this.getLogger('logger');
    }

    return this.jsonLogger;
  },

  get coreLogger () {
    if (this.app.config.env === 'local') {
      return this.getLogger('logger');
    }

    return this.jsonLogger;
  },

  async auth (phone: string, code: string): Promise<boolean> {
    const auth = this.session.auth;
    if (!auth) {
      this.fail('请先获取验证码');
      return false;
    }

    if (Date.now() - auth.time > 3 * 60 * 1000) {
      this.fail('验证码过期');
      return false;
    }

    if (phone !== auth.phone) {
      this.fail('号码不一致');
      return false;
    }

    if (code !== auth.code) {
      auth.error = auth.error + 1;
      if (auth.error >= 5) {
        this.session.auth = null;
        this.fail('错误次数过多，请重新获取验证码');
      } else {
        this.session.auth = auth;
        this.fail('验证码错误');
      }
      return false;
    }

    return true;
  },

  success (data?, ...message) {

    let status = this.code.success;
    if (typeof data === 'string') {
      message.unshift(data);
      data = null;
    }

    message = this.createMessage(status, message);

    this.body = {
      code: status.code,
      message: message,
      data: data === undefined ? null : data
    };
  },

  fail (code?: any, data?: any, ...message) {

    let status = this.code.fail;
    if (code && code.code) {
      status = code;
    }
    else {
      if (typeof data === 'string' || typeof data === 'number') {
        message.unshift(data);
      }
      data = code;
    }

    if (typeof data === 'string') {
      message.unshift(data);
      data = null;
    }

    message = this.createMessage(status, ...message);

    this.body = {
      code: status.code,
      message: message,
      data: data === undefined ? null : data
    };
  },

  createMessage (status?: any, ...message) {
    if (message.length === 0) {
      message = status.message;
    } else {
      message.unshift(status.message);

      //存在多个message, 并且第一个message不是字符串模板，转换成默认模板
      if (!/%s|%d/.test(message[0])) {
        message[0] = '%s';
      }

      message = util.format.apply(null, message);
    }
    message = (message as any).replace(/%s|%d/g, '').trim();

    return message;
  },

  validater (rules, data?, filter?) {
    //预处理
    if (typeof data === 'boolean') {
      filter = data;
      data = { ...this.request.body };
    } else {
      data = { ...(data || this.request.body) };
    }

    //对参数进行过滤处理
    if (filter) {
      data = pick(data, Object.keys(rules));
    }

    //默认值 default 的级别最高
    for (let key in rules) {
      if (rules.hasOwnProperty(key)) continue;

      let rule = rules[key];
      rule.required = rule.required === false ? false : true;

      if (!rule.hasOwnProperty('default')) continue;

      let has = data.hasOwnProperty(key);
      if (has && data[key] !== '') continue;
      if (!has && rule.required) continue;

      if (rule.default === '') {
        rule.allowEmpty = true;
      }

      if (rule.default === undefined) {
        delete data[key];
      } else {
        data[key] = rule.default;
      }
    }

    this.validate(rules, data);

    return data;
  }
};
