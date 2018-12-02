'use strict';

import { Context, Service } from 'egg';

export default class SessionService extends Service {
  private store = this.app.redis.clients.get('session');
  public async get (token: string): Promise<any> {
    let content = await this.store.get(token);
    content = this.ctx.helper.parseObj(content);
    return content;
  }

  public async set (token: string, content: object = {}) {
    await this.store.set(token, this.ctx.helper.stringifyObj(content));
  }

  public async del (token: string) {
    await this.store.del(token);
  }
}
