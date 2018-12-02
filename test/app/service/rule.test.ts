import * as assert from 'assert';
import { Context } from 'egg';
import { app } from 'egg-mock/bootstrap';
import { TransactionValue } from '../../../app/model/transaction';

describe('service/rule.test.js', () => {
  let ctx: Context;

  before(async () => {
    ctx = app.mockContext();
  });

  it('红包判断', async () => {
    let result = await ctx.service.rule.checkPacket(32.87, 5);
    assert(result === TransactionValue.Normal);
  });
});
