import * as assert from 'assert';
import { app } from 'egg-mock/bootstrap';

const parents: any[] = [{
  name: '测试父用户1',
  account: '12345678911',
  password: '123456'
}, {
  name: '测试父用户2',
  account: '12345678912',
  password: '123456'
}, {
  name: '测试父用户3',
  account: '12345678913',
  password: '123456'
}, {
  name: '测试父用户4',
  account: '12345678914',
  password: '123456'
}, {
  name: '测试父用户5',
  account: '12345678915',
  password: '123456'
}, {
  name: '测试父用户6',
  account: '12345678916',
  password: '123456'
}, {
  name: '测试父用户7',
  account: '12345678917',
  password: '123456'
}];

const user: any = {
  name: '测试用户',
  account: '12345678910',
  password: '123456'
};

let success_oid;
let fail_oid;
let room_id;
let packet_id;

function getCookie (result){
  return result.headers['set-cookie'].shift();
}

describe('controller/player/user.ts', () => {

  describe('用户注册', () => {
    it('/player/user/register', async () => {
      let result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[0].account})
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[0],
          code: response.data.code
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[0], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[1].account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[1],
          code: response.data.code,
          share: parents[0].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[1], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[2].account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[2],
          code: response.data.code,
          share: parents[1].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[2], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[3].account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[3],
          code: response.data.code,
          share: parents[2].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[3], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[4].account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[4],
          code: response.data.code,
          share: parents[3].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[4], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[5].account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[5],
          code: response.data.code,
          share: parents[4].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[5], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: parents[6].account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...parents[6],
          code: response.data.code,
          share: parents[5].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(parents[6], response.data);

      result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: user.account})
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      result = await app.httpRequest()
        .post('/player/user/register')
        .set('cookie', getCookie(result))
        .send({
          ...user,
          code: response.data.code,
          share: parents[6].share
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(user, response.data);

      user.cookie = getCookie(result);
    });
  });

  describe('用户操作', () => {
    it('/player/user/login by password', async () => {
      let result = await app.httpRequest()
        .post('/player/user/login')
        .send({
          account: user.account,
          password: user.password
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);

      user.cookie = getCookie(result);
    });

    it('/player/user/login by code', async () => {
      let result = await app.httpRequest()
        .post('/player/user/auth')
        .send({account: user.account})
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);

      result = await app.httpRequest()
        .post('/player/user/login')
        .set('cookie', getCookie(result))
        .send({
          account: user.account,
          code: response.data.code
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);

      user.cookie = getCookie(result);
    });

    it('/player/user', async () => {
      let result = await app.httpRequest()
        .get('/player/user')
        .set('cookie', user.cookie)
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });

    it('/player/user/update', async () => {
      let result = await app.httpRequest()
        .post('/player/user/update')
        .set('cookie', user.cookie)
        .send({
          name: '修改名称' + Date.now()
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });

    it('/player/user/password by password', async () => {
      let result = await app.httpRequest()
        .post('/player/user/password')
        .set('cookie', user.cookie)
        .send({
          password: user.password,
          newPassword: user.password
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });


    it('/player/user/password by code', async () => {
      let result = await app.httpRequest()
        .post('/player/user/auth')
        .set('cookie', user.cookie)
        .send({account: user.account})
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);

      result = await app.httpRequest()
        .post('/player/user/password')
        .set('cookie', user.cookie)
        .send({
          code: response.data.code,
          newPassword: user.password
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
    });

    it('/player/user/share', async () => {
      let result = await app.httpRequest()
        .get('/player/user/share')
        .set('cookie', user.cookie)
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });

    // it('/player/user/logout', async () => {
    //   let result = await app.httpRequest()
    //     .get('/player/user/logout')
    //     .set('cookie', user.cookie)
    //     .expect(200);
    //   let response = JSON.parse(result.text);
    //   assert(response.code === 200);
    // });
  });

  describe('充值', () => {
    // router.get('/player/recharge/balance', controller.player.recharge.balance);
    // router.post('/player/recharge/submit', controller.player.recharge.submit);
    // router.post('/player/recharge/payback', controller.player.recharge.payback);
    // router.post('/player/withdraw/submit', controller.player.withdraw.submit);

    it('/player/recharge/balance', async () => {
      let result = await app.httpRequest()
        .get('/player/recharge/balance')
        .set('cookie', user.cookie)
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });

    it('/player/recharge/submit', async () => {
      let result = await app.httpRequest()
        .post('/player/recharge/submit')
        .set('cookie', user.cookie)
        .send({
          award: 1000
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
      success_oid = response.data.oid;

      result = await app.httpRequest()
        .post('/player/recharge/submit')
        .set('cookie', user.cookie)
        .send({
          award: 1000
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
      fail_oid = response.data.oid;
    });
  });

  describe('充值回调', () => {
    it('/player/recharge/payback', async () => {
      let result = await app.httpRequest()
        .post('/player/recharge/payback')
        .set('cookie', user.cookie)
        .send({
          oid: success_oid,
          status: 1
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);

      result = await app.httpRequest()
        .post('/player/recharge/payback')
        .set('cookie', user.cookie)
        .send({
          oid: fail_oid,
          status: 0
        })
        .expect(200);
      response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });

  describe('提现', () => {
    it('/player/withdraw/submit', async () => {
      let result = await app.httpRequest()
        .post('/player/withdraw/submit')
        .set('cookie', user.cookie)
        .send({
          award: 500
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });

  // router.post('/player/room/list', controller.player.room.list);
  // router.post('/player/packet', controller.player.packet.index);
  // router.post('/player/packet/list', controller.player.packet.list);
  // router.post('/player/packet/send', controller.player.packet.send);
  // router.post('/player/packet/open', controller.player.packet.open);

  describe('房间列表', () => {
    it('/player/room/list', async () => {
      let result = await app.httpRequest()
        .post('/player/room/list')
        .set('cookie', user.cookie)
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
      room_id = response.data[0].id;
    });
  });

  describe('发红包', () => {
    it('/player/packet/send', async () => {
      let result = await app.httpRequest()
        .post('/player/packet/send')
        .set('cookie', user.cookie)
        .send({
          room_id: room_id,
          award: 100,
          lei: 5
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });

  describe('红包列表', () => {
    it('/player/packet/list', async () => {
      let result = await app.httpRequest()
        .post('/player/packet/list')
        .set('cookie', user.cookie)
        .send({
          room_id: room_id
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
      packet_id = response.data[0].id;
    });
  });

  describe('抢红包', () => {
    it('/player/packet/open', async () => {
      let result = await app.httpRequest()
        .post('/player/packet/open')
        .set('cookie', user.cookie)
        .send({
          id: packet_id,
          award: 1000
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });
});
