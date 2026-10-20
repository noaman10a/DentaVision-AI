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
    height: 900,
    show: false,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  try {
    // 1. Load login page
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(1500);

    // 2. Perform Doctor login
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

    // 3. Navigate to workspace
    await win.webContents.executeJavaScript(`window.location.hash = '#/workspace';`);
    await sleep(2000);

    // 4. Click the 'Prescriptions' tab
    await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const rxBtn = buttons.find(b => b.textContent.includes('Prescriptions'));
        if (rxBtn) rxBtn.click();
      })();
    `);
    await sleep(1500);

    // 5. Capture Prescription screen
    const rxImg = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_5_prescription_module.png'), rxImg.toPNG());
    console.log('✅ Captured screen_5_prescription_module.png successfully!');

    // 6. Click 'Diagnostic Reports' tab
    await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const repBtn = buttons.find(b => b.textContent.includes('Diagnostic Reports'));
        if (repBtn) repBtn.click();
      })();
    `);
    await sleep(1500);

    // 7. Capture Diagnostic Report screen
    const repImg = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_6_diagnostic_report_v1.png'), repImg.toPNG());
    console.log('✅ Captured screen_6_diagnostic_report_v1.png successfully!');

  } catch (err) {
    console.error('❌ Error capturing screens:', err);
  } finally {
    app.quit();
  }
});
