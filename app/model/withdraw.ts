import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, STRING } from 'sequelize';
import { UserAttributes, UserInstance } from './user';

import Sequelize = require('sequelize');
export enum WithdrawStatus {
  Normal = 0,
  Success = 1,
  Fail = 2,
}

export interface WithdrawAttributes {
  id?: string;
  status?: WithdrawStatus;
  user_id?: string;
  cost_award?: number;
  award?: number;
  remark?: string;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
  user?: UserAttributes;
}

export interface WithdrawInstance extends Sequelize.Instance<WithdrawAttributes>, WithdrawAttributes {
  id: string;
  status: WithdrawStatus;
  user_id: string;
  cost_award: number;
  award: number;
  remark: string;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
  user?: UserInstance;
}

interface WithdrawModel extends Sequelize.Model<WithdrawInstance, WithdrawAttributes> {}

export default (app: Application) => {
  const model = app.model.define(
    'withdraw',
    {
      id: { type: STRING, primaryKey: true },
      status: { type: INTEGER, allowNull: false, defaultValue: WithdrawStatus.Normal },
      user_id: { type: STRING, allowNull: false },
      cost_award: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      award: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      remark: { type: STRING, allowNull: false, defaultValue: '' },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true },
    },
    {
      tableName: app.config.prefix + 'withdraw',
    },
  ) as WithdrawModel;

  model.associate = () => {
    app.model.Withdraw.belongsTo(app.model.User, { constraints: false });
  };

  model.sync({
    force: app.config.env === 'unittest',
  });

  return model;
};
