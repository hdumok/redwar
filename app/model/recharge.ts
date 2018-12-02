import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, STRING } from 'sequelize';
import Sequelize = require('sequelize');
import { UserAttributes, UserInstance } from './user';
export enum RechargeStatus {
  Normal = 0,
  Success = 1,
  Fail = 2
}

export interface RechargeAttributes {
  id?: number;
  status?: RechargeStatus;
  oid?: string,
  user_id?: number,
  cost_award?: number,
  award?: number,
  remark?: string,
  recharged?: string | Date | null;
  rejected?: string | Date | null;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
  user?: UserAttributes
}

export interface RechargeInstance extends Sequelize.Instance<RechargeAttributes>, RechargeAttributes{
  id: number;
  status: RechargeStatus;
  oid: string,
  user_id: number,
  cost_award: number,
  award: number,
  remark: string,
  recharged: string | Date | null;
  rejected: string | Date | null;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
  user?: UserInstance
}

interface RechargeModel extends Sequelize.Model<RechargeInstance, RechargeAttributes>{
}

export default (app: Application) => {

  const model = app.model.define(
    'recharge',
    {
      id: {type: INTEGER, primaryKey: true, autoIncrement: true },
      status: { type: INTEGER, allowNull: true, defaultValue: RechargeStatus.Normal},
      oid: { type: STRING(255), allowNull: false, defaultValue: '', unique: true},
      user_id: { type: INTEGER, allowNull: false},
      cost_award: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      award: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      remark: {type: STRING(128), allowNull: false, defaultValue: '' },
      recharged: { type: DATE, allowNull: true },
      rejected: { type: DATE, allowNull: true },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true }
    },
    {
      tableName: app.config.prefix + 'recharge'
    }
  ) as RechargeModel;

  model.associate = () => {
    app.model.Recharge.belongsTo(app.model.User, { constraints: false });
  };

  // model.sync({
  //   force: app.config.env === 'unittest'
  // });

  return model;
};