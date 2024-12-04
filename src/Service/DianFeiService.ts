import { Context, h } from "koishi";
import "koishi-plugin-puppeteer";
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const inputUser =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input";
const inputPwd =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input";
const button =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button";
const total =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(1) > uni-view.padding.bg-white > uni-view > uni-view:nth-child(1) > uni-view.cmd-progress.cmd-progress-default.cmd-progress-status-success.cmd-progress-show-info.cmd-progress-circle.cmd-progress-status-normal > uni-view > uni-view > uni-text.cmd-progress-text > span";

export class DianFeiService {
  async getDianFeiImg(ctx: Context, url: string, user: string, pwd: string) {
    const l = ctx.logger("dianfei");

    let page = await ctx.puppeteer.browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    );
    for (let i = 0; i <= 3; i++) {
      await page.goto(url, {
        waitUntil: "networkidle2", // 等待加载完毕
      });
      l.info("加载登录完成");
      try {
        await page.waitForSelector(inputUser, { timeout: 2000 }); // 设置 2 秒超时
        l.info("登录元素存在");
        await page.waitForSelector(inputUser);
        await page.type(inputUser, user);

        await page.waitForSelector(inputPwd);
        await page.type(inputPwd, pwd);

        await sleep(1500);
        await page.click(button);
        await page.waitForNavigation();
        if (page.url() !== url + "/pages/index/index") {
          l.info("登录失败,重试中");
          continue;
        }

        l.info("登录完成,等待页面元素加载");
        let balance;
        for (let i = 0; i < 60; i++)  {
          await sleep(500);
          balance = await page.$eval(total, (element) => element);
          l.debug("余额元素" + balance);
        }
        const regex = /\d+:\d+/;
        // TODO: 超时
      } catch (error) {
        l.error("发生错误" + error + "，重试");
      }
      const screenshotData = await page.screenshot({ fullPage: true });
      l.info("截图完成");
      await page.close();
      return h.image(screenshotData, "image/png");
    }
    l.error("超时退出");
    return "请求超时";
  }
}
