import { Context, Service } from 'egg';

interface AwardConfig {
  spical: number;
  lei: number[];
}

export default class ConfigService extends Service {
  private packet_duration = 60;
  private award_present: number[] = [ 0.08, 0.08, 0.08, 0.06, 0.03, 0.03, 0.03 ];
  private award_1030: AwardConfig = {
    spical: 1.11,
    lei: [ 0, 0, 0, 3.33, 6.66, 26.66, 66.66, 166.66 ],
  };
  private award_3060: AwardConfig = {
    spical: 6.66,
    lei: [ 0, 0, 0, 6.66, 18.88, 66.66, 166.66, 888 ],
  };

  constructor(ctx: Context) {
    super(ctx);

    // TODO zookeeper实现
  }

  public async getPacketDuration() {
    const config = await this.getCacheConfig('packet_duration');
    if (config) {
      this.packet_duration = config;
    }

    return this.packet_duration;
  }
  public async getAwardPresent() {
    const config = await this.getCacheConfig('award_present');
    if (config) {
      this.award_present = config;
    }

    return this.award_present;
  }
  public async getAward1030() {
    const { ctx } = this;

    const config = await this.getCacheConfig('award_1030');
    if (config) {
      this.award_1030 = config;
    }

    return this.award_1030;
  }
  public async getAward3060() {
    const config = await this.getCacheConfig('award_1030');
    if (config) {
      this.award_3060 = config;
    }

    return this.award_3060;
  }
  private async getCacheConfig(key) {
    const config = await this.ctx.app.cache.get(
      key,
      async () => {
        try {
          await this.ctx.model.Config.findOne({
            attributes: [ 'value' ],
            where: { key },
            raw: true,
          });
        } catch (e) {
          this.ctx.logger.error(e);
        }
      },
      60,
    );

    return config && config.value;
  }
}
