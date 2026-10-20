const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outputDir = path.resolve(__dirname, '../../docs/presentation');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 1800,
    show: false,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  try {
    // 1. Login
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(1500);

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
    await sleep(2500);

    // 2. Go to workspace
    await win.webContents.executeJavaScript(`window.location.hash = '#/workspace';`);
    await sleep(3000);

    // Capture the entire view
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_3_workspace_full.png'), img.toPNG());
    console.log('✅ Captured screen_3_workspace_full.png successfully!');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    app.quit();
  }
});
