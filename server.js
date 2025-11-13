import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Cấu hình để phục vụ file tĩnh (index.html, CSS, JS...)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// ✅ Route trang chủ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Route API dịch
app.post("/api/translate", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Dịch chính xác từ tiếng Nhật sang tiếng Việt, chỉ trả về nghĩa: ${text}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const translated =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả";
    res.json({ translated });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi gọi Gemini API" });
  }
});

// ✅ Cho Vercel biết cổng (không cần lắng nghe port khi deploy)
export default app;
