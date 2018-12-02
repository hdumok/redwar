

import { Context, Controller } from 'egg';
import { pick } from 'lodash';
import { TransactionAttributes, TransactionType} from '../../model/transaction';
import { UserAttributes, UserInstance } from '../../model/user';
import { WithdrawAttributes } from '../../model/withdraw';
export default class WithdrawController extends Controller {

  /**
   * @api {post} /player/withdraw/submit 提现订单提交
   * @apiGroup Recharge
   *
   * @apiParam {Number} award 提现红包数量
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": null
   * }
   */
  public async submit () {
    let rule = {
      award: { type: 'number', mix: 0}
    };

    const { ctx } = this;
    const { award } = ctx.validater(rule);

    let user = await ctx.model.User.findByPk(ctx.session.user.id);
    if (!user) {
      ctx.fail(ctx.code.unlogin);
      return;
    }

    if (user.award < award) {
      ctx.fail('您的余额不足');
      return;
    }

    user.award = user.award - award;

    //存数据库的订单信息
    let withdraw: WithdrawAttributes = {
      user_id: user.id,
      cost_award: award,
      award: user.award,
      remark: `${ctx.helper.getDateTime()} ${user.name} 申请提现。`
    };

    let transaction: TransactionAttributes = {
      type: TransactionType.Withdraw,
      user_id: user.id,
      cost_award: 0 - award,
      award: user.award,
      remark: `${user.name} 申请提现 ${award} 红包, 扣除后，用户当前红包数 ${user.award}`
    };

    try {
      await ctx.model.transaction(async (t) => {
        if (!user) throw new Error('数据异常');
        //提现记录
        withdraw = await ctx.model.Withdraw.create(withdraw as any, {transaction: t});
        transaction.withdraw_id = withdraw.id;
        //流水记录
        await ctx.model.Transaction.create(transaction as any, {transaction: t});
        //用户扣款
        await user.save({transaction: t});
      });
    } catch (e) {
      this.logger.error('操作失败, 请稍后再试', e);
      ctx.fail('操作失败, 请稍后再试');
      return;
    }

    ctx.session.user = user;

    ctx.success(null, '申请成功');
  }
}
