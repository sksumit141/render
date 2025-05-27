const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend and localhost
app.use(cors({
  origin: ['https://render-sand-zeta.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Content Security Policy headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https: data:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// Middleware to accept raw HTML
app.use(express.text({ type: 'text/html' }));

// Add this near the top with other middleware
app.use(express.json());

app.post('/screenshot', async (req, res) => {
  let browser;
  try {
    const { html, url } = req.body;
    if (!html) {
      return res.status(400).send('Missing HTML in request body');
    }

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
    await page.setContent(html);

    // Log browser console messages (optional)
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Render raw HTML directly
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Adjust viewport to full page
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({ width: 1200, height: bodyHeight });

    const screenshot = await page.screenshot({ type: 'png' });

    // Send the screenshot file
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

// Optional root route
app.get('/', (req, res) => {
  res.send('Puppeteer screenshot service is running.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
