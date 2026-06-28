import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import path from 'path';

const viteProcess = exec('npx vite --port 5173', { cwd: process.cwd() });

setTimeout(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds for preloader
  
  const preloaderDisplay = await page.$eval('#preloader', el => el.style.display);
  const preloaderPercentText = await page.$eval('#preloader-percent', el => el.textContent);
  console.log('PRELOADER DISPLAY:', preloaderDisplay);
  console.log('PRELOADER PERCENT:', preloaderPercentText);
  
  await browser.close();
  viteProcess.kill();
  process.exit(0);
}, 3000);
