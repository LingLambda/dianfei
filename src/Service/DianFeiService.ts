import { Context, h } from "koishi";
import "koishi-plugin-puppeteer";
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const SinputUser =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input";
const SinputPwd =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input";
const Sbutton =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button";
//已用电
const Selectricity =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(1) > uni-view.padding.bg-white > uni-view > uni-view:nth-child(1) > uni-view.cmd-progress.cmd-progress-default.cmd-progress-status-success.cmd-progress-show-info.cmd-progress-circle.cmd-progress-status-normal > uni-view > uni-view > uni-text.cmd-progress-text";
//余额
const Sbalance =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(1) > uni-view.padding.bg-white > uni-view > uni-view:nth-child(2) > uni-view.cmd-progress.cmd-progress-default.cmd-progress-status-success.cmd-progress-show-info.cmd-progress-circle.cmd-progress-status-normal > uni-view > uni-view > uni-text.cmd-progress-text";

const SNO =
  "body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(1) > uni-view.stitle > uni-view > uni-text:nth-child(1)";
export class DianFeiService {
  async getPage(
    ctx: Context,
    url: string,
    user: string,
    pwd: string,
    getImage: boolean
  ): Promise<any> {
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
        if (url.at(-1) === "/") {
          url = url.slice(0, -1);
        }
        if (page.url() !== url + "/pages/index/index") {
          await page.waitForSelector(SinputUser);
          l.info("登录元素存在");
          await page.waitForSelector(SinputUser);
          await page.type(SinputUser, user);

          await page.waitForSelector(SinputPwd);
          await page.type(SinputPwd, pwd);

          await sleep(1500);
          await page.click(Sbutton);
          await page.waitForNavigation();
          if (page.url() !== url + "/pages/index/index") {
            l.info("登录失败,重试");
            continue;
          }
        }
        l.info("登录完成,等待页面元素加载");
        let textInfo = {
          electricity: "", // 已用电
          balance: "", //余额
          No: "",
        };
        for (let i = 0; i < 60; i++) {
          await sleep(500);
          textInfo.electricity = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element.textContent;
          }, Selectricity);
          if (textInfo.electricity === "_ _._ _") {
            l.info("等待已用电元素加载");
            continue;
          }
          l.info("已用电加载完毕");
          if (!getImage) {
            textInfo.balance = await page.evaluate((sel) => {
              const element = document.querySelector(sel);
              return element.textContent;
            }, Sbalance);
            textInfo.No = await page.evaluate((sel) => {
              const element = document.querySelector(sel);
              return element.textContent;
            }, SNO);
            await page.close();
            return textInfo;
          }
          await page.close();
          break;
        }
      } catch (error) {
        l.error("发生错误" + error + "，重试");
        await page.close();
        continue;
      }
      const screenshotData = await page.screenshot({ fullPage: true });
      l.info("截图完成");
      await page.close();
      return h.image(screenshotData, "image/png");
    }
    await page.close();
    l.error("超时退出");
    return "请求超时";
  }
}
