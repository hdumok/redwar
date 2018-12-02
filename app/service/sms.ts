'use strict';

import { Context, Service } from 'egg';

export default class SmsService extends Service {
  public async send (phone, code): Promise<boolean | string> {
    const { ctx } = this;

    //单元测试
    if (ctx.app.config.env === 'unittest') {
      return true;
    }

    //TODO 发短信
    return true;
  }
}
