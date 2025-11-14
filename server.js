app.post("/api/translate", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Thiếu văn bản để dịch" });

  try {
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Hãy dịch chính xác đoạn sau từ tiếng Nhật sang tiếng Việt, chỉ trả về kết quả dịch, không giải thích thêm:\n${text}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    // Ghi log ra console để dễ kiểm tra nếu có lỗi
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    const translated =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Không có kết quả";
    res.json({ translated });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Lỗi khi gọi Gemini API" });
  }
});
