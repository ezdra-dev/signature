const { SignatureColaborator } = require("../templates/signature-colaborator");
const nodemailer = require("nodemailer");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const GoogleWalletService = require("./google-wallet-service");

dotenv.config();

const CONFIG = {
  PORT: process.env.PORT || 3000,
  LOGO_URL:
    "https://cdn.prod.website-files.com/67003f86fdf0f2e948b05c08/670409b6ba2eacfd3b131342_grouplinkone-neg-rgb.svg",
  EMAIL_SUBJECT: "Sua assinatura está pronta – veja como configurar.",
  SUCCESS_MESSAGE: "Assinatura enviada com sucesso!",
  ERROR_MESSAGE: "Erro interno do servidor",
};

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Tipo de arquivo não suportado. Use apenas imagens."),
        false
      );
    }
  },
});

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.NODE_MAILER_HOST,
      port: Number(process.env.NODE_MAILER_PORT),
      secure: true,
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS,
      },
    });
  }

  async sendMail({ to, subject, html }) {
    try {
      await this.transporter.sendMail({
        from: process.env.NODE_MAILER_USER,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new Error("Falha ao enviar email");
    }
  }
}

class DataValidator {
  static validateRequiredFields(userData) {
    const requiredFields = ["name", "position", "email", "phone"];
    const missingFields = requiredFields.filter((field) => !userData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios: ${missingFields.join(", ")}`);
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^-\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Email inválido");
    }
  }

  static validatePhone(phone) {
    const phoneRegex = /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Telefone inválido");
    }
  }
}

class BusinessCardProcessor {
  static async processCard(userData, file, googleWalletService) {
    try {
      let cardImageUrl = null;
      if (file) {
        cardImageUrl = await this.uploadImage(file);
      }
      const walletLink = await googleWalletService.generateWalletLink(
        userData,
        cardImageUrl
      );
      return walletLink;
    } catch (error) {
      throw new Error("Falha ao processar cartão digital");
    }
  }

  static async uploadImage(file) {
    return `https://cdn.prod.website-files.com/67003f86fdf0f2e948b05c08/670409b6ba2eacfd3b131342_grouplinkone-neg-rgb.svg`;
  }
}

class SignatureServer {
  constructor() {
    this.app = app;
    this.emailService = new EmailService();
    this.googleWalletService = new GoogleWalletService();
    this.setupRoutes();
    this.app.use((error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "Arquivo muito grande. Tamanho máximo: 5MB",
            success: false,
          });
        }
      }
      res.status(500).json({
        error: CONFIG.ERROR_MESSAGE,
        success: false,
      });
    });
    this.app.use((req, res) => {
      res.status(404).json({
        error: "Rota não encontrada",
        success: false,
      });
    });
    this.app.use((err, req, res, next) => {
      res
        .status(500)
        .json({ error: "Erro interno do servidor", success: false });
    });
  }

  setupRoutes() {
    this.app.post(
      "/process",
      upload.single("cardImage"),
      this.handleGenerateSignature.bind(this)
    );
    this.app.get("/health", this.handleHealthCheck.bind(this));
  }

  async handleGenerateSignature(req, res) {
    try {
      const userData = req.body;
      const file = req.file;
      this.validateRequest(userData);
      let walletLink = null;
      if (file) {
        walletLink = await BusinessCardProcessor.processCard(
          userData,
          file,
          this.googleWalletService
        );
      }
      const html = SignatureColaborator({
        ...userData,
        logoUrl: CONFIG.LOGO_URL,
        walletLink,
      });
      await this.emailService.sendMail({
        to: userData.email,
        subject: CONFIG.EMAIL_SUBJECT,
        html,
      });
      return res.status(201).json({
        message: CONFIG.SUCCESS_MESSAGE,
        success: true,
        walletLink,
      });
    } catch (error) {
      const statusCode =
        error.message &&
        (error.message.includes("obrigatório") ||
          error.message.includes("inválido"))
          ? 400
          : 500;
      return res.status(statusCode).json({
        error: error.message || CONFIG.ERROR_MESSAGE,
        success: false,
      });
    }
  }

  validateRequest(userData) {
    DataValidator.validateRequiredFields(userData);
    DataValidator.validateEmail(userData.email);
    DataValidator.validatePhone(userData.phone);
  }

  handleHealthCheck(req, res) {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }

  start() {
    this.app.listen(CONFIG.PORT);
  }
}

const server = new SignatureServer();
server.start();

process.on("SIGTERM", () => {
  process.exit(0);
});

process.on("SIGINT", () => {
  process.exit(0);
});

module.exports = {
  SignatureServer,
  EmailService,
  DataValidator,
  BusinessCardProcessor,
};
