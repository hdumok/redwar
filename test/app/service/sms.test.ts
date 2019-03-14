import * as assert from 'assert';
import { Context } from 'egg';
import { app } from 'egg-mock/bootstrap';

describe('service/sms.test.js', () => {
  let ctx: Context;

  before(async () => {
    ctx = app.mockContext();
  });

  it('短信平台', async () => {
    const result = await ctx.service.sms.send('22222222222', '12345');
    assert(result === true);
  });
});
