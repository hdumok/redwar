// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportInterface from '../../../app/middleware/interface';

declare module 'egg' {
  interface IMiddleware {
    interface: typeof ExportInterface;
  }
}
