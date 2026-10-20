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
    await sleep(1500);
    let img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_0_login_clean.png'), img.toPNG());
    console.log('✅ Captured screen_0_login_clean.png');

    // 2. Perform Doctor Sign In via UI with valid credentials
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

    // Capture Clean Doctor Dashboard (No Teeth Chart here anymore)
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_1_doctor_dashboard_clean.png'), img.toPNG());
    console.log('✅ Captured screen_1_doctor_dashboard_clean.png');

    // 3. Navigate to Patient Workspace
    await win.webContents.executeJavaScript(`window.location.hash = '#/workspace';`);
    await sleep(2500);

    // 3A. Radiograph view (Top of page)
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_3a_radiograph_view.png'), img.toPNG());
    console.log('✅ Captured screen_3a_radiograph_view.png');

    // 3B. Scroll down to show Odontogram Heat Chart directly below the X-Ray
    await win.webContents.executeJavaScript(`
      (() => {
        const vp = document.querySelector('.page-viewport');
        if (vp) vp.scrollTop = 580;
      })();
    `);
    await sleep(1000);
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_3b_odontogram_heat_chart.png'), img.toPNG());
    console.log('✅ Captured screen_3b_odontogram_heat_chart.png');

    // 4. Open Modify Finding Modal
    await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const modifyBtn = buttons.find(b => b.textContent.trim() === 'Modify' || b.textContent.includes('Modify'));
        if (modifyBtn) modifyBtn.click();
      })();
    `);
    await sleep(1200);
    img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_3c_modify_finding_modal.png'), img.toPNG());
    console.log('✅ Captured screen_3c_modify_finding_modal.png');

  } catch (err) {
    console.error('❌ Capture error:', err);
  } finally {
    app.quit();
  }
});
