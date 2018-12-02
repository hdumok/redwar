import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, STRING } from 'sequelize';
import Sequelize = require('sequelize');

export interface HistoryAttributes {
  id?: number;
  user_id?: number;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
}

export interface HistoryInstance extends Sequelize.Instance<HistoryAttributes>, HistoryAttributes{
  id: number;
  user_id: number;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
}

interface HistoryModel extends Sequelize.Model<HistoryInstance, HistoryAttributes>{
  test (): Promise<any>
}

export default (app: Application) => {

  const model = app.model.define(
    'history',
    {
      id: {type: INTEGER, primaryKey: true, autoIncrement: true},
      user_id: { type: INTEGER, allowNull: true },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true }
    },
    {
      tableName: app.config.prefix + 'history'
    }
  ) as HistoryModel;


  model.associate = () => {
    app.model.History.belongsTo(app.model.User, { constraints: false });
  };

  // model.sync({
  //   force: app.config.env === 'unittest'
  // });

  return model;
};
