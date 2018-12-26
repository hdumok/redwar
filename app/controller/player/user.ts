import { Controller } from 'egg';
import { pick } from 'lodash';
import { TransactionType } from '../../model/transaction';

export default class UserController extends Controller {
  private userinfo: string[] = [
    'id',
    'uid',
    'account',
    'name',
    'headimgurl',
    'award',
    'share'
  ];

  /**
   * @api {get} /player/user 用户信息
   * @apiGroup User
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": {
   *     "id": 3,
   *     "uid": 124803,
   *     "account": "账户名",
   *     "name": "昵称",
   *     "headimgurl": "头像",
   *     "award": 0,  //红包余额
   *   }
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async index () {
    const { ctx } = this;

    //获取到的是user实例
    let user = await this.refresh(ctx.session.user.id);

    ctx.success(pick(user, this.userinfo));
  }

  /**
   * @api {post} /player/user/login 用户登录
   * @apiGroup User
   *
   * @apiParam {String} account    用户账号(手机号)
   * @apiParam {String} [password] 用户密码(优先判断)
   * @apiParam {String} [code]     短信验证码
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": {
   *     "id": 3,
   *     "uid": 124803,
   *     "account": "账户",
   *     "name": "昵称",
   *     "headimgurl": "头像",
   *     "award": 0,  //红包
   *   }
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async login () {
    let rule = {
      account: { type: 'string' },
      password: { type: 'string', required: false },
      code: { type: 'string', required: false }
    };

    const { ctx } = this;
    const { account, password, code } = ctx.validater(rule);

    let user = await ctx.model.User.findOne({
      where: { account }
    });
    if (!user) {
      ctx.fail('用户不存在');
      return;
    }

    if (password) {
      if (ctx.helper.md5(password) !== user.password) {
        ctx.fail('密码错误');
        return;
      }
    }
    else if (code) {
      let auth = await ctx.auth(user.account, code);
      if (!auth) {
        return;
      }
    }
    else {
      ctx.fail('缺少登录参数');
      return;
    }

    user = await this.refresh(user.id);

    ctx.success(pick(user, this.userinfo));
  }

  /**
   * @api {post} /parent/user/register 用户注册
   * @apiGroup User
   * @apiParam {String} account 用户账号(认证后的手机号码)
   * @apiParam {String} password 用户密码
   * @apiParam {String} code 短信验证码
   * @apiParam {String} name 用户昵称
   * @apiParam {String} [share] 来源码，来源用户的share标记, 被分享的人, 注册时带上
   *
   * @apiSuccess {Number}  errno 0
   * @apiSuccess {String}  msg 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *    "code": 0,
   *    "message": "注册成功",
   *    "data": {
   *        "id": 3,
   *        "uid": 124803,
   *        "account": "账户",
   *        "name": "昵称",
   *        "headimgurl": "头像",
   *        "award": 0,  //红包
   *    }
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async register () {
    let rule = {
      account: { type: 'string' },
      password: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
      share: { type: 'string', required: false }
    };

    const { ctx } = this;
    const { account, password, name, code, share } = ctx.validater(rule);

    let user = await ctx.model.User.findOne({
      where: { account }
    });
    if (user) {
      ctx.fail('该账号已存在, 请直接登录');
      return;
    }

    //验证码检验
    let auth = await ctx.auth(account, code);
    if (!auth) {
      return;
    }

    user = await ctx.model.User.create({
      name: name,
      account: account,
      password: ctx.helper.md5(password),
      share: ctx.helper.getNoceStr(5).toUpperCase()
    });

    //如果有分享码
    if (share) {
      try {
        let parent = await ctx.model.User.findOne({
          where: { share },
          include: [{
            model: ctx.model.Relation,
            as: 'relation'
          }]
        });

        if (!parent) {
          throw new Error('分享的来源上级不存在');
        }

        let relation = ctx.model.Relation.build({
          user_id: user.id,
          parent1_id: parent.id
        });

        if (parent.relation) {
          relation.parent2_id = parent.relation.parent1_id;
          relation.parent3_id = parent.relation.parent2_id;
          relation.parent4_id = parent.relation.parent3_id;
          relation.parent5_id = parent.relation.parent4_id;
          relation.parent6_id = parent.relation.parent5_id;
          relation.parent7_id = parent.relation.parent6_id;
        }

        await relation.save();
      }
      catch (e){
        this.logger.error('处理分享关系出错', e);
      }
    }

    user = await this.refresh(user.id);

    ctx.success(pick(user, this.userinfo), '注册成功');
  }

  /**
   * @api {post} /player/user/update 用户信息修改
   * @apiGroup User
   * @apiDescription  用户信息修改，接口只有一个，入口可以有多个，原则是 改什么传什么 不改的就不传，因为空串也是有效的 比如头像修改，只要传headimgurl
   * @apiParam {String} [name] 用户昵称
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *    "code": 0,
   *    "message": "修改成功",
   *    "data": null
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async update () {
    let rule = {
      name: { type: 'string', required: false }
    };

    const { ctx } = this;

    let data = ctx.validater(rule, true);

    let user = await ctx.model.User.findByPk(ctx.session.user.id);
    if (!user) {
      ctx.fail(ctx.code.unlogin);
      return;
    }

    //其他修改
    Object.assign(user, data);

    await user.save();

    ctx.session.user = user;

    return ctx.success(null, '修改信息成功');
  }

  /**
   * @api {post} /player/user/auth 用户获取短信验证码
   * @apiGroup User
   *
   * @apiParam {String} account 用户账号(手机号)
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "短信发送成功",
   *   "data": null // 非正式环境返回对象方便测试 {code: '1234'}
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async auth () {
    let rule = {
      account: { type: 'string' }
    };

    const { ctx } = this;
    const { account } = ctx.validater(rule);

    // TODO 验证码的防刷
    // 发送验证码
    let code = ctx.helper.getRandom(4).toString();
    let result = await ctx.service.sms.send(account, code);
    if (result !== true) {
      this.logger.error('短信发送失败', account, code);
      ctx.fail(result);
      return;
    }

    await ctx.auth(account, code, true);

    ctx.success(
      ctx.app.config.env !== 'prod' ? { code } : null,
      '短信发送成功'
    );
  }

  /**
   * @api {post} /player/user/password 用户密码修改
   * @apiGroup User
   * @apiParam {String} [password] 用户旧密码(通过旧密码修改密码的方式)
   * @apiParam {String} [code]     短信验证码(通过短信验证码修改密码的方式)
   * @apiParam {String} newPassword 用户新密码
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *    "code": 0,
   *    "message": "修改密码成功",
   *    "data": null
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async password () {
    let rule = {
      code: { type: 'string', required: false },
      password: { type: 'string', required: false },
      newPassword: { type: 'string' }
    };

    const { ctx } = this;
    const { code, password, newPassword } = ctx.validater(rule);

    let user = await ctx.model.User.findByPk(ctx.session.user.id);
    if (!user) {
      ctx.fail(ctx.code.unlogin);
      return;
    }

    if (password) {
      if (ctx.helper.md5(password) !== user.password) {
        ctx.fail('密码错误');
        return;
      }
    }
    else if (code) {
      //验证码检验
      let auth = await ctx.auth(user.account, code);
      if (!auth) return;
    }
    else {
      return ctx.fail('缺少参数');
    }

    user.password = ctx.helper.md5(newPassword);

    await user.save();

    ctx.session.user = user;

    return ctx.success(null, '修改密码成功');
  }

  /**
   * @api {get} /player/user/share 分享的情况
   * @apiGroup User
   *
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "message": "",
   *   "data": {
   *     "count": 0, //我的直接推广的用户，不是下级的下级
   *     "award": 0  //所有下级给我赚的钱
   *   }
   * }
   * @apiError {Number}  code 错误码
   * @apiError {String}  message 提示语
   * @apiError {Object}  data 数据
   */
  public async share () {
    const { ctx } = this;

    let user = ctx.session.user;

    //我拉的人
    let count = await ctx.model.Relation.count({
      where: {
        $or: [
          { parent1_id: user.id },
          { parent2_id: user.id },
          { parent3_id: user.id },
          { parent4_id: user.id },
          { parent5_id: user.id },
          { parent6_id: user.id },
          { parent7_id: user.id }
        ]
      }
    });

    //我拉人获得的收入
    let award = await ctx.model.Transaction.sum('cost_award', {
      where: {
        type: TransactionType.Present,
        user_id: user.id
      }
    }) || 0;

    //TODO null？？？？
    ctx.success({ count, award });
  }

  /**
   * @api {get} /player/user/logout 用户登出
   * @apiGroup User
   * @apiSuccess {Number}  code 0
   * @apiSuccess {String}  message 提示语
   * @apiSuccess {Object}  data 数据
   */
  public async logout () {
    const { ctx } = this;
    this.logger.info('清空用户缓存', ctx.session.user);
    ctx.session.user = null;
    ctx.success();
  }

  private async refresh (id: number) {
    const { ctx } = this;

    let user = await ctx.model.User.findByPk(id);
    if (!user) {
      ctx.fail('用户不存在');
      return null;
    }

    user.accessed = new Date();
    if (!user.uid) {
      user.uid = ctx.helper.getUid(user.id);
    }
    let token = ctx.cookies.get('token', {encrypt: true});
    if (user.token !== token) {
      user.token = token;
    }

    await user.save();

    ctx.session.user = user;

    return user;
  }
}
