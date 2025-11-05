import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// We don't need the API key for this test, so we can ignore this.
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("Running in MOCK_API mode. No Gemini API key needed.");


app.post("/api/crop-advice", async (req, res) => {
  // We get the prompt, but we won't use it.
  const { prompt } = req.body;
  console.log("Received prompt (MOCK):", prompt);

  try {
    // --- THIS IS THE NEW MOCK RESPONSE ---

    // 1. This is the fake data we will send back.
    // It's structured just like a real Gemini response.
    const mockData = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Hello! This is a **test response** from the server. \n\nIf you can see this, it means your frontend and backend are working perfectly! The problem was only with the Google API connection."
              }
            ]
          }
        }
      ]
    };

    // 2. We simulate a 1-second network delay to make it feel real.
    setTimeout(() => {
      console.log("Sending MOCK response.");
      res.json(mockData);
    }, 1000);


    // --- OLD GEMINI API CALL (Disabled) ---
    /*
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
    console.log("Gemini API response (Success):", data);
    res.json(data);
    */
    // --- END OF OLD CALL ---

  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({ error: "Failed to get crop advice" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
