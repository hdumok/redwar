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
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": [
   *     {
   *       "id": 950,
   *       "type": 2,
   *       "user_id": 3,
   *       "cost_award": 67.7, //红包净变化 有正有负
   *       "award": 811.29, //变化后的红包值红包
   *       "remark": "发包者 昵称 回收剩余 5 个红包 67.7",
   *       "created": "2018-09-20 22:19:40"
   *     },
   *     {
   *       "id": 949,
   *       "type": 1,
   *       "user_id": 3,
   *       "cost_award": 15.79,
   *       "award": 743.59,
   *       "remark": "用户 昵称 抢包 15.79",
   *       "created": "2018-09-20 22:18:39"
   *     },
   *     {
   *       "id": 940,
   *       "type": 0,
   *       "user_id": 3,
   *       "cost_award": -100,
   *       "award": 727.8,
   *       "remark": "用户 昵称 在 红包扫雷房间1 发包 100 雷点 7",
   *       "created": "2018-09-20 22:18:37"
   *     },
   *   ]
   * }
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
