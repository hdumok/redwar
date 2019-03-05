import { Application } from 'egg';
import { DATE, DECIMAL, INTEGER, STRING } from 'sequelize';

import Sequelize = require('sequelize');

const tables: any = {};
const start = 1000;
const step = 100;

export interface SequenceAttributes {
  table?: string;
  min_id?: number;
  max_id?: number;
  step?: number;
  updatedAt?: string | Date | null;
  createdAt?: string | Date | null;
  deletedAt?: string | Date | null;
}

export interface SequenceInstance extends Sequelize.Instance<SequenceAttributes>, SequenceAttributes {
  table: string;
  min_id: number;
  max_id: number;
  step: number;
  updatedAt: string | Date | null;
  createdAt: string | Date | null;
  deletedAt: string | Date | null;
}

interface SequenceModel extends Sequelize.Model<SequenceInstance, SequenceAttributes> {
  getId(tableName: string): Promise<any>;
  setId(instance, options?): Promise<any>;
}

export default (app: Application) => {
  const model = app.model.define(
    'sequence',
    {
      table: { type: STRING, primaryKey: true },
      min_id: { type: INTEGER, allowNull: false, defaultValue: start },
      max_id: { type: INTEGER, allowNull: false, defaultValue: start + step - 1 },
      step: { type: INTEGER, allowNull: false, defaultValue: step },
      updatedAt: { type: DATE, allowNull: true },
      createdAt: { type: DATE, allowNull: true },
      deletedAt: { type: DATE, allowNull: true },
    },
    {
      tableName: app.config.prefix + 'sequence',
    },
  ) as SequenceModel;

  // model.sync({
  //   force: app.config.env === 'unittest',
  // });

  model.getId = async tableName => {
    const instance = {
      id: null,
      _modelOptions: {
        tableName,
      },
    };
    await app.model.Sequence.setId(instance);
    return instance.id;
  };

  model.setId = async (instance, options?) => {
    const instances = Array.isArray(instance) ? instance : [ instance ];
    const table = instances[0]._modelOptions.tableName;

    let index = 0;
    do {
      // ID 生成器
      if (instances[index].id !== null) {
        index++;
        continue;
      }

      if (!tables[table]) {
        const [ sequence, created ] = await app.model.Sequence.findOrCreate({
          where: {
            table,
          },
        });
        if (!created) {
          // 刷新再ID生成器表里的当前最大已分配Id区间
          await sequence.increment({
            min_id: sequence.step,
            max_id: sequence.step,
          });
        }

        tables[table] = sequence;
      }

      if (tables[table].min_id > tables[table].max_id) {
        await tables[table].increment({
          min_id: tables[table].step,
          max_id: tables[table].step,
        });
      }

      instances[index++].id = tables[table].min_id;
      tables[table].min_id++;
    } while (index < instances.length);
  };

  return model;
};
