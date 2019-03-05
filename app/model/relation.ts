import { Application } from 'egg';
import { DATE, STRING } from 'sequelize';

import Sequelize = require('sequelize');

export interface RelationAttributes {
  id?: string;
  user_id?: string;
  parent1_id?: string;
  parent2_id?: string;
  parent3_id?: string;
  parent4_id?: string;
  parent5_id?: string;
  parent6_id?: string;
  parent7_id?: string;
  updated?: string | Date | null;
  created?: string | Date | null;
  deleted?: string | Date | null;
}

export interface RelationInstance extends Sequelize.Instance<RelationAttributes>, RelationAttributes {
  id: string;
  user_id: string;
  parent1_id: string;
  parent2_id: string;
  parent3_id: string;
  parent4_id: string;
  parent5_id: string;
  parent6_id: string;
  parent7_id: string;
  updated: string | Date | null;
  created: string | Date | null;
  deleted: string | Date | null;
}

interface RelationModel extends Sequelize.Model<RelationInstance, RelationAttributes> {}

export default (app: Application) => {
  const model = app.model.define(
    'relation',
    {
      id: { type: STRING, primaryKey: true },
      user_id: { type: STRING },
      parent1_id: { type: STRING, allowNull: true },
      parent2_id: { type: STRING, allowNull: true },
      parent3_id: { type: STRING, allowNull: true },
      parent4_id: { type: STRING, allowNull: true },
      parent5_id: { type: STRING, allowNull: true },
      parent6_id: { type: STRING, allowNull: true },
      parent7_id: { type: STRING, allowNull: true },
      updated: { type: DATE, allowNull: true },
      created: { type: DATE, allowNull: true },
      deleted: { type: DATE, allowNull: true },
    },
    {
      tableName: app.config.prefix + 'relation',
    },
  ) as RelationModel;

  model.associate = () => {
    app.model.Relation.belongsTo(app.model.User, { constraints: false });
  };

  // model.sync({
  //   force: app.config.env === 'unittest'
  // });

  return model;
};
