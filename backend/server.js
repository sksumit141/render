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
    
    // Navigate to the frontend URL
    await page.goto('https://render-sand-zeta.vercel.app', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForTimeout(2000);

    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true
    });

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
      'Content-Disposition': 'attachment; filename="screenshot.png"'
    });

    return res.send(screenshot);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    return res.status(500).send('Failed to take screenshot.');
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
