import puppeteer, { Page } from 'puppeteer';

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export class DianFeiService{
   async getDianFeiImg(user:string,pwd:string){
        const browser = await puppeteer.launch({args:['--no-sandbox', '--disable-setuid-sandbox'], headless: true }); // 设为 false 会导致无图形界面的bug
        const page: Page = await browser.newPage();
    
        await page.goto('http://pay.czrxdzonline.cn/wxms/', { waitUntil: 'networkidle0' });
    
        await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input');
        await page.type('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(2) > uni-view > uni-input > div > input', user);
    
        await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input');
        await page.type('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-view:nth-child(3) > uni-view > uni-input > div > input', pwd);
    
        await sleep(1000);
    
        await page.waitForSelector('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button');
        await page.click('body > uni-app > uni-page > uni-page-wrapper > uni-page-body > uni-view > uni-button');
    
        await page.waitForNavigation();
    
        await sleep(8000);
    
        const screenshotData=await page.screenshot({ fullPage: true });
        
        await browser.close();
        return screenshotData
    }
}