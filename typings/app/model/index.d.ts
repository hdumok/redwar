// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import Admin from '../../../app/model/admin';
import Balance from '../../../app/model/balance';
import Config from '../../../app/model/config';
import History from '../../../app/model/history';
import Packet from '../../../app/model/packet';
import Recharge from '../../../app/model/recharge';
import Relation from '../../../app/model/relation';
import Room from '../../../app/model/room';
import Transaction from '../../../app/model/transaction';
import User from '../../../app/model/user';
import Withdraw from '../../../app/model/withdraw';

declare module 'sequelize' {
  interface Sequelize {
    Admin: ReturnType<typeof Admin>;
    Balance: ReturnType<typeof Balance>;
    Config: ReturnType<typeof Config>;
    History: ReturnType<typeof History>;
    Packet: ReturnType<typeof Packet>;
    Recharge: ReturnType<typeof Recharge>;
    Relation: ReturnType<typeof Relation>;
    Room: ReturnType<typeof Room>;
    Transaction: ReturnType<typeof Transaction>;
    User: ReturnType<typeof User>;
    Withdraw: ReturnType<typeof Withdraw>;
  }
}
