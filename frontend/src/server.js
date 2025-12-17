
 //server
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio"; // 👈 HTML parser to extract sub-docs

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.resolve();
const PUBLIC_DIR = path.join(__dirname, "src", "public", "bids");


if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

app.use("/bids", express.static(PUBLIC_DIR));

/**
 * Save main bid PDF + extract sub documents
 */
app.get("/api/save-bid-pdf", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing PDF URL" });

  try {
    // 1️⃣ Fetch bid page (HTML)
    const htmlResponse = await fetch(url);
    if (!htmlResponse.ok) throw new Error("Failed to fetch bid page");

    const html = await htmlResponse.text();
    const $ = cheerio.load(html);

    // 2️⃣ Extract all sub document links (PDF / DOC / XLS)
    const subDocs = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (
        href &&
        (href.endsWith(".pdf") || href.endsWith(".docx") || href.endsWith(".xls") || href.endsWith(".xlsx"))
      ) {
        // Handle relative URLs
        const fullUrl = href.startsWith("http")
          ? href
          : new URL(href, "https://bidplus.gem.gov.in").href;
        subDocs.push(fullUrl);
      }
    });

    // 3️⃣ Try to find main PDF (bid document)
    const mainPdfLink =
      subDocs.find((link) => link.includes("showbidDocument")) || url;

    // 4️⃣ Download & save main PDF
    const response = await fetch(mainPdfLink);
    if (!response.ok) throw new Error("Failed to fetch main PDF");

    const buffer = await response.arrayBuffer();
    const filename = `bid_${Date.now()}.pdf`;
    const filePath = path.join(PUBLIC_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // 5️⃣ Send back response with main file + subDocs
    res.json({
      message: "PDF saved successfully",
      filePath: `/bids/${filename}`,
      subDocuments: subDocs,
    });
  } catch (err) {
    console.error("❌ Error saving PDF:", err);
    res.status(500).json({ error: "Failed to download or save PDF" });
  }
});
/**
 * PROXY ROUTE TO FETCH RESTRICTED DOCUMENTS (GeM)
 * → fixes CORS
 * → bypasses login requirement
 */
app.get("/api/fetch-doc", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("URL is required");

    console.log("📄 Fetching through proxy:", url);

    // Backend → fetch actual file from GeM
    const fileResponse = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
      },
    });

    if (!fileResponse.ok) {
      return res.status(500).send("Failed to fetch document");
    }

    // Forward file content + headers to frontend
    res.setHeader(
      "Content-Type",
      fileResponse.headers.get("content-type") || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      fileResponse.headers.get("content-disposition") || "inline"
    );

    fileResponse.body.pipe(res);
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).send("Proxy failed");
  }
});
/**
 * PROXY ROUTE TO FETCH RESTRICTED DOCUMENTS (GeM)
 * → fixes CORS
 * → bypasses login requirement
 */
app.get("/api/fetch-doc", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("URL is required");

    console.log("📄 Fetching through proxy:", url);

    // Backend → fetch actual file from GeM
    const fileResponse = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
      },
    });

    if (!fileResponse.ok) {
      return res.status(500).send("Failed to fetch document");
    }

    // Forward file content + headers to frontend
    res.setHeader(
      "Content-Type",
      fileResponse.headers.get("content-type") || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      fileResponse.headers.get("content-disposition") || "inline"
    );

    fileResponse.body.pipe(res);
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).send("Proxy failed");
  }
});

// REPAIR PROXY TO BYPASS X-FRAME-OPTIONS / CSP
app.get("/api/fetch-doc", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("URL is required");

    console.log("📄 Proxying request to:", url);

    const fileResponse = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
      },
    });

    if (!fileResponse.ok) {
      return res.status(fileResponse.status).send("Failed to fetch document");
    }

    // REMOVE FRAME BLOCKING HEADERS
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");

    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");

    // Set content type
    const contentType = fileResponse.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", "inline");

    // STREAM FILE
    fileResponse.body.pipe(res);
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).send("Proxy failed");
  }
});




/**
 * Delete saved bid PDF
 */
app.post("/api/delete-bid-pdf", (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "Missing filePath" });

  const fullPath = path.join(__dirname, "src", "public", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    res.json({ message: "File deleted successfully" });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

const PORT = 5100;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


