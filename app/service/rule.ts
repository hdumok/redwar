import { Service } from 'egg';
import { TransactionValue } from '../model/transaction';

interface PacketItem {
  turns: number;
  award: number;
}

export default class RuleService extends Service {
  private store = this.app.redis.clients.get('cache');
  // 分配七个包
  public createPackets(award: number, lei: number, num: number = 7): PacketItem[] {
    const { ctx } = this;

    const array: number[] = [];
    let sum: number = 0;

    for (let i = 0; i < num; i++) {
      const n = Math.random();
      sum = sum + n;
      array.push(n);
    }

    array[num - 1] = award;

    for (let i = 0; i < num - 1; i++) {
      array[i] = ctx.helper.decimal((award * array[i]) / sum);

      // 首包不能为0
      if (i === 0) {
        if (this.checkPacket(array[i], lei) === TransactionValue.Lei) {
          array[i] = array[i] + 0.01;
        }
      }

      array[num - 1] = ctx.helper.decimal(array[num - 1] - array[i]);
    }

    return array.map((award, index) => ({
      turns: index + 1,
      award,
    }));
  }

  public async setPackets(id, packet_items: PacketItem[]): Promise<void> {
    await this.store.del(`packet:${id}`);
    await this.store.lpush(`packet:${id}`, ...packet_items.map(item => this.ctx.helper.stringifyObj(item)));
  }

  public async getPacket(id): Promise<PacketItem> {
    const packet_item = await this.store.rpop(`packet:${id}`);
    return this.ctx.helper.parseObj(packet_item);
  }

  public async setPacket(id, packet_item: PacketItem): Promise<void> {
    await this.store.lpush(`packet:${id}`, this.ctx.helper.stringifyObj(packet_item));
  }

  public checkPacket(award: number, lei: number): TransactionValue {
    const { ctx } = this;

    let value = TransactionValue.Normal;

    const array = ctx.helper
      .decimal(award)
      .toFixed(2)
      .replace('.', '')
      .split('');

    if (String(lei) === array[array.length - 1]) {
      value = TransactionValue.Lei;
    } else if (array.join('') === '001') {
      value = TransactionValue.Min;
    } else if ('0123456789'.indexOf(array.join('')) !== -1 || '9876543210'.indexOf(array.join('')) !== -1) {
      value = TransactionValue.ShunZi;
    } else if (Array.from(new Set(array)).length === 1) {
      value = TransactionValue.BaoZi;
    }

    this.logger.info(`check award: ${award} lei:${lei} value: ${value}`);

    return value;
  }
}
