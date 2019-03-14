'use strict';

import { Metadata } from 'grpc';

export default app => {
  app.beforeStart(async () => {
    // 应用会等待这个函数执行完成才启动
    // ID 生成器策略
    app.model.addHook('beforeCreate', app.model.Sequence.setId);
    app.model.addHook('beforeBulkCreate', app.model.Sequence.setId);

    await app.model.sync({
      force: app.config.env === 'unittest',
    });

    if (app.config.env === 'unittest') {
      app.model.Config.bulkCreate([
        { key: 'packet_duration', value: 60 },
        {
          key: 'award_present',
          value: [ 0.08, 0.08, 0.08, 0.06, 0.03, 0.03, 0.03 ],
        },
        {
          key: 'award_1030',
          value: {
            spical: 1.11,
            lei: [ 0, 0, 0, 3.33, 6.66, 26.66, 66.66, 166.66 ],
          },
        },
        {
          key: 'award_3060',
          value: {
            spical: 6.66,
            lei: [ 0, 0, 0, 6.66, 18.88, 66.66, 166.66, 888 ],
          },
        },
      ]);
      app.model.Admin.create({
        role: 'admin',
        name: '管理员',
        account: 'admin',
        password: 'e10adc3949ba59abbe56e057f20f883e',
      });
      app.model.Balance.bulkCreate([{ award: 100 }, { award: 200 }, { award: 300 }, { award: 400 }, { award: 500 }, { award: 600 }]);
      app.model.Room.create({
        name: '红包房间',
        award: 10000,
      });
    }
  });

  // setTimeout(async () => {
  //   let result: any;
  //   try {
  //     const ctx = app.createAnonymousContext();
  //     console.log(ctx.grpc.redwar.packet.send);
  //     result = await ctx.grpc.redwar.packet.send({
  //       room_id: 1,
  //       award: 10,
  //       lei: 5
  //     },                                         {token: '1545751508516-OfX3FoYi8V07HK2eIqKRZk4NX4oK8mT4'}, {timeout: 3000});
  //     app.logger.info(result);
  //   }
  //   catch (e){
  //     app.logger.error(e);
  //   }
  // },         3000);

  app.Sequelize.postgres.DECIMAL.parse = value => {
    return parseFloat(Number(value).toFixed(2));
  };

  process.on('unhandledRejection', (reason, promise) => {
    app.logger.error('[unhandledRejection]', { promise, reason });
  });

  process.on('uncaughtException', e => {
    app.logger.error('[uncaughtException]', e);
  });
};
