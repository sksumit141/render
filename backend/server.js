const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS config
app.use(cors({
  origin: true,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/screenshot', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new', // ensure newer headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const url = `http://localhost:${PORT}`;
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Set viewport to large height to allow full content rendering
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1200, height: 3000 });

  // Capture full page screenshot
  const screenshot = await page.screenshot({ type: 'png' });

  await browser.close();

  res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"');
  res.setHeader('Content-Type', 'image/png');
  res.send(screenshot);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
