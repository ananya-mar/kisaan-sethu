import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import getMandiPrices from "./server/scrapers/mandiScraper.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// Gemini Crop Advice API
// =======================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE") {
  console.error("Missing ❌ GEMINI_API_KEY in .env file, or it's still a placeholder!");
} else {
  console.log("Gemini API Key: Loaded ✅");
}

app.post("/api/crop-advice", async (req, res) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE") {
    return res.status(500).json({ error: "Server is missing a valid API key" });
  }

  try {
    const { prompt } = req.body;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error response:", errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({ error: "Failed to get crop advice" });
  }
});

// =======================
// Live Mandi Prices API
// =======================

let mandiPricesCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 2 * 60 * 60 * 1000,
};

app.get("/api/live-mandi-prices", async (req, res) => {
  try {
    const now = Date.now();

    if (
      mandiPricesCache.data &&
      mandiPricesCache.timestamp &&
      now - mandiPricesCache.timestamp < mandiPricesCache.CACHE_DURATION
    ) {
      return res.json({
        success: true,
        data: mandiPricesCache.data,
        cached: true,
      });
    }

    const prices = await getMandiPrices();

    mandiPricesCache.data = prices;
    mandiPricesCache.timestamp = now;

    res.json({
      success: true,
      data: prices,
      cached: false,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch mandi prices",
    });
  }
});

// =======================
// Pest Detection ML API
// =======================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.post("/api/pest/detect", upload.single("image"), (req, res) => {
  console.log("🐛 Pest detection request received");

  if (!req.file) {
    return res.status(400).json({ success: false, error: "No image uploaded" });
  }

  const imagePath = path.join(__dirname, req.file.path);
  const scriptPath = path.join(__dirname, "server", "ml", "pest_detect.py");

  const python = spawn(
    "ml_env\\Scripts\\python",
    [scriptPath, imagePath]
  );

  let stdout = "";
  let stderr = "";

  python.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  python.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  python.on("close", () => {
    if (stderr) {
      console.error("Python stderr:", stderr);
    }

    try {
      const result = JSON.parse(stdout);
      res.json({ success: true, result });
    } catch (err) {
      console.error("Invalid Python output:", stdout);
      res.status(500).json({
        success: false,
        error: "Invalid ML output",
      });
    }
  });
});

// =======================
// Server Start
// =======================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Mandi prices API: http://localhost:${PORT}/api/live-mandi-prices`);
});
