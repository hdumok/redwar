import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {

  const config = {} as PowerPartial<EggAppConfig>;

  config.keys = appInfo.name;

  config.prefix = '';

  config.middleware = ['interface'];

  config.interface = {
    success: {
      code: 200,
      message: 'success'
    },

    fail: {
      code: 400,
      message: 'fail'
    },

    unlogin: {
      code: 401,
      message: '请重新登录'
    },

    notfound: {
      code: 404,
      message: '接口地址不存在'
    },

    invalid_param: {
      code: 422,
      message: '参数错误, %s'
    },

    server_error: {
      code: 500,
      message: '服务器错误, %s'
    }
  };

  config.session = {
    key: 'token',
    maxAge: 7 * 24 * 3600 * 1000,
    httpOnly: true,
    encrypt: true
  };

  config.security = {
    csrf: {
      enable: false
    },
    domainWhiteList: [],
    methodnoallow: {
      enable: false
    }
  };

  config.cors = {
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  config.workerStartTimeout = 10 * 60 * 1000;

  config.cluster = {
    listen: {
      port: 7001
    }
  };

  config.clusterClient = {
    maxWaitTime: 60000,
    responseTimeout: 60000
  };

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.nj': 'nunjucks'
    }
  };

  config.i18n = {
    defaultLocale: 'zh-CN',
    queryField: 'locale',
    cookieField: 'locale',
    cookieMaxAge: '1d'
  };

  config.logger = {
    dir: appInfo.baseDir + '/logs/',
    appLogName: `stdout.log`,
    errorLogName: `stdout.log`,
    coreLogName: `stdout.log`,
    agentLogName: `stdout.log`,
    level: 'DEBUG',
    consoleLevel: 'DEBUG'
  };

  config.customLogger = {
    scheduleLogger: {
      file: appInfo.baseDir + '/logs/' + 'schedule.log',
      consoleLevel: 'DEBUG'
    }
  };

  config.redis = {
    app: true,
    agent: true,
    clients: {
      session: {
        port: 6379,
        host: '127.0.0.1',
        password: '123456',
        db: 0
      },
      cache: {
        port: 6379,
        host: '127.0.0.1',
        password: '123456',
        db: 1
      }
    }
  };

  config.sessionRedis = {
    name: 'session',
  };

  config.sequelize = {
    dialect: 'postgres', // support: mysql, mariadb, postgres, mssql
    database: 'redwar',
    host: '127.0.0.1',
    port: 5432,
    username: 'redwar',
    password: '12345678',
    timezone: '+08:00', //东八时区
    dialectOptions: {
      decimalNumbers: true
    },
    benchmark: true,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created',
      updatedAt: 'updated',
      deletedAt: 'deleted',
      hooks: {
      }
    }
  };

  config.cache = {
    default: 'memory',
    stores: {
      memory: {
        driver: 'memory',
        max: 100,
        ttl: 0
      }
    }
  };
  config.grpc = {
    dir: 'app/grpc',
    property: 'grpc',
    loadOpts: {
      convertFieldsToCamelCase: false,
    },
    clientOpts: {},
    endpoint: 'localhost:7002',
    timeout: 5000,
  };

  config.grpcServer = {
    protoPath: 'app/grpc', //*.proto path
    extendPath: 'app/grpc', //service path
    host: '0.0.0.0',
    port: '7002',
    loaderOption: {
      //加载proto
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    }
  };
  // the return config will combines to EggAppConfig
  return config;
};
