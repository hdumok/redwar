// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import Config from '../../../app/service/config';
import Excel from '../../../app/service/excel';
import Rule from '../../../app/service/rule';
import Session from '../../../app/service/session';
import Sms from '../../../app/service/sms';

declare module 'egg' {
  interface IService {
    config: Config;
    excel: Excel;
    rule: Rule;
    session: Session;
    sms: Sms;
  }
}
