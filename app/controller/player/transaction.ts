import { Context, Controller } from 'egg';
export default class RoomController extends Controller {
  /**
   * @api {post} /player/transaction 红包记录
   *
   * @apiGroup transaction
   *
   * @apiParam {Number} [limit=10]  条数
   * @apiParam {Number} [time] 记录结束时间戳, 比如往下拉 之前的数据，则最上面这条数据的时间 的时间对象
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async index () {
    const { ctx } = this;

    let rule = {
      limit: { type: 'number', required: false, default: 10 },
      time: {
        type: 'string',
        required: false,
        default: new Date(Date.now() + 10 * 1000)
      }
    };

    const { limit, time } = ctx.validater(rule);

    let user = ctx.session.user;

    let transactions = await ctx.model.Transaction.findAll({
      where: {
        user_id: user.id,
        created: {
          $lt: new Date(time)
        }
      },
      attributes: [
        'id',
        'type',
        'user_id',
        'cost_award',
        'award',
        'remark',
        'created'
      ],
      order: [['created', 'desc']],
      limit: limit
    });

    ctx.success(transactions);
  }
}
