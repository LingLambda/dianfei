import {  Context, h, Schema } from 'koishi'
import { DianFeiService } from './Service/DianFeiService';

export const name = 'dianfei'
export const inject = {
}
export interface Config {
  user:string,
  pwd:string
}

export const Config: Schema<Config> = Schema.object({
  user: Schema.string().required().description('用户名'),
  pwd: Schema.string().required().description('密码')
})

const dfs:DianFeiService=new DianFeiService();
export function apply(ctx: Context,config:Config) {
  // write your plugin here
  ctx.command('dianfei', '电费')
  .action((argv) => getDianFeiImg(config))
}

async function getDianFeiImg(config: Config){

  return h.image(await dfs.getDianFeiImg(config.user,config.pwd), 'image/png')
}