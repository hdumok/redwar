import { Controller } from 'egg';
import { pick } from 'lodash';
import { PacketAward, PacketNumber, PacketStatus } from '../../model/packet';
import { TransactionType, TransactionValue } from '../../model/transaction';

import decimal = require('decimal102');

export default class PacketController extends Controller {
  /**
   * @api {post} /player/packet 红包详情
   *
   * @apiGroup packet
   *
   * @apiParam {Number} id  红包id
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 200,
   *   "message": "",
   *   "data": {
   *     "id": 1,
   *     "status": 2,
   *     "base_award": 100,
   *     "award": 76.3,
   *     "lei": 5,
   *     "turns": 2,
   *     "all_turns": 7,
   *     "created": "2018-11-26T15:33:23.473Z",
   *     "finished": "2018-11-26T15:34:23.473Z",
   *     "user": {
   *       "id": 2,
   *       "name": "修改的名称",
   *       "headimgurl": ""
   *     },
   *     "roomer": [
   *       {
   *         "id": 1,
   *         "name": "房间名称",
   *         "headimgurl": "",
   *         "value": "",
   *         "packet_award": 2.03,
   *         "created": "2018-11-26T15:33:23.799Z"
   *       }
   *     ],
   *     "player": [
   *       {
   *         "id": 2,
   *         "name": "修改的名称",
   *         "headimgurl": "",
   *         "value": "豹子",
   *         "packet_award": 23.7,
   *         "created": "2018-11-26T15:33:23.861Z"
   *       }
   *     ]
   *   }
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async index () {
    let rule = {
      id: { type: 'number' }
    };

    const { ctx } = this;
    const { id } = ctx.validater(rule);

    let user = ctx.session.user;

    let packet: any = await ctx.model.Packet.findByPk(id, {
      attributes: [
        'id',
        'status',
        'base_award',
        'award',
        'lei',
        'turns',
        'all_turns',
        'created',
        'finished'
      ],
      include: [
        {
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'name', 'headimgurl']
        },
        {
          model: ctx.model.Room,
          as: 'roomer',
          attributes: ['id', 'name', 'headimgurl'],
          through: {
            where: {
              type: TransactionType.Qiang,
              packet_id: id,
              user_id: 0
            },
            attributes: ['value', 'packet_award', 'created']
          }
        },
        {
          model: ctx.model.User,
          as: 'player',
          attributes: ['id', 'name', 'headimgurl'],
          through: {
            where: {
              type: TransactionType.Qiang,
              packet_id: id,
              user_id: { $ne: 0 }
            },
            attributes: ['value', 'packet_award', 'created']
          }
        }
      ],
      order: [
        [
          {
            model: ctx.model.User,
            as: 'player'
          },
          'created',
          'asc'
        ]
      ]
    });

    if (!packet) {
      ctx.fail('红包不存在');
      return;
    }

    if (!packet.user) {
      this.logger.error('碰到没有发包者的红包', packet);
      ctx.fail('该红包无法打开');
      return;
    }

    this.logger.info(packet);
    if (
      packet.status === PacketStatus.Normal &&
      new Date(packet.finished as string) < new Date()
    ) {
      await this.packetExpired(packet.id);
    }

    packet = packet.get({ plain: true });
    packet.roomer.forEach((roomer) => {
      Object.assign(roomer, roomer.transaction);
      delete roomer.transaction;
    });
    packet.player.forEach((player) => {
      Object.assign(player, player.transaction);
      delete player.transaction;
    });

    ctx.success(packet);
  }

  /**
   * @api {post} /player/packet/list 红包列表
   *
   * @apiGroup packet
   *
   * @apiParam {Number} room_id 房间号
   * @apiParam {Number} [limit=10] 条数
   * @apiParam {String} [time] 记录结束时间戳, 比如往下拉 之前的数据，则最上面这条数据的时间，时间对象
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 200,
   *   "message": "",
   *   "data": [
   *     {
   *       "id": 17,
   *       "status": 0,
   *       "lei": 5,
   *       "base_award": 50,
   *       "created": "2018-11-26T14:03:33.174Z",
   *       "opened": 0,
   *       "user": {
   *         "id": 2,
   *         "name": "修改的名称",
   *         "headimgurl": ""
   *       }
   *     }
   *   ]
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async list () {
    let rule = {
      room_id: { type: 'number', required: true },
      limit: { type: 'number', required: false, default: 10 },
      time: {
        type: 'string',
        required: false,
        default: new Date(Date.now() + 10 * 1000)
      }
    };

    const { ctx } = this;
    const { limit, time, room_id } = ctx.validater(rule);

    let user = ctx.session.user;

    let packets = await ctx.model.Packet.findAll({
      where: {
        room_id,
        created: {
          $lt: new Date(time)
        }
      },
      include: [
        {
          model: ctx.model.User,
          attributes: ['id', 'name', 'headimgurl']
        }
      ],
      attributes: [
        'id',
        'status',
        'player_ids',
        'lei',
        'base_award',
        'opened',
        'created'
      ],
      limit: limit,
      order: [['created', 'desc']]
    });

    let result = packets.map((item) => {
      let packet: any = item.get({ plain: true });
      packet.opened = packet.player_ids.indexOf(user.id) === -1 ? 0 : 1;
      delete packet.player_ids;
      return packet;
    });

    ctx.success(result);
  }
  public async send () {
    let rule = {
      room_id: { type: 'number' },
      award: { type: 'number' },
      lei: { type: 'number', min: 0, max: 9 }
    };

    const { ctx } = this;
    const { award, room_id, lei } = ctx.validater(rule);

    let room = await ctx.model.Room.findByPk(room_id);
    if (!room) {
      ctx.fail('房间不存在');
      return;
    }

    //TODO 做成自定义配置
    if (award < PacketAward.Min) {
      ctx.fail(`最小发${PacketAward.Min}元红包`);
      return;
    }

    if (award > PacketAward.Max) {
      ctx.fail(`最大发${PacketAward.Max}元红包`);
      return;
    }

    let user = await ctx.model.User.findByPk(ctx.session.user.id);
    if (!user) {
      ctx.fail(ctx.code.unlogin);
      return;
    }

    if (user.award < award) {
      ctx.fail('您的余额不足, 请先去充值!');
      return;
    }

    // 红包过期时间
    let packet_duration = await ctx.service.config.getPacketDuration();
    // 红包信息
    let packet = ctx.model.Packet.build({
      status: PacketStatus.Normal,
      room_id: room.id,
      user_id: user.id, //发包的人
      base_award: award,
      award: award,
      lei: lei,
      turns: 0,
      all_turns: 7
    });
    packet.created = new Date();
    packet.finished = new Date(Date.now() + packet_duration * 1000);

    //红包队列
    packet.packet_items = await ctx.service.rule.createPackets(award, lei);

    this.logger.info('红包信息', packet.get({plain: true}));

    // 发包记录
    let transaction = ctx.model.Transaction.build({
      type: TransactionType.Fa,
      user_id: user.id,
      room_id: room_id,
      base_award: award,
      cost_award: -award,
      remark: `用户 ${user.name} 在 ${room.name} 发包 ${award} 雷点 ${lei}`
    });

    this.logger.info('发包记录', transaction.get({plain: true}));

    try {
      await ctx.model.transaction(async (t) => {
        //前置条件
        if (!user) return;

        //红包保存
        await packet.save({ transaction: t });

        //用户当前红包更新
        await user.reload({ transaction: t });
        user.award = decimal(user.award - packet.base_award);
        await user.save({ transaction: t });

        //发包记录
        transaction.packet_id = packet.id;
        transaction.award = user.award;
        await transaction.save({ transaction: t });

        //TODO 出错也会回滚
        await ctx.service.rule.setPackets(packet.id, packet.packet_items);
      });
    } catch (e) {
      this.logger.error('发送红包失败', e);
      ctx.fail('发送失败, 请稍后再试');
      return;
    }

    ctx.session.user = user;

    //发首包给房主
    if (this.app.config.env === 'unittest'){
      await this.packetToRoom(packet.id);
    }
    else {
      process.nextTick(this.packetToRoom.bind(this, packet.id));
    }

    //包超时结算
    setTimeout(
      this.packetExpired.bind(this, packet.id),
      new Date(packet.finished).getTime() - Date.now() + 3000
    );

    ctx.success({
      award: user.award,
      //和红包列表保持一致
      packet: {
        ...pick(packet, 'id', 'status', 'lei', 'base_award', 'created'),
        user: pick(user, 'id', 'name', 'headimgurl'),
        relation: 0
      }
    });
  }

  public async open () {
    let rule = {
      id: { type: 'number' }
    };

    const { ctx } = this;
    const { id } = ctx.validater(rule);
    try {
      //红包
      let packet = await ctx.model.Packet.findByPk(id, {
        include: [
          {
            model: ctx.model.User,
            as: 'user',
            attributes: ['id', 'name', 'award']
          },
          {
            model: ctx.model.Room,
            as: 'room',
            attributes: ['id', 'name', 'award']
          }
        ]
      });

      if (!packet) {
        ctx.fail('红包不存在');
        return;
      }
      // 红包的情况
      if (packet.status === PacketStatus.Success || packet.award === 0) {
        ctx.fail('红包已抢完');
        return;
      }
      if (
        packet.status === PacketStatus.Expired ||
        new Date(packet.finished as string).getTime() < Date.now()
      ) {
        ctx.fail('红包已过期');
        return;
      }

      let user = await ctx.model.User.findByPk(ctx.session.user.id);
      if (!user) {
        ctx.fail(ctx.code.unlogin);
        return;
      }

      //我的余额情况
      if (user.award < packet.base_award * 1.5) {
        ctx.fail('您的余额不足, 请先去充值!');
        return;
      }

      // TODO 待修改到模型里
      //是否抢过红包
      let open = await ctx.model.Transaction.findOne({
        where: {
          type: TransactionType.Qiang,
          packet_id: packet.id,
          user_id: user.id
        }
      });
      if (open) {
        ctx.fail('您已经抢过该红包');
        return;
      }

      // TODO 待封装
      let packet_item = await ctx.service.rule.getPacket(packet.id);
      this.logger.debug('取出红包', packet_item);
      if (!packet_item) {
        ctx.fail('红包已抢完');
        return;
      }
      packet_item = ctx.helper.parseObj(packet_item);

      //如果已经抽到最后一个红包 ，修改大红包状态为抽完
      if (packet_item.turns === PacketNumber.Max) {
        packet.status = PacketStatus.Success;
      }

      let transaction = ctx.model.Transaction.build({
        type: TransactionType.Qiang,
        room_id: packet.room_id,
        packet_id: packet.id,
        user_id: user.id,
        turns: packet_item.turns,
        //TODO 看下是否能删除
        base_award: packet.base_award
      });

      //判断我抢到的包的情况
      transaction.value = await ctx.service.rule.checkPacket(
        packet_item.award,
        packet.lei
      );
      transaction.spical_award = 0;
      transaction.lei_award = 0;

      switch (transaction.value) {
        case TransactionValue.Min:
        case TransactionValue.BaoZi:
        case TransactionValue.ShunZi:
          //抢包者特殊牌，给发包者的奖励
          if (packet.base_award >= 10 && packet.base_award <= 30) {
            //TODO 转化到配置service里
            let award_1030 = await ctx.service.config.getAward1030();
            transaction.spical_award = award_1030.spical;
          } else if (packet.base_award > 30) {
            let award_3060 = await ctx.service.config.getAward3060();
            transaction.spical_award = award_3060.spical;
          }
          transaction.remark = `用户 ${user.name} 特殊牌 ${
            transaction.value
          } 奖励 ${transaction.spical_award}`;
          break;
        case TransactionValue.Lei:
          if (packet.user_id !== transaction.user_id) {
            //抢包者中雷，赔付的值
            transaction.lei_award = -decimal(1.5 * packet.base_award);
            transaction.remark = `用户 ${user.name} 中雷 ${packet.lei} 赔付 ${
              transaction.lei_award
            }`;
          } else {
            transaction.remark = `发包者 ${user.name} 抢自己红包中雷 ${
              packet.lei
            } 不用赔付`;
          }
          break;
        default:
          transaction.remark = `用户 ${user.name} 抢到红包 ${
            transaction.packet_award
          }`;
      }
      transaction.packet_award = packet_item.award;
      transaction.cost_award = decimal(packet_item.award + transaction.spical_award + transaction.lei_award);

      try {
        await ctx.model.transaction(async (t) => {
          // 这句是废话，消除警告用, egg里有
          if (!user || !packet || !packet.user || !packet.room) {
            throw new Error('数据异常');
          }
          if (!transaction) return;

          //重载房间的信息
          await packet.room.reload({ transaction: t });
          //重载发包者的信息
          await packet.user.reload({ transaction: t });
          //玩家特殊牌,友房主奖励发包者
          if (transaction.spical_award) {
            //实际上 spical_award 是正的
            packet.room.award = decimal(packet.room.award - Math.abs(transaction.spical_award));
            packet.user.award = decimal(packet.user.award + Math.abs(transaction.spical_award));
          }
          //玩家中雷,直接赔钱, 给发包者
          if (transaction.lei_award) {
            //实际上 lei_award 是负的
            packet.user.award = decimal(packet.user.award + Math.abs(transaction.lei_award));
          }

          //如果是自己抢了自己的红包
          if (user.id === packet.user.id){
            user.award = decimal(user.award + transaction.cost_award);
            transaction.award = user.award;
            await user.save({ transaction: t });
          }
          else {
            packet.user.award = decimal(packet.user.award + transaction.cost_award);
            transaction.award = packet.user.award;
          }
          transaction.room_award = packet.room.award;

          //TODO 这里没记账
          await packet.room.save({ transaction: t });
          await packet.user.save({ transaction: t });

          //房主的交易和红包更新
          await transaction.save({ transaction: t });

          packet.turns = transaction.turns;

          if (transaction.packet_award) {
            packet.award = decimal(packet.award - transaction.packet_award);
          }

          //记录抽红包的人
          packet.player_ids.push(user.id);
          await packet.save({ transaction: t });
        });
      } catch (e) {
        if (e.message && e.message.indexOf('ER_DUP_ENTRY') === 0) {
          ctx.fail('请不要重复点击');
          return;
        }

        this.logger.error('打开红包出错', e);
        this.logger.error('回滚红包', packet_item);
        await ctx.service.rule.setPacket(packet.id, packet_item);
        ctx.fail('未抢到红包');
        return;
      }

      if (packet.status === PacketStatus.Success) {
        process.nextTick(this.packetMutliLei.bind(this, packet.id));
      }

      ctx.session.user = user;

      let result = {
        turns: packet_item.turns,
        value: transaction.value,
        packet_award: packet_item.award,
        cost_award: transaction.cost_award,
        award: user.award
      };

      ctx.success(result);
    } catch (e) {
      this.logger.error('操作失败, 请稍后再试', e);
      ctx.fail('操作失败, 请稍后再试');
    }
  }
  private async packetMutliLei (packet_id: number) {
    //多雷奖励
    const { ctx } = this;

    let packet = await ctx.model.Packet.findByPk(packet_id, {
      include: [
        {
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'name', 'award']
        },
        {
          model: ctx.model.Room,
          as: 'room',
          attributes: ['id', 'name', 'award']
        }
      ]
    });

    if (!packet) {
      this.logger.error('packetMutliLei 红包不存在', packet_id);
      return;
    }

    packet.lei_count = await ctx.model.Transaction.count({
      where: {
        type: TransactionType.Qiang,
        packet_id: packet.id,
        value: TransactionValue.Lei
      }
    });

    let cost_award = 0;
    if (packet.base_award >= 10 && packet.base_award <= 30) {
      let award_1030 = await ctx.service.config.getAward1030();
      cost_award = award_1030.lei[packet.lei_count];
    } else if (packet.base_award > 30) {
      let award_3060 = await ctx.service.config.getAward3060();
      cost_award = award_3060.lei[packet.lei_count];
    }
    //雷奖励
    if (!cost_award) return;

    let transaction = ctx.model.Transaction.build({
        type: TransactionType.Lei,
        user_id: packet.user_id,
        room_id: packet.room_id,
        packet_id: packet.id,
        base_award: packet.base_award,
        cost_award: cost_award,
        remark: `发包者 ${packet.user.name} 的红包 ${
          packet.lei_count
        }雷, 奖励 ${cost_award}`
    });

    await ctx.model.transaction(async (t) => {
        if (!packet) return;
        await packet.room.reload({ transaction: t });
        await packet.user.reload({ transaction: t });

        packet.user.award = decimal(packet.user.award + cost_award);
        packet.room.award = decimal(packet.room.award - cost_award);

        transaction.room_award = packet.room.award;
        transaction.award = packet.user.award;

        await packet.update({ transaction: t});
        await transaction.save({ transaction: t});
        await packet.user.save({ transaction: t});
        await packet.room.save({ transaction: t});
    });
  }

  private async packetToRoom (packet_id: number) {
    const { ctx } = this;

    let packet = await ctx.model.Packet.findByPk(packet_id, {
      include: [
        {
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'name', 'award']
        },
        {
          model: ctx.model.Room,
          as: 'room',
          attributes: ['id', 'name', 'award']
        }
      ]
    });

    if (!packet) {
      this.logger.error('packetToRoom 红包不存在', packet_id);
      return;
    }

    let packet_item = await ctx.service.rule.getPacket(packet_id);
    if (!packet_item) return;

    this.logger.info('取出首包', packet_item);

    try {
      //房主抢首包交易
      let transaction = ctx.model.Transaction.build({
        type: TransactionType.Qiang,
        turns: packet_item.turns,
        user_id: 0, //房主不是用户
        room_id: packet.room_id,
        packet_id: packet.id,
        base_award: packet.base_award,
        packet_award: packet_item.award,
        cost_award: packet_item.award
      });

      transaction.value = await ctx.service.rule.checkPacket(
        transaction.packet_award,
        packet.lei
      );

      //房主没有特殊牌奖励，也不应该有雷赔付
      transaction.remark = `房主 ${packet.room.name} 首包 ${
        transaction.packet_award
      }`;

      await ctx.model.transaction(async (t) => {
        if (!packet) return;

        //房主的交易和红包更新
        await packet.room.reload({ transaction: t });
        packet.room.award = decimal(packet.room.award + transaction.cost_award);
        await packet.room.save({ transaction: t });

        //红包本身的更新
        packet.award = decimal(packet.award - transaction.packet_award);
        await packet.save({ transaction: t });

        //发包交易的更新
        transaction.room_award = packet.room.award;
        await transaction.save({ transaction: t });
      });
    } catch (e) {
      await ctx.service.rule.setPacket(packet.id, packet_item);
      this.logger.error('分配房主首包出错', e, packet_item);
    }

    // TODO 可能失败，需要定时任务兜底
    //用房主的首包分红
    if (this.app.config.env === 'unittest'){
      await this.packetPresent(packet.id);
    }
    else {
      process.nextTick(this.packetPresent.bind(this, packet.id));
    }
  }

  private async packetPresent (packet_id: number){

    const { ctx } = this;

    let packet = await ctx.model.Packet.findByPk(packet_id, {
      include: [
        {
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'name', 'award']
        },
        {
          model: ctx.model.Room,
          as: 'room',
          attributes: ['id', 'name', 'award']
        }
      ]
    });

    if (!packet) {
      this.logger.error('packetPresent 红包不存在', packet_id);
      return;
    }

    let room_packet = await ctx.model.Transaction.findOne({
      where: {
        type: TransactionType.Qiang,
        packet_id: packet_id,
        user_id: 0
      }
    });
    if (!room_packet) {
      this.logger.error('该房间房主没抢包', packet_id);
      return;
    }

     //给发包者的上级 分红
    let parents: any = [];
    let relation = await ctx.model.Relation.findOne({
       where: { user_id: packet.user_id }
     });
    if (!relation) return;

    this.logger.info('给发包者的上级关系', relation.get({plain: true}));

    let transaction = ctx.model.Transaction.build({
      type: TransactionType.RoomPresent,
      user_id: 0, //房主不是用户
      room_id: packet.room_id,
      packet_id: packet.id,
      base_award: packet.base_award,
      packet_award: room_packet.packet_award,
      cost_award: 0
    });

    parents = [
        relation.parent1_id,
        relation.parent2_id,
        relation.parent3_id,
        relation.parent4_id,
        relation.parent5_id,
        relation.parent6_id,
        relation.parent7_id
    ];

    parents = parents.filter((id) => id);
    if (parents.length === 0){
      this.logger.info('该发包者没有上级', parents);
      return;
    }

    //分红配置
    let award_present = await ctx.service.config.getAwardPresent();
    for (let i = 0, len = parents.length; i < len; i++) {
      let parent_id = parents[i];
      let parent_transaction = ctx.model.Transaction.build({
        type: TransactionType.Present,
        user_id: parent_id,
        room_id: packet.room_id,
        packet_id: packet.id,
        base_award: packet.base_award,
        cost_award: decimal(award_present[i] * room_packet.packet_award)
      });
      parent_transaction.remark = `${packet.user.name} 发包, 给第 ${i + 1} 级 分红 ${parent_transaction.cost_award}`;
      this.logger.info(parent_transaction);
      parents[i] = parent_transaction;
    }

    try {
      await ctx.model.transaction(async (t) => {

        for (let parent_transaction of parents){
          let user = await ctx.model.User.findByPk(parent_transaction.user_id, {
            transaction: t
          });
          if (!user) continue;

          user.award = decimal(user.award + parent_transaction.cost_award);
          await user.save({ transaction: t });

          parent_transaction.award = user.award;
          await parent_transaction.save({ transaction: t });

          transaction.cost_award = decimal(transaction.cost_award - parent_transaction.cost_award);
        }

        transaction.remark = `房主抢包 ${transaction.packet_award}, 分红给发包者上级共 ${Math.abs(transaction.cost_award)}`;
        await transaction.save({ transaction: t });
      });
    } catch (e) {
      this.logger.error('分红出错', e, packet.get({plain: true}));
    }
  }

  private async packetExpired (packet_id: number) {
    const { ctx } = this;
    let packet = await ctx.model.Packet.findByPk(packet_id, {
      include: [
        {
          model: ctx.model.User,
          as: 'user',
          attributes: ['id', 'name', 'award']
        },
        {
          model: ctx.model.Room,
          as: 'room',
          attributes: ['id', 'name', 'award']
        }
      ]
    });

    if (!packet) {
      return;
    }

    if (packet.status !== PacketStatus.Normal) {
      return;
    }

    //包还没抢完
    packet.status = PacketStatus.Expired;

    //剩余包收回
    let transaction = ctx.model.Transaction.build({
      type: TransactionType.Back,
      user_id: packet.user_id,
      room_id: packet.room_id,
      packet_id: packet.id,
      base_award: packet.base_award,
      //自己把剩下红包余额收回
      cost_award: packet.award,
      remark: `红包超时未领完, ID:${packet.id} 的红包内剩余${packet.all_turns -
        packet.turns}个红包共 ${packet.award} 退回发包者 ${packet.user.name}`
    });

    try {
      await ctx.model.transaction(async (t) => {
        if (!packet) return;
        //红包状态
        await packet.save({ transaction: t });

        //用户余额
        await packet.user.reload({ transaction: t });
        packet.user.award = decimal(packet.user.award + packet.award);
        await packet.user.save({ transaction: t });

        //发包后, 备份用户的 红包值
        transaction.award = packet.user.award;
        await transaction.save({ transaction: t });
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
