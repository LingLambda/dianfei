import { Context } from 'koishi';
import 'koishi-plugin-puppeteer'
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export class DianFeiService {
    async getDianFeiImg(ctx: Context, url: string, user: string, pwd: string) {
        let page = await ctx.puppeteer.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
        await page.goto(url, {
            waitUntil: 'networkidle2'  // 等待加载完毕
        });
        ctx.logger('dianfei').info('加载登录完成');
        await page.goto('http://pay.czrxdzonline.cn/wxms/', { waitUntil: 'networkidle0' });
        try {
            await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input', { timeout: 2000 }); // 设置 5 秒超时
            ctx.logger('dianfei').info('元素存在');
            await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input');
            await page.type('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input', user);

            await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input');
            await page.type('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input', pwd);

            await sleep(1500);

            await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button');
            await page.click('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button');
            ctx.logger('dianfei').info('登录完成');
            await page.waitForNavigation();
            await sleep(8000);
        } catch (error) {
            ctx.logger('dianfei').info('元素不存在');
            await sleep(6000);
        }
        const screenshotData = await page.screenshot({ fullPage: true });
        ctx.logger('dianfei').info('截图完成');
        await page.close();
        return screenshotData;
    }
}