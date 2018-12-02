import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/player/user', controller.player.user.index);
  router.post('/player/user/login', controller.player.user.login);
  router.post('/player/user/register', controller.player.user.register);
  router.post('/player/user/update', controller.player.user.update);
  router.post('/player/user/auth', controller.player.user.auth);
  router.post('/player/user/password', controller.player.user.password);
  router.get('/player/user/share', controller.player.user.share);
  router.get('/player/user/logout', controller.player.user.logout);

  router.get('/player/recharge/balance', controller.player.recharge.balance);
  router.post('/player/recharge/submit', controller.player.recharge.submit);
  router.post('/player/recharge/payback', controller.player.recharge.payback);

  router.post('/player/withdraw/submit', controller.player.withdraw.submit);

  router.post('/player/room/list', controller.player.room.list);

  router.post('/player/packet', controller.player.packet.index);
  router.post('/player/packet/list', controller.player.packet.list);
  router.post('/player/packet/send', controller.player.packet.send);
  router.post('/player/packet/open', controller.player.packet.open);

  router.post('/manage/room/add', controller.manage.room.add);
  router.post('/manage/room/list', controller.manage.room.list);
  router.post('/manage/room/update', controller.manage.room.update);
  router.post('/manage/room/recharge', controller.manage.room.recharge);
  router.post('/manage/room/delete', controller.manage.room.delete);
};
