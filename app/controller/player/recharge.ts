import { Context, Controller } from 'egg';
import {
  RechargeAttributes,
  RechargeInstance,
  RechargeStatus
} from '../../model/recharge';
import {
  TransactionAttributes,
  TransactionInstance,
  TransactionType
} from '../../model/transaction';

export default class RechargeController extends Controller {
  /**
   * @api {get} /player/recharge/balance 充值选项查看
   * @apiGroup Recharge
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": [
   *     {
   *       "id": 1,
   *       "award": 100
   *     },
   *     {
   *       "id": 2,
   *       "award": 200
   *     },
   *     {
   *       "id": 3,
   *       "award": 500
   *     },
   *     {
   *       "id": 4,
   *       "award": 800
   *     },
   *     {
   *       "id": 5,
   *       "award": 1000
   *     },
   *     {
   *       "id": 6,
   *       "award": 1500
   *     },
   *     {
   *       "id": 7,
   *       "award": 2000
   *     },
   *     {
   *       "id": 8,
   *       "award": 3000
   *     }
   *   ]
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async balance () {
    const { ctx } = this;

    let balances = await ctx.model.Balance.findAll({
      attributes: ['id', 'award']
    });

    ctx.success(balances);
  }

  /**
   * @api {POST} /player/recharge/submit 充值订单提交
   * @apiGroup Recharge
   *
   * @apiParam {Number} award 充值红包数量
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": {
   *     "order_id": 26803, //订单码，转账时带上
   *     "cost_award": 1000
   *   }
   * }
   */
  public async submit () {
    let rule = {
      award: { type: 'number', mix: 0 }
    };

    const { ctx } = this;
    const { award } = ctx.validater(rule);

    let user = ctx.session.user;

    //存数据库的订单信息
    let recharge = ctx.model.Recharge.build({
      status: RechargeStatus.Normal,
      oid: ctx.helper.getOrderId(),
      user_id: user.id,
      cost_award: award,
      remark: `${ctx.helper.getDateTime()} ${user.name} 创建 ${award} 订单。`
    });

    try {
      await recharge.save();
    }
    catch (e) {
      this.logger.error('操作失败, 请稍后再试', e);
      ctx.fail('操作失败, 请稍后再试');
      return;
    }

    ctx.success(
      ctx.app.config.env !== 'prod' ? { oid: recharge.oid } : null,
      '创建订单成功'
    );
  }

  //TODO 充值回调
  public async payback () {
    let rule = {
      oid: { type: 'string' },
      status: { type: 'number' }
    };

    const { ctx } = this;
    const { oid, status } = ctx.validater(rule);

    let recharge = await ctx.model.Recharge.findOne({
      where: { oid },
      include: [
        {
          model: ctx.model.User
        }
      ]
    });
    this.logger.debug('充值记录', recharge);
    if (!recharge) {
      ctx.fail('该充值记录不存在');
      return;
    }

    if (recharge.status !== RechargeStatus.Normal) {
      ctx.fail('该充值记录已处理');
      return;
    }

    if (!recharge.user) {
      ctx.fail('玩家不存在');
      return;
    }

    recharge.user.award = ctx.helper.Decimal(recharge.award + recharge.cost_award);
    recharge.status = status;

    let transaction: TransactionInstance;
    if (status === RechargeStatus.Success) {
      recharge.recharged = new Date();
      recharge.award = recharge.user.award;
      recharge.remark = `${recharge.user.name} 成功充值 ${ recharge.cost_award }红包, 用户当前红包数 ${recharge.user.award}`;

      transaction = ctx.model.Transaction.build({
        type: TransactionType.Recharge,
        recharge_id: recharge.id,
        user_id: recharge.user_id,
        cost_award: recharge.cost_award,
        award: recharge.award,
        remark: recharge.remark
      });
    } else {
      recharge.rejected = new Date();
    }

    try {
      await ctx.model.transaction(async (t) => {

        if (!recharge || !recharge.user) throw new Error('参数不足');

        await recharge.save({ transaction: t });
        await recharge.user.save({ transaction: t });

        if (transaction) {
          await transaction.save({transaction: t});
        }
      });
    } catch (e) {
      this.logger.error('操作失败, 请稍后再试', e);
      ctx.fail('操作失败, 请稍后再试');
      return;
    }

    ctx.success(null, '订单处理成功');
  }
}
