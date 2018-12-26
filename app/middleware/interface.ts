
import { Application, Context, EggAppConfig } from 'egg';

// 这里是你自定义的中间件
export default function (options: EggAppConfig['interface'], app: Application): any {

  return async (ctx: Context, next: () => Promise<void>) => {

    try {

      let path = ctx.path.split('/').filter((p) => p.length > 0);
      let [module, controller, action] = path;

      //如果是用户模块
      switch (module){
        case 'player':
          if (['login', 'logout', 'register', 'auth', 'payback'].indexOf(action) === -1){
            let user = ctx.session.user;
            if (!user) {
              ctx.fail(ctx.code.unlogin);
              return;
            }
            ctx.uid = user.id;
          }
          break;
        case 'manage':
        break;
      }

      await next();

      //框架层就404的时候, 没有controller能处理
      if (ctx.response.status === 404) {
        ctx.fail(ctx.code.notfound);
        return;
      }
    }
    catch (err) {

      // validater 参数校验
      if (err.status === 422) {
        ctx.fail(
          ctx.code.invalid_param,
          app.config.env !== 'prod' ? err.errors : null,
          app.config.env !== 'prod' ? err.errors[0].field + ': ' + err.errors[0].code + ', ' + err.errors[0].message : err.errors[0].field);
        return;
      }

      // 未知的错误
      process.nextTick(() => {
        ctx.app.emit('error', err, ctx);
      });

      ctx.fail(
        ctx.code.server_error,
        app.config.env !== 'prod' ? err.name + ':' + err.message : null
      );
      return;
    }
  };
}
