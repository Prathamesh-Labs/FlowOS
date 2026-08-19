import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const screenshotsDir = path.resolve('Screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './tmp/puppeteer_user_data',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Standard desktop viewport for premium look
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to FlowOS...');
  await page.goto('https://prathamesh-labs.github.io/FlowOS/', { waitUntil: 'networkidle2' });
  await sleep(4000); // Allow extra time for layout and fonts to render

  // Load demo data
  console.log('Loading demo data...');
  await page.evaluate(() => {
    if (window.appState) {
      // Toggle demo clean mode or force load demo data
      const state = window.appState.getState();
      if (!state.goals || state.goals.length === 0) {
        window.appState.loadDemoData();
      }
    } else {
      console.error('window.appState not found!');
    }
  });
  await sleep(1500);

  // 1. NOW Command Center
  console.log('Capturing Screenshot 1: NOW Command Center...');
  await page.evaluate(() => {
    document.querySelector('a[data-tab="today"]').click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '01_NOW_Command_Center.png') });

  // 2. Reality Trigger
  console.log('Capturing Screenshot 2: Reality Trigger...');
  await page.evaluate(() => {
    document.querySelector('a[data-tab="adapt"]').click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '02_Reality_Trigger.png') });

  // 3. Adaptive Schedule
  console.log('Capturing Screenshot 3: Adaptive Schedule...');
  await page.evaluate(() => {
    document.querySelector('a[data-tab="today"]').click();
  });
  await sleep(500);
  await page.evaluate(() => {
    window.triggerLiveRealityRecalibrationDemo();
  });
  await sleep(2000); // wait for toast & confetti to render
  await page.screenshot({ path: path.join(screenshotsDir, '03_Adaptive_Schedule.png') });

  // 4. What-If Simulator
  console.log('Capturing Screenshot 4: What-If Simulator...');
  await page.evaluate(() => {
    // Go to adapt tab
    document.querySelector('a[data-tab="adapt"]').click();
  });
  await sleep(500);
  await page.evaluate(() => {
    openScenarioSimulator('spend-extra-hours-coding');
  });
  await sleep(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '04_What_If_Simulator.png') });

  // 5. Analytics / Day Replay
  console.log('Capturing Screenshot 5: Analytics / Day Replay...');
  await page.evaluate(() => {
    // Close simulator modal
    document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
    document.querySelector('a[data-tab="understand"]').click();
  });
  await sleep(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '05_Analytics_or_Day_Replay.png') });

  // 6. Focus Room
  console.log('Capturing Screenshot 6: Focus Room...');
  await page.evaluate(() => {
    document.querySelector('a[data-tab="study"]').click();
  });
  await sleep(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '06_Focus_Room.png') });

  // 7. AI / Voice
  console.log('Capturing Screenshot 7: AI / Voice...');
  await page.evaluate(() => {
    document.querySelector('a[data-tab="today"]').click();
  });
  await sleep(500);
  await page.evaluate(() => {
    window.voiceEngine.openAssistant();
  });
  await sleep(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '07_AI_or_Voice.png') });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
