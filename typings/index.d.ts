import 'egg';
import 'egg-sequelize'
import * as Redis from 'ioredis'
import { Session } from 'inspector';
declare module 'egg-session'
declare module 'xlsx'
declare module 'egg' {
  // 扩展 app
  interface Application {
    redis: {
      clients: Map[
        [string, Redis]
      ]
    }
    cache: any
  }

  // 扩展 context
  interface Context {
    code: {
      success: any,
      fail: any,
      unlogin: any,
      notfound: any,
      invalid_param: any,  
      server_error: any
    }
  }

  // 扩展你的配置
  interface EggAppConfig {

    intterface: any
  }
}
declare global {
  namespace NodeJS {
      interface Global {
      }
  }
}
