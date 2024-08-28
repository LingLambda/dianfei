import {  Context, h, Schema } from 'koishi'
import { DianFeiService } from './Service/DianFeiService';

export const name = 'dianfei'
export const inject = {
}
export interface Config {}

export const Config: Schema<Config> = Schema.object({})

const dfs:DianFeiService=new DianFeiService();
export function apply(ctx: Context) {
  // write your plugin here
  ctx.command('dianfei', '电费')
  .action((argv) => getDianFeiImg())
}

async function getDianFeiImg(){
  return h.image(await dfs.getDianFeiImg(), 'image/png')
}