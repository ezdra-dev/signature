const CONFIG = {
  API_ENDPOINT: "/process",
  TOAST_DURATION: 3500,
  PHONE_MASK: {
    countryCode: "55",
    format: "+55 (##) #####-####",
  },
};

class SignatureApp {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.initializeState();
  }

  initializeElements() {
    this.form = document.getElementById("signatureForm");
    this.generateBtn = document.querySelector(".submit-button");
    this.clearBtn = document.querySelector(".clear-button");
    this.buttonText = document.getElementById("buttonText");
    this.buttonLoading = document.getElementById("buttonLoading");
    this.addCardToggle = document.getElementById("addCardToggle");
    this.cardUploadContainer = document.getElementById("cardUploadContainer");
    this.cardImageInput = document.getElementById("cardImage");
    this.phoneInput = document.getElementById("phone");

    this.cardImageLabel = this.cardImageInput.parentElement;
    this.paperclipIcon = this.cardImageLabel.querySelector(".fa-paperclip");
  }

  bindEvents() {
    this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
    this.clearBtn.addEventListener("click", this.handleClear.bind(this));
    this.addCardToggle.addEventListener(
      "change",
      this.handleCardToggle.bind(this)
    );
    this.cardImageInput.addEventListener(
      "change",
      this.handleImageChange.bind(this)
    );
    this.phoneInput.addEventListener("input", this.handlePhoneInput.bind(this));
  }

  initializeState() {
    this.cardUploadContainer.style.display = "none";
    this.addCardToggle.checked = false;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    this.setLoadingState(true);
    
    try {
      const formData = this.buildFormData();
      const response = await this.submitForm(formData);
      
      if (response.ok) {
        const result = await response.json();
        this.showToast('Assinatura enviada com sucesso!');
        this.form.reset();
        this.resetImagePreview();
      } else {
        throw new Error('Erro ao gerar assinatura');
      }
    } catch (error) {
      this.showToast('Erro ao gerar assinatura. Tente novamente.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  buildFormData() {
    const formData = new FormData(this.form);

    if (this.cardImageInput.files.length > 0 && !formData.has("cardImage")) {
      formData.append("cardImage", this.cardImageInput.files[0]);
    }

    return formData;
  }

  async submitForm(formData) {
    return await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      body: formData,
    });
  }

  handleCardToggle() {
    if (this.addCardToggle.checked) {
      this.cardUploadContainer.style.display = "flex";
    } else {
      this.cardUploadContainer.style.display = "none";
      this.resetImagePreview();
    }
  }

  handleImageChange(e) {
    const file = e.target.files[0];

    if (file) {
      this.displayImagePreview(file);
    } else {
      this.resetImagePreview();
    }
  }

  displayImagePreview(file) {
    const reader = new FileReader();

    reader.onload = (ev) => {
      this.cardImageLabel.style.background = `url('${ev.target.result}') center center/cover no-repeat`;
      this.paperclipIcon.style.display = "none";
    };

    reader.readAsDataURL(file);
  }

  resetImagePreview() {
    this.cardImageLabel.style.background = "#181846";
    this.cardImageLabel.style.border = "1px solid #28286a";
    this.paperclipIcon.style.display = "inline-block";
    this.cardImageInput.value = "";
  }

  handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value.startsWith(CONFIG.PHONE_MASK.countryCode)) {
      value = value.slice(2);
    }

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    const masked = this.applyPhoneMask(value);
    e.target.value = masked.trim();
  }

  applyPhoneMask(value) {
    let masked = `+${CONFIG.PHONE_MASK.countryCode} `;

    if (value.length > 0) {
      masked += "(" + value.substring(0, 2);
    }

    if (value.length >= 3) {
      masked += ") " + value.substring(2, value.length >= 7 ? 7 : value.length);
    }

    if (value.length >= 7) {
      masked += "-" + value.substring(7, 11);
    }

    return masked;
  }

  handleClear() {
    this.resetLoadingState();
    this.resetImagePreview();
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.buttonText.classList.add("hidden");
      this.buttonLoading.classList.remove("hidden");
      this.buttonLoading.style.display = "flex";
      this.generateBtn.disabled = true;
      this.clearBtn.disabled = true;
    } else {
      this.resetLoadingState();
    }
  }

  resetLoadingState() {
    this.buttonText.classList.remove("hidden");
    this.buttonLoading.classList.add("hidden");
    this.buttonLoading.style.display = "";
    this.generateBtn.disabled = false;
    this.clearBtn.disabled = false;
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `toast ${type}`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 400);
    }, CONFIG.TOAST_DURATION);
  }
}

class Validator {
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    const phoneRegex = /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  static isValidName(name) {
    return name.trim().length >= 2;
  }

  static isValidPosition(position) {
    return position.trim().length >= 2;
  }
}

class FileHandler {
  static isValidImageFile(file) {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  static getFileSizeMB(file) {
    return (file.size / (1024 * 1024)).toFixed(2);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SignatureApp();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SignatureApp, Validator, FileHandler };
}
