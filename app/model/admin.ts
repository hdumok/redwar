import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, STRING } from 'sequelize';

import Sequelize = require('sequelize');

export enum AdminRole {
  Admin = 'admin',
}

export interface AdminAttributes {
  id?: string;
  role?: AdminRole;
  name?: string;
  account?: string;
  password?: string;
  token?: string;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
}

export interface AdminInstance extends Sequelize.Instance<AdminAttributes>, AdminAttributes {
  id: string;
  role: AdminRole;
  name: string;
  account: string;
  password: string;
  token: string;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
}

interface AdminModel extends Sequelize.Model<AdminInstance, AdminAttributes> {}
export default (app: Application) => {
  const model = app.model.define(
    'admin',
    {
      id: { type: STRING, primaryKey: true },
      role: { type: STRING, allowNull: false, defaultValue: '' },
      name: { type: STRING, allowNull: false, defaultValue: '' },
      account: {
        type: STRING,
        allowNull: false,
        defaultValue: '',
        unique: true,
      },
      password: { type: STRING, allowNull: false, defaultValue: '' },
      token: { type: STRING, allowNull: false, defaultValue: '' },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true },
    },
    {
      tableName: app.config.prefix + 'admin',
    },
  ) as AdminModel;

  // model.sync({
  //   force: app.config.env === 'unittest'
  // });

  return model;
};
