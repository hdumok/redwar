import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, JSONB, STRING } from 'sequelize';

import Sequelize = require('sequelize');

export interface ConfigAttributes {
  id?: string;
  key?: string;
  value?: string;
  remark?: string;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
}

export interface ConfigInstance extends Sequelize.Instance<ConfigAttributes>, ConfigAttributes {
  id: string;
  key: string;
  value: string;
  remark: string;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
}

interface ConfigModel extends Sequelize.Model<ConfigInstance, ConfigAttributes> {}

export default (app: Application) => {
  const model = app.model.define(
    'config',
    {
      id: { type: STRING, primaryKey: true },
      key: {
        type: STRING(255),
        allowNull: false,
        defaultValue: '',
        unique: true,
      },
      value: { type: JSONB, allowNull: false, defaultValue: '' },
      remark: { type: STRING(255), allowNull: false, defaultValue: '' },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true },
    },
    {
      tableName: app.config.prefix + 'config',
    },
  ) as ConfigModel;

  // model.sync({
  //   force: app.config.env === 'unittest'
  // });

  return model;
};
