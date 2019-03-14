import * as assert from 'assert';
import { Context } from 'egg';
import { app } from 'egg-mock/bootstrap';

describe('service/sms.test.js', () => {
  let ctx: Context;

  before(async () => {
    ctx = app.mockContext();
  });

  it('配置', async () => {
    let result: any = await ctx.service.config.getPacketDuration();
    assert(typeof result === 'number');
    result = await ctx.service.config.getAwardPresent();
    assert(Array.isArray(result));
    result = await ctx.service.config.getAward1030();
    assert(result && typeof result.spical === 'number' && Array.isArray(result.lei));
    result = await ctx.service.config.getAward3060();
    assert(result && typeof result.spical === 'number' && Array.isArray(result.lei));
  });
});
