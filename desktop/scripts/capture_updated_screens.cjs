const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outputDir = path.resolve(__dirname, '../../docs/presentation');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  console.log('🚀 Capturing updated screens via real login flow...');

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
    // 1. Clean Login Page
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(2000);
    let img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_0_login_clean.png'), img.toPNG());
    console.log('✅ Captured screen_0_login_clean.png');

    // 2. Perform Doctor Sign In via UI with valid password: password123
    await win.webContents.executeJavaScript(`
      (() => {
        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        const form = document.querySelector('form');
        
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(emailInput, 'doctor@dentavision.ai');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        nativeInputValueSetter.call(passInput, 'password123');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 200);
      })();
    `);
    await sleep(3000);

    // Capture Doctor Dashboard with Teeth Chart
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_1_doctor_with_teeth_chart.png'), img.toPNG());
    console.log('✅ Captured screen_1_doctor_with_teeth_chart.png');

    // 3. Navigate to Profile
    await win.webContents.executeJavaScript(`window.location.hash = '#/profile';`);
    await sleep(2000);
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_4_profile_clean.png'), img.toPNG());
    console.log('✅ Captured screen_4_profile_clean.png');

    // 4. Navigate to Reception Desk
    await win.webContents.executeJavaScript(`window.location.hash = '#/reception';`);
    await sleep(2000);
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_2_reception_clean.png'), img.toPNG());
    console.log('✅ Captured screen_2_reception_clean.png');

  } catch (err) {
    console.error('❌ Capture error:', err);
  } finally {
    app.quit();
  }
});
