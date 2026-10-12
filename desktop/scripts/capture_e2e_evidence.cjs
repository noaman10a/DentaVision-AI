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
  console.log('🚀 Electron E2E Capture Runner initialized.');

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
    // 1. Screen 1: Doctor Clinical Dashboard
    console.log('📸 Navigating to Doctor Dashboard (#/doctor)...');
    await win.loadURL('http://localhost:3000/#/doctor');
    await sleep(2500);
    let image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_1_doctor_dashboard.png'), image.toPNG());
    console.log('✅ Captured screen_1_doctor_dashboard.png');

    // 2. Screen 2: Reception Dashboard
    console.log('📸 Navigating to Reception Dashboard (#/reception)...');
    await win.loadURL('http://localhost:3000/#/reception');
    await sleep(2000);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_2_reception_desk.png'), image.toPNG());
    console.log('✅ Captured screen_2_reception_desk.png');

    // 3. Screen 3: Patient Workspace with Baseline Sample X-Ray
    console.log('📸 Navigating to Patient Workspace (#/workspace)...');
    await win.loadURL('http://localhost:3000/#/workspace');
    await sleep(2500);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_3_xray_viewer_sample.png'), image.toPNG());
    console.log('✅ Captured screen_3_xray_viewer_sample.png');

    // 4. Live Upload Test: Upload v1.jpg and trigger AI inference
    console.log('🧪 Injecting real panoramic radiograph v1.jpg for AI inference...');
    const uploadResult = await win.webContents.executeJavaScript(`
      (async () => {
        try {
          const resp = await fetch('/v1.jpg');
          const blob = await resp.blob();
          const file = new File([blob], 'v1.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          const input = document.querySelector('input[type="file"]');
          if (!input) return { success: false, error: 'File input not found' };
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `);
    console.log('Upload trigger status:', uploadResult);

    // Wait for AI inference to complete
    console.log('⏳ Waiting for YOLO11m native tiled inference & WBF to complete...');
    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      const isAnalyzing = await win.webContents.executeJavaScript(`
        (() => {
          const btn = document.querySelector('button.btn-primary');
          return btn ? btn.textContent.includes('Analyzing') : false;
        })()
      `);
      if (!isAnalyzing && i > 1) {
        console.log('✅ AI inference completed after ' + (i + 1) + 's');
        break;
      }
    }

    await sleep(2000); // Allow canvas to render bounding boxes
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_4_live_ai_xray_detection.png'), image.toPNG());
    console.log('✅ Captured screen_4_live_ai_xray_detection.png (Live AI Predictions)');

    // 5. Screen 5: Doctor Review & Finding Confirmation
    console.log('👨‍⚕️ Testing Doctor Review confirmation...');
    await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confBtn = buttons.find(b => b.textContent.includes('Confirm') || (b.title && b.title.includes('Confirm')));
        if (confBtn) confBtn.click();
      })()
    `);
    await sleep(1500);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_5_doctor_review_confirmed.png'), image.toPNG());
    console.log('✅ Captured screen_5_doctor_review_confirmed.png');

    // 6. Screen 6: Diagnostic Report Generator
    console.log('📄 Navigating to Report Generator (#/doctor/reports)...');
    await win.loadURL('http://localhost:3000/#/doctor/reports');
    await sleep(2000);
    // Click "Save Draft"
    await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.textContent.includes('Save Draft'));
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(1000);
    image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outputDir, 'screen_6_diagnostic_report.png'), image.toPNG());
    console.log('✅ Captured screen_6_diagnostic_report.png');

    console.log('🎉 ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ E2E Capture failed:', err);
  } finally {
    win.close();
    app.quit();
  }
});
