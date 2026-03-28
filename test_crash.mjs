import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });

  try {
    await page.goto('http://localhost:5174/');
    await page.waitForSelector('nav', { timeout: 5000 });
    console.log('Navigated to localhost:5174');
    
    // Find the button with text "Search & Booking"
    const buttons = await page.$$('button');
    let searchBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Search & Booking')) {
        searchBtn = btn;
        break;
      }
    }
    
    if (searchBtn) {
      console.log('Found Search & Booking button, clicking...');
      await searchBtn.click();
      await page.waitForTimeout(2000); // wait for 2s to catch error logs
    } else {
      console.log('Search & Booking button not found');
    }
    
  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
