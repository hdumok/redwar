import * as assert from 'assert';
import { app } from 'egg-mock/bootstrap';

const admin: any = {
};
const room: any = {
  name: '测试红包房间',
  award: 10000
};

function getCookie (result){
  return result.headers['set-cookie'].shift();
}

describe('controller/manage/room.ts', () => {

  describe('创建房间', () => {
    it('/manage/room/add', async () => {
      let result = await app.httpRequest()
        .post('/manage/room/add')
        .send({
          name: room.name,
          award: room.award
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });

  describe('房间列表', () => {
    it('/manage/room/list', async () => {
      let result = await app.httpRequest()
        .post('/manage/room/list')
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
      Object.assign(room, response.data[0]);
    });
  });

  describe('房间充值', () => {
    it('/manage/room/recharge', async () => {
      let result = await app.httpRequest()
        .post('/manage/room/recharge')
        .send({
          id: room.id,
          award: 1000
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });

  describe('房间修改', () => {
    it('/manage/room/update', async () => {
      let result = await app.httpRequest()
        .post('/manage/room/update')
        .send({
          id: room.id,
          name: '修改的房间名称'
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });

  describe('房间删除', () => {
    it('/manage/room/delete', async () => {
      let result = await app.httpRequest()
        .post('/manage/room/delete')
        .send({
          id: room.id
        })
        .expect(200);
      let response = JSON.parse(result.text);
      assert(response.code === 200);
    });
  });
});
