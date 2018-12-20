// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportManageRoom from '../../../app/controller/manage/room';
import ExportPlayerPacket from '../../../app/controller/player/packet';
import ExportPlayerRecharge from '../../../app/controller/player/recharge';
import ExportPlayerRoom from '../../../app/controller/player/room';
import ExportPlayerTransaction from '../../../app/controller/player/transaction';
import ExportPlayerUser from '../../../app/controller/player/user';
import ExportPlayerWithdraw from '../../../app/controller/player/withdraw';

declare module 'egg' {
  interface IController {
    manage: {
      room: ExportManageRoom;
    }
    player: {
      packet: ExportPlayerPacket;
      recharge: ExportPlayerRecharge;
      room: ExportPlayerRoom;
      transaction: ExportPlayerTransaction;
      user: ExportPlayerUser;
      withdraw: ExportPlayerWithdraw;
    }
  }
}
