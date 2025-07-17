const { sign } = require("jsonwebtoken");

class GoogleWalletService {
  constructor() {
    this.clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    this.issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  }

  async generateWalletLink(userData, cardImage = null) {
    try {
      const cardJson = this.buildCardJson(userData, cardImage);
      const jwt = await this.createJWT(cardJson);
      const link = `https://pay.google.com/gp/v/save/${jwt}`;
      return link;
    } catch (error) {
      throw new Error("Falha ao gerar cartão digital");
    }
  }

  buildCardJson(userData, cardImage) {
    const classId = `${this.issuerId}.GL_ONE_2`;
    const objectId = `${this.issuerId}.${userData.email.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const cardData = {
      eventTicketObjects: [
        {
          id: objectId,
          classId,
          state: "ACTIVE",
          heroImage: cardImage
            ? {
                sourceUri: {
                  uri: cardImage,
                },
              }
            : undefined,
          ticketHolderName: userData.name,
          ticketNumber: userData.phone,
          barcode: {
            type: "QR_CODE",
            value: `mailto:${userData.email}`,
          },
          event: {
            name: {
              defaultValue: {
                language: "pt-BR",
                value: `${userData.name} - ${userData.position}`,
              },
            },
            startDateTime: new Date().toISOString(),
            // Ajuste conforme necessário para o seu caso
          },
          textModulesData: [
            {
              header: "Email",
              body: userData.email,
              id: "email",
            },
            {
              header: "Telefone",
              body: userData.phone,
              id: "phone",
            },
            {
              header: "Empresa",
              body: "GROUP LINK ONE",
              id: "company",
            },
          ],
        },
      ],
    };
    return cardData;
  }

  async createJWT(cardJson) {
    try {
      const payload = {
        iss: this.clientEmail,
        aud: "google",
        origins: [],
        typ: "savetowallet",
        payload: cardJson,
      };
      const header = {
        alg: "RS256",
        typ: "JWT",
      };
      const signed = sign(payload, this.privateKey, {
        algorithm: "RS256",
        header,
      });
      return signed;
    } catch (error) {
      throw error;
    }
  }

  async createPassClass() {
    try {
      const jwtClient = new JWT({
        email: this.clientEmail,
        key: this.privateKey,
        scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
      });

      const passClass = {
        id: `${this.issuerId}.GL_ONE_2`,
        issuerName: "GROUP LINK ONE",
        programName: "Cartão de Visita Digital",
        reviewStatus: "UNDER_REVIEW",
        allowMultipleUsersPerObject: true,
        useSmartTap: false,
        redemptionIssuers: [this.issuerId],
        enableSmartTap: false,
        titleImage: {
          sourceUri: {
            uri: "https://cdn.prod.website-files.com/67003f86fdf0f2e948b05c08/670409b6ba2eacfd3b131342_grouplinkone-neg-rgb.svg",
          },
        },
        classTemplateInfo: {
          cardTemplateOverride: {
            cardRowTemplateInfos: [
              {
                twoItems: {
                  startItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldId: "email",
                        },
                      ],
                    },
                    secondValue: {
                      fields: [
                        {
                          fieldId: "phone",
                        },
                      ],
                    },
                  },
                  endItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldId: "company",
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      };

      const response = await jwtClient.request({
        url: `https://walletobjects.googleapis.com/walletobjects/v1/genericClass`,
        method: "POST",
        data: passClass,
      });

      return response.data;
    } catch (error) {
      throw new Error("Falha ao configurar cartão digital");
    }
  }
}

module.exports = GoogleWalletService;
