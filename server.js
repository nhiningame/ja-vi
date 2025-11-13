// server.js
import express from "express";
import fetch from "node-fetch"; // nếu Node 18+ có sẵn fetch thì có thể xóa dòng này
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Lấy đường dẫn tuyệt đối (dùng cho __dirname trong ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình đọc file tĩnh (index.html, css, js)
app.use(express.static(__dirname));
app.use(express.json());

// --- API dịch tiếng Nhật -> tiếng Việt ---
app.post("/api/translate", async (req, res) => {
  const { text } = req.body || {};
  console.log("--- /api/translate request body:", JSON.stringify(req.body)); // log yêu cầu nhận được

  if (!text) {
    console.log("Missing text in request");
    return res.status(400).json({ error: "Thiếu văn bản để dịch" });
  }

  try {
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Dịch chính xác sang tiếng Việt (chỉ trả về bản dịch, không thêm giải thích):\n${text}`
            }
          ]
        }
      ]
    };

    console.log("Calling Gemini API with payload:", JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API returned error:", data.error);
      return res.status(500).json({ error: data.error.message || "Gemini error" });
    }

    // Trích nội dung dịch ra (nhiều fallback để tránh lỗi null)
    const translated =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.text ||
      null;

    if (!translated) {
      console.warn("No translation found in Gemini response");
      return res.json({ translated: "Khô
