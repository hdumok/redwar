// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import Interface from '../../../app/middleware/interface';

declare module 'egg' {
  interface IMiddleware {
    interface: typeof Interface;
  }
}
