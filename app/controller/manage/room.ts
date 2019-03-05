import { Context, Controller } from 'egg';
import { RoomStatus } from '../../model/room';
import { TransactionType } from '../../model/transaction';

export default class RoomController extends Controller {
  /**
   * @api {post} /room/add 添加红包房间
   * @apiGroup Room
   *
   * @apiParam {String} name 房间名称
   * @apiParam {Number} award 房间初始红包
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "success": true,
   *     "code": 200,
   *     "message": "success",
   *     "data": ""
   * }
   */
  public async add(ctx) {
    const rule = {
      name: { type: 'string' },
      award: { type: 'number', min: 1 },
    };

    const data = ctx.validater(rule, true);

    const room = await ctx.model.Room.build(data);
    const transaction = ctx.model.Transaction.build({
      type: TransactionType.RoomAward,
      cost_award: data.award,
      room_award: data.award,
    });

    try {
      await ctx.model.transaction(async t => {
        await room.save({ transaction: t });
        transaction.room_id = room.id;
        await transaction.save({ transaction: t });
      });
    } catch (e) {
      this.logger.error(e);
      return ctx.fail('创建失败');
    }

    this.logger.info('新增房间', room);

    ctx.success();
  }

  /**
   * @api {post} /room/list 红包房间列表
   * @apiGroup Room
   *
   * @apiParam {String} name 房间名称
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   * }
   */
  public async list(ctx) {
    const rule = {
      name: { type: 'string', required: false },
    };

    const condition: any = ctx.validater(rule, true);
    if (condition.name) {
      condition.name = { $like: `%${condition.name}%` };
    }

    const rooms = await ctx.model.Room.findAll({
      attributes: [ 'id', 'name', 'created' ],
      where: condition,
      order: [[ 'created', 'desc' ]],
    });

    ctx.success(rooms);
  }

  /**
   * @api {post} /room/update 编辑红包房间
   * @apiGroup Room
   *
   * @apiParam {String} packet_id 红包房间ID
   * @apiParam {String} [name] 红包房间名称
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "code": 200,
   *     "message": "success",
   *     "data": ""
   * }
   */
  public async update(ctx) {
    const rule = {
      id: { type: 'string' },
      name: { type: 'string', required: false },
    };

    const data = ctx.validater(rule, true);

    const room = await ctx.model.Room.findByPk(data.id);
    if (!room) {
      return ctx.fail('房间不存在');
    }

    Object.assign(room, data);

    await room.save();

    ctx.success();
  }

  /**
   * @api {post} /room/status 修改红包房间状态
   * @apiGroup Room
   *
   * @apiParam {String} packet_id 红包房间ID
   * @apiParam {Number} status 红包房间状态 0-普通 1-置顶 2-隐藏
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "success": true,
   *     "code": 200,
   *     "message": "success",
   *     "data": ""
   * }
   */
  public async status(ctx) {
    const rule = {
      id: { type: 'string' },
      status: { type: 'enum', values: RoomStatus },
    };

    const data = ctx.validater(rule, true);

    const room = await ctx.model.Room.findByPk(data.id);
    if (!room) {
      return ctx.fail('房间不存在');
    }

    // TODO 如果是下架，该红包房间就无法继续发红包，连接断开

    Object.assign(room, data);

    await room.save();

    ctx.success(data);
  }

  /**
   * @api {post} /room/recharge 红包房间充值
   * @apiGroup Room
   *
   * @apiParam {String} packet_id 红包房间ID
   * @apiParam {String} award 充值红包金额
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "code": 200,
   *     "message": "success",
   *     "data": ""
   * }
   */
  public async recharge(ctx) {
    const rule = {
      id: { type: 'string' },
      award: { type: 'number', min: 1 },
    };

    const { id, award } = ctx.validater(rule, true);

    const room = await ctx.model.Room.findByPk(id);
    if (!room) {
      return ctx.fail('房间不存在');
    }

    const transaction = ctx.model.Transaction.build({
      type: TransactionType.RoomAward,
      room_id: room.id,
      cost_award: award,
    });

    try {
      await ctx.model.transaction(async t => {
        room.award = room.award + award;
        transaction.room_award = room.award;
        await room.save({ transaction: t });
        await transaction.save({ transaction: t });
      });
    } catch (e) {
      this.logger.error(e);
      return ctx.fail('充值失败');
    }

    ctx.success();
  }

  /**
   * @api {post} /room/delete 删除红包房间
   * @apiGroup Room
   *
   * @apiParam {String} packet_id 红包房间ID
   *
   * @apiSuccessExample {json} Success-Response:
   * {
   *     "success": true,
   *     "code": 200,
   *     "message": "success",
   *     "data": ""
   * }
   */
  public async delete(ctx) {
    const rule = {
      id: { type: 'string' },
    };

    const { id } = ctx.validater(rule);

    const room = await ctx.model.Room.findByPk(id);
    if (!room) {
      return ctx.fail('房间不存在');
    }

    await room.destroy();

    // TODO 如果是删除，该红包房间就无法继续发红包，连接断开

    ctx.success();
  }
}
