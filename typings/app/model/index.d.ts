// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAdmin from '../../../app/model/admin';
import ExportBalance from '../../../app/model/balance';
import ExportConfig from '../../../app/model/config';
import ExportHistory from '../../../app/model/history';
import ExportPacket from '../../../app/model/packet';
import ExportRecharge from '../../../app/model/recharge';
import ExportRelation from '../../../app/model/relation';
import ExportRoom from '../../../app/model/room';
import ExportTransaction from '../../../app/model/transaction';
import ExportUser from '../../../app/model/user';
import ExportWithdraw from '../../../app/model/withdraw';

declare module 'sequelize' {
  interface Sequelize {
    Admin: ReturnType<typeof ExportAdmin>;
    Balance: ReturnType<typeof ExportBalance>;
    Config: ReturnType<typeof ExportConfig>;
    History: ReturnType<typeof ExportHistory>;
    Packet: ReturnType<typeof ExportPacket>;
    Recharge: ReturnType<typeof ExportRecharge>;
    Relation: ReturnType<typeof ExportRelation>;
    Room: ReturnType<typeof ExportRoom>;
    Transaction: ReturnType<typeof ExportTransaction>;
    User: ReturnType<typeof ExportUser>;
    Withdraw: ReturnType<typeof ExportWithdraw>;
  }
}
