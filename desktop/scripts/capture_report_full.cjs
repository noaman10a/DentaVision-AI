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
    height: 950,
    show: false,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  try {
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(1500);

    // Doctor login
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

    // Go to workspace and open report
    await win.webContents.executeJavaScript(`window.location.hash = '#/workspace';`);
    await sleep(2000);

    await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const repBtn = buttons.find(b => b.textContent.includes('Diagnostic Reports'));
        if (repBtn) repBtn.click();
      })();
    `);
    await sleep(1500);

    // Scroll down to reveal Doctor Impression & Clinical Attestation Footer
    await win.webContents.executeJavaScript(`
      (() => {
        const main = document.querySelector('main') || window;
        if (main.scrollTo) {
          main.scrollTo({ top: 400, behavior: 'instant' });
        }
        window.scrollTo(0, 400);
      })();
    `);
    await sleep(1000);

    // Capture Doctor Impression & Attestation
    const sigImg = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_7_report_signature_attestation.png'), sigImg.toPNG());
    console.log('✅ Captured screen_7_report_signature_attestation.png successfully!');

  } catch (err) {
    console.error('❌ Error generating report signature screenshot:', err);
  } finally {
    app.quit();
  }
});
