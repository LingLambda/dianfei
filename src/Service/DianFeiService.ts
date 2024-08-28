import puppeteer, { Page } from 'puppeteer';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export class DianFeiService{
   async getDianFeiImg(){
        // 启动浏览器
        const browser = await puppeteer.launch({ headless: false }); // 设为 false 以查看操作
        const page: Page = await browser.newPage();
    
        // 访问登录页面
        await page.goto('http://pay.czrxdzonline.cn/wxms/', { waitUntil: 'networkidle0' });
    
        // 输入手机号
        await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input');
        await page.type('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input', '15587875682');
    
        // 输入密码
        await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input');
        await page.type('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input', '1514671906');
    
        await sleep(1000);
    
        // 点击登录按钮
        await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button');
        await page.click('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button');
    
        await page.waitForNavigation();
    
        await sleep(8000);
    
        // 截图
        const screenshotData=await page.screenshot({ fullPage: true });
        
        // 关闭浏览器
        await browser.close();
        return screenshotData
    }
}