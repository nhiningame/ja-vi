import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình đường dẫn tĩnh cho index.html
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Cho phép nhận JSON
app.use(express.json());

// API dịch bằng Gemini
app.post("/api/translate", async (req, res) => {
  try {
    const { text, source, target } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Thiếu GEMINI_API_KEY" });

    // Prompt yêu cầu Gemini dịch
    const prompt = `Dịch đoạn sau từ tiếng Nhật sang tiếng Việt, không thêm lời giải thích:
${text}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();

    const translation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ translation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi gọi Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
