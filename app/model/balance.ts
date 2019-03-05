import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, STRING } from 'sequelize';

import Sequelize = require('sequelize');

export interface BalanceAttributes {
  id?: string;
  award: number;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
}

export interface BalanceInstance extends Sequelize.Instance<BalanceAttributes>, BalanceAttributes {
  id: string;
  award: number;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
}

interface BalanceModel extends Sequelize.Model<BalanceInstance, BalanceAttributes> {
  test(): Promise<any>;
}

export default (app: Application) => {
  const model = app.model.define(
    'balance',
    {
      id: { type: STRING, primaryKey: true },
      award: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true },
    },
    {
      tableName: app.config.prefix + 'balance',
    },
  ) as BalanceModel;

  // model.sync({
  //   force: app.config.env === 'unittest'
  // });

  return model;
};
