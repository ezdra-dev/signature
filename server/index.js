const { SignatureColaborator } = require("../templates/signature-colaborator");
const { createCanvas, loadImage } = require("canvas");
const nodemailer = require("nodemailer");
const GIFEncoder = require("gifencoder");
const puppeteer = require("puppeteer");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static("public"));

async function SendMail({ to, subject, html, gifBuffer }) {
  const transporter = nodemailer.createTransport({
    host: process.env.NODE_MAILER_HOST,
    port: Number(process.env.NODE_MAILER_PORT),
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.NODE_MAILER_USER,
    to,
    subject,
    html,
    attachments: [
      {
        filename: "assinatura.gif",
        content: gifBuffer,
        contentType: "image/gif",
      },
    ],
  });
}

async function GenerateAnimatedGIF(userData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    const templatePath = path.join(__dirname, "../public/template.html");
    let template = fs.readFileSync(templatePath, "utf8");

    Object.keys(userData).forEach((key) => {
      const placeholder = `{{${key.toUpperCase()}}}`;
      template = template.replace(new RegExp(placeholder, "g"), userData[key]);
    });

    await page.setViewport({
      width: 850,
      height: 295,
      deviceScaleFactor: 1,
    });

    await page.setContent(template, {
      waitUntil: "domcontentloaded",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const width = 850;
    const height = 295;

    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(50);
    encoder.setQuality(10);

    const frames = 120;

    for (let i = 0; i < frames; i++) {
      const animationFrames = 20;
      let progress;

      if (i < animationFrames) {
        progress = i / (animationFrames - 1);
      } else {
        progress = 1;
      }

      await page.evaluate((progress) => {
        const logo = document.querySelector(".logo");

        if (logo) {
          let rotation, scale;

          if (progress <= 0.5) {
            const moveProgress = progress * 2;
            rotation = 60 - moveProgress * 60;
            scale = 0.1 + moveProgress * 0.9;
          } else {
            rotation = 0;
            const bounceProgress = (progress - 0.5) * 2;
            const bounce = 1 + Math.sin(bounceProgress * Math.PI * 2) * 0.2;
            scale = bounce;
          }

          logo.style.transform = `rotate(${rotation}deg) scale(${scale})`;
          logo.style.transformOrigin = "center center";
        }
      }, progress);

      if (i < animationFrames) {
        await new Promise((resolve) => setTimeout(resolve, 25));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      const screenshot = await page.screenshot({
        type: "png",
        clip: {
          x: 0,
          y: 0,
          width: width,
          height: height,
        },
      });

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const img = await loadImage(screenshot);
      ctx.drawImage(img, 0, 0);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    return encoder.out.getData();
  } finally {
    await browser.close();
  }
}

app.post("/generate-gif", async (req, res) => {
  try {
    const userData = req.body;

    const requiredFields = ["name", "position", "email", "phone"];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return res.status(400).json({ error: `Campo obrigatório: ${field}` });
      }
    }

    const gifBuffer = await GenerateAnimatedGIF(userData);

    const html = SignatureColaborator({
      ...userData,
      logoUrl:
        "https://cdn.prod.website-files.com/67003f86fdf0f2e948b05c08/670409b6ba2eacfd3b131342_grouplinkone-neg-rgb.svg",
    });

    await SendMail({
      to: userData.email,
      subject: "Sua assinatura animada",
      html,
      gifBuffer,
    });

    res.set({
      "Content-Type": "image/gif",
      "Content-Length": gifBuffer.length,
      "Cache-Control": "no-cache",
    });

    res.send(gifBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT);
