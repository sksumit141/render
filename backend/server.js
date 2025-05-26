const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS config
app.use(cors({
  origin: ['https://render-sand-zeta.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.post('/screenshot', async (req, res) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    // Log browser console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Use the public URL when deployed
    const url = process.env.TARGET_URL || `http://localhost:${PORT}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Get full page height
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({ width: 1200, height: bodyHeight });

    const screenshot = await page.screenshot({ type: 'png' });

    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"');
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).send('Failed to take screenshot.');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
