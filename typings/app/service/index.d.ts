// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportConfig from '../../../app/service/config';
import ExportRule from '../../../app/service/rule';
import ExportSession from '../../../app/service/session';
import ExportSms from '../../../app/service/sms';

declare module 'egg' {
  interface IService {
    config: ExportConfig;
    rule: ExportRule;
    session: ExportSession;
    sms: ExportSms;
  }
}
