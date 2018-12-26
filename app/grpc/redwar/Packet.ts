import { Application } from 'egg';
import { BaseGrpc } from 'egg-grpc-server';
import { Metadata } from 'grpc';

export default class PacketGrpcService extends BaseGrpc {
  public app: Application;
  public call: {
    request: any,
    metadata: Metadata
  };

  public Send (){
    return this.toController(this.app.controller.player.packet.send);
  }

  public Open (){
    return this.toController(this.app.controller.player.packet.open);
  }

  private async toController (controller) {

    const ctx = this.app.createAnonymousContext();
    //设置ua
    ctx.header['user-agent'] = this.call.metadata.get('user-agent')[0];
    //请求内容
    ctx.request.body = this.call.request;

    ctx.app.emit('request', ctx);
    try {
      let token = this.call.metadata.get('token')[0] as string;
      ctx.session = await ctx.service.session.get(token);
      let user = ctx.session.user;
      if (!user) {
        ctx.fail(ctx.code.unlogin);
      }
      else {
        await controller.call(ctx);
        await ctx.service.session.set(token, ctx.session);
      }
    }
    catch (err) {
      // validater 参数校验
      if (err.status === 422) {
        ctx.fail(
          ctx.code.invalid_param,
          this.app.config.env !== 'prod' ? err.errors : null,
          this.app.config.env !== 'prod' ? err.errors[0].field + ': ' + err.errors[0].code + ', ' + err.errors[0].message : err.errors[0].field);
      }
      else {
        ctx.fail(
          ctx.code.server_error,
          this.app.config.env !== 'prod' ? err.name + ':' + err.message : null
        );
      }
    }
    ctx.app.emit('response', ctx);
    ctx.body.data = JSON.stringify(ctx.body.data);

    return ctx.body;
  }
}
