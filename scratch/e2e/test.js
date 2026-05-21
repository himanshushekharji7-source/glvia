const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to https://glvia.com/admin...');
  try {
    await page.goto('https://glvia.com/admin', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err) {
    console.error('Failed to load live site:', err.message);
    console.log('\nTrying localhost instead...');
    try {
        await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    } catch (localErr) {
        console.error('Failed to load localhost too:', localErr.message);
        await browser.close();
        process.exit(1);
    }
  }

  console.log('Typing credentials...');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@glvia.com');
  
  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', 'admin123');

  console.log('Clicking login...');
  await page.click('button[type="submit"]');

  // Wait for either the dashboard to load (checking for sidebar) or an error message to appear
  try {
    const result = await Promise.race([
      page.waitForSelector('.bg-red-500\\/10', { timeout: 10000 }).then(() => 'error'),
      page.waitForFunction(() => !document.querySelector('button[type="submit"]'), { timeout: 10000 }).then(() => 'success'),
      page.waitForSelector('.material-icons-round:has-text("error")', { timeout: 10000 }).then(() => 'error')
    ]);

    if (result === 'error') {
      const errorText = await page.$eval('.bg-red-500\\/10', el => el.innerText).catch(() => 'Unknown Error');
      console.error('Login Failed with error:', errorText);
      await page.screenshot({ path: 'scratch/e2e/error.png' });
      console.log('Screenshot saved to scratch/e2e/error.png');
    } else {
      console.log('Login Succeeded! Dashboard loaded.');
      await page.screenshot({ path: 'scratch/e2e/success.png' });
      console.log('Screenshot saved to scratch/e2e/success.png');
    }
  } catch (err) {
    console.log('Timeout waiting for login result. Let us check the page text.');
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Invalid email or password')) {
      console.error('Login Failed with error: Invalid email or password');
    } else {
      console.log('Current page text:', bodyText.substring(0, 200));
    }
  }

  await browser.close();
})();
