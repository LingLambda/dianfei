import { Argv, Context, Schema } from "koishi";
import { DianFeiService } from "./Service/DianFeiService";
import {} from "koishi-plugin-cron";

export const name = "dianfei";
export const inject = {
  required: ["puppeteer", "cron"],
};

export interface Config {
  url?: string;
  user?: string;
  pwd?: string;
  imageMode?: boolean;
  warnValue?: number;
  broadArray?: Array<{ adapter: string; botId: string; groupId: string }>;
}

declare module "koishi" {
  interface Events {
    // 方法名称对应自定义事件的名称
    // 方法签名对应事件的回调函数签名
    "dianfei/electricity-detection"(massage: string): void;
  }
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    url: Schema.string().description(""),
    user: Schema.string().required().description("用户名"),
    pwd: Schema.string().role("secret").required().description("密码"),
    warnValue: Schema.number().default(5),
    imageMode: Schema.boolean().default(true).description("图片模式"),
  }),
  Schema.object({
    broadArray: Schema.array(
      Schema.object({
        adapter: Schema.string().default("onebot").description("适配器名"),
        botId: Schema.string().default("552487878").description("机器人账号"),
        groupId: Schema.string().default("1145141919").description("群组号"),
      })
    ).role("table"),
  }),
]);

const dfs: DianFeiService = new DianFeiService();
export function apply(ctx: Context, config: Config) {
  ctx.command("电费", "查电费").action(async (_) => {
    await getDianFeiInfo(_, ctx, config);
  });

  try {
    //定时触发事件
    ctx.cron("0 12 * * *", async () => {
      ctx.emit("dianfei/electricity-detection", null);
    });
  } catch (error) {
    //捕获配置错误
    ctx.logger("dianfeiTimeConfig").error(error);
  }
  //响应事件
  ctx.on(
    "dianfei/electricity-detection",
    async () => await timerElectricity(ctx, config)
  );
}

async function getDianFeiInfo(argv: Argv, ctx: Context, config: Config) {
  argv.session.send("我去查了,稍等哦");
  const info = await dfs.getPage(
    ctx,
    config.url,
    config.user,
    config.pwd,
    config.imageMode
  );

  if (!config.imageMode) {
    argv.session.send(
      `======${info["No"]}====== \n 本月已用电：${info["electricity"]} 元 \n 余额：${info["balance"]}`
    );
    return;
  }
  return argv.session.send(info);
}

async function timerElectricity(ctx: Context, config: Config) {
  const textInfo = await dfs.getPage(
    ctx,
    config.url,
    config.user,
    config.pwd,
    false
  );
  if (textInfo["balance"] < config.warnValue) {
    ctx.logger("dianfei").info("发送电费预警");
    for (const broad of config.broadArray) {
      ctx.bots[`${broad.adapter}:${broad.botId}`].sendMessage(
        `${broad.groupId}`,
        `${textInfo["No"]}的电费仅剩${textInfo["balance"]}了哦!!`
      );
      ctx.sleep(3000);
    }
  }
}
