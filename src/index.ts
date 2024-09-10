import {  Argv, Context, h, Schema } from 'koishi'
import { DianFeiService } from './Service/DianFeiService';

export const name = 'dianfei'
export const inject = {
  required: ['puppeteer']
}
export interface Config {
  url:string,
  user:string,
  pwd:string
}

export const Config: Schema<Config> = Schema.object({
  url: Schema.string().description(''),
  user: Schema.string().required().description('用户名'),
  pwd: Schema.string().required().description('密码')
})

const dfs:DianFeiService=new DianFeiService();
export function apply(ctx: Context,config:Config) {
  // write your plugin here
  ctx.command('dianfei', '电费')
  .action((_) => getDianFeiImg(_,ctx,config))
}

async function getDianFeiImg(argv:Argv,ctx: Context,config: Config){
  argv.session.send('我去查了,稍等哦');
  return h.image(await dfs.getDianFeiImg(ctx,config.url,config.user,config.pwd), 'image/png')
}