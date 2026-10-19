const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outputPath = path.resolve('C:/Users/quant/.gemini/antigravity-ide/brain/21e80be0-4cb8-44aa-aced-e2faf9222511', 'login_preview.png');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  console.log('🚀 Capturing Login Page Preview...');

  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    show: false,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  try {
    await win.loadURL('http://localhost:3000/#/login');
    await sleep(2500); // Wait for canvas & animations to render
    const image = await win.webContents.capturePage();
    fs.writeFileSync(outputPath, image.toPNG());
    console.log('✅ Captured login_preview.png to', outputPath);
  } catch (err) {
    console.error('❌ Capture error:', err);
  } finally {
    app.quit();
  }
});
