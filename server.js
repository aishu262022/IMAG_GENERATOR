require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 5000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to generate image
app.post('/generate-image', async (req, res) => {
  const { prompt, model, width, height } = req.body;

  try {
    console.log("Loaded API Key:", process.env.HUGGINGFACE_API_KEY ? "Present" : "Missing");
    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
        'x-use-cache': 'false',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height }
      })
    });

    if (!hfResponse.ok) {
      const error = await hfResponse.json();
      console.error("Hugging Face API error:", error);
      return res.status(500).json({ error: error.error || "Failed to generate image" });
    }

    const result = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(result).toString('base64');
    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
