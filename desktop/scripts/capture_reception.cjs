const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outputDir = path.resolve(__dirname, '../../docs/presentation/verification');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  try {
    console.log('📸 Navigating to login...');
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(1500);

    console.log('🔑 Logging in as Receptionist...');
    await win.webContents.executeJavaScript(`
      const setReactValue = (input, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const emailInput = document.querySelectorAll('input')[0];
      const passInput = document.querySelectorAll('input')[1];
      setReactValue(emailInput, 'reception@dentavision.ai');
      setReactValue(passInput, 'password123');
      document.querySelector('button[type="submit"]').click();
    `);
    await sleep(2500);

    // 1. Reception Dashboard
    console.log('📸 Capturing Reception Dashboard (#/reception)...');
    let image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_4_reception_queue.png'), image.toPNG());
    console.log('✅ Captured verify_4_reception_queue.png');

    // 2. Patient Registration Page
    console.log('📸 Navigating to Register Patient (#/reception/register)...');
    await win.webContents.executeJavaScript(`
      window.location.hash = '#/reception/register';
    `);
    await sleep(2000);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_5_patient_registration.png'), image.toPNG());
    console.log('✅ Captured verify_5_patient_registration.png');

    // 3. Search Patients Page (Receptionist view)
    console.log('📸 Navigating to Search Patients (#/reception/search)...');
    await win.webContents.executeJavaScript(`
      window.location.hash = '#/reception/search';
    `);
    await sleep(2000);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_6_reception_search.png'), image.toPNG());
    console.log('✅ Captured verify_6_reception_search.png');

    console.log('🎉 Receptionist captures finished!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
