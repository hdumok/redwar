// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import ManageRoom from '../../../app/controller/manage/room';
import PlayerPacket from '../../../app/controller/player/packet';
import PlayerRecharge from '../../../app/controller/player/recharge';
import PlayerRoom from '../../../app/controller/player/room';
import PlayerTransaction from '../../../app/controller/player/transaction';
import PlayerUser from '../../../app/controller/player/user';
import PlayerWithdraw from '../../../app/controller/player/withdraw';

declare module 'egg' {
  interface IController {
    manage: {
      room: ManageRoom;
    };
    player: {
      packet: PlayerPacket;
      recharge: PlayerRecharge;
      room: PlayerRoom;
      transaction: PlayerTransaction;
      user: PlayerUser;
      withdraw: PlayerWithdraw;
    };
  }
}
