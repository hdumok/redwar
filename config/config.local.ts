import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  config.redis = {
    clients: {
      session: {
        host: 'hdumok.com',
        port: 7379,
      },
      cache: {
        host: 'hdumok.com',
        port: 7379,
      },
    },
  };

  config.sequelize = {
    host: 'hdumok.com',
    port: 54321,
    username: 'hdumok',
    password: '123456',
  };

  return config;
};
