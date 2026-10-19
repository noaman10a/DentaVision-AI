const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outputDir = path.resolve(__dirname, '../../docs/presentation/verification');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  console.log('🚀 Running UI Verification Capture...');

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
    // 1. Login Page
    console.log('📸 1. Capturing Login Page (#/login)...');
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(1500);
    let image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_1_login_clean.png'), image.toPNG());
    console.log('✅ Captured verify_1_login_clean.png');

    // Perform real form login as Doctor using React 18 native input setter
    console.log('🔑 Logging in as Doctor...');
    await win.webContents.executeJavaScript(`
      const setReactValue = (input, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const emailInput = document.querySelectorAll('input')[0];
      const passInput = document.querySelectorAll('input')[1];
      setReactValue(emailInput, 'doctor@dentavision.ai');
      setReactValue(passInput, 'password123');
      document.querySelector('button[type="submit"]').click();
    `);
    await sleep(2500);

    // 2. Doctor Dashboard & Minimal Header
    console.log('📸 2. Capturing Doctor Dashboard (#/doctor)...');
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_2_doctor_minimal_header.png'), image.toPNG());
    console.log('✅ Captured verify_2_doctor_minimal_header.png');

    // 3. Profile Page
    console.log('📸 3. Navigating to Profile Page...');
    await win.webContents.executeJavaScript(`
      window.location.hash = '#/profile';
    `);
    await sleep(2000);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_3_profile_page.png'), image.toPNG());
    console.log('✅ Captured verify_3_profile_page.png');

    // Logout and perform login as Receptionist
    console.log('🔑 Logging out and logging in as Receptionist...');
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(1500);
    await win.webContents.executeJavaScript(`
      sessionStorage.clear();
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

    // 4. Reception Dashboard
    console.log('📸 4. Capturing Reception Dashboard (#/reception)...');
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_4_reception_queue.png'), image.toPNG());
    console.log('✅ Captured verify_4_reception_queue.png');

    // 5. Patient Registration Page
    console.log('📸 5. Capturing Patient Registration Page (#/reception/register)...');
    await win.webContents.executeJavaScript(`
      window.location.hash = '#/reception/register';
    `);
    await sleep(2000);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'verify_5_patient_registration.png'), image.toPNG());
    console.log('✅ Captured verify_5_patient_registration.png');

    console.log('🎉 All UI verifications captured successfully!');
  } catch (err) {
    console.error('❌ Verification capture error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
