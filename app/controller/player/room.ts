
import { Context, Controller } from 'egg';

export default class RoomController extends Controller {

  /**
   * @api {post} /player/room/list 房间列表
   *
   * @apiGroup room
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
   *       "id": 2,
   *       "name": "红包扫雷房间2",
   *     },
   *     {
   *       "id": 1,
   *       "name": "红包扫雷房间1",
   *     }
   *   ]
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async list () {
    const { ctx } = this;

    let rooms = await ctx.model.Room.findAll({
      attributes: ['id', 'name']
    });

    this.logger.info(rooms);

    ctx.success(rooms);
  }
}
