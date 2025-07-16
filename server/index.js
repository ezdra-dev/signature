const { SignatureColaborator } = require("../templates/signature-colaborator");
const nodemailer = require("nodemailer");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static("public"));

async function SendMail({ to, subject, html }) {
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
    html
  });
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

    const html = SignatureColaborator({
      ...userData,
      logoUrl:
        "https://cdn.prod.website-files.com/67003f86fdf0f2e948b05c08/670409b6ba2eacfd3b131342_grouplinkone-neg-rgb.svg",
    });

    await SendMail({
      to: userData.email,
      subject: "Sua assinatura está pronta – veja como configurar.",
      html,
    });

    return res.status(201).json({ message: "Assinatura enviada com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT);
