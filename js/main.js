// =====================================================
// CONFIGURAÇÕES GLOBAIS
// =====================================================

const CONFIG = {
  whatsapp: {
    phoneNumber: "5571981962425",
  },
  animations: {
    floatingButtonDelay: 3000,
    pulseInterval: 30000,
    messageTimeout: 4000,
  },
  messages: {
    spiritual: [
      "Que os Orixás nos ajudem a melhorar! 🙏",
      "Agradecemos sua sinceridade, irmão! ✨",
      "Sua opinião nos fortalece! 💙",
      "Que alegria saber de sua satisfação! 🌟",
      "Gratidão eterna por suas palavras! 🕊️",
    ],
    success: [
      "Seu testemunho foi enviado com muito amor! Que os Orixás abençoem sua jornada! 🕊️",
      "Gratidão eterna por compartilhar sua experiência espiritual conosco! ✨",
      "Que a luz divina continue iluminando seu caminho! Axé! 🌟",
      "Seu testemunho fortalece nossa corrente de fé e caridade! 💙",
    ],
  },
}

// =====================================================
// CLASSE PRINCIPAL - TERREIRO APP
// =====================================================

class TerreiroApp {
  constructor() {
    this.currentRating = 0
    this.elements = {}
    this.init()
  }

  /**
   * Inicialização da aplicação
   */
  init() {
    this.cacheElements()
    this.bindEvents()
    this.initializeComponents()
  }

  /**
   * Cache dos elementos DOM
   */
  cacheElements() {
    this.elements = {
      floatingBtn: document.getElementById("floatingFeedback"),
      modal: document.getElementById("feedbackModal"),
      closeModal: document.querySelector(".close-modal"),
      testimonialForm: document.querySelector(".testimonial-form"),
      modalForm: document.querySelector(".modal-feedback-form"),
      stars: document.querySelectorAll(".stars i"),
      feedbackButtons: document.querySelectorAll(".footer-feedback-link"),
      navToggle: document.querySelector(".nav-toggle"),
      navMenu: document.querySelector(".nav-menu"),
      navLinks: document.querySelectorAll(".nav-link"),
      pixKey: document.getElementById("pixKey"),
      copyBtn: document.querySelector(".copy-btn-compact"),
    }
  }

  /**
   * Vinculação de eventos
   */
  bindEvents() {
    // Eventos de feedback
    this.bindFeedbackEvents()

    // Eventos de navegação
    this.bindNavigationEvents()

    // Eventos de doação
    this.bindDonationEvents()

    // Eventos gerais
    this.bindGeneralEvents()
  }

  /**
   * Inicialização de componentes
   */
  initializeComponents() {
    this.initStarRating()
    this.initFloatingButton()
  }

  // =====================================================
  // SISTEMA DE FEEDBACK
  // =====================================================

  /**
   * Vincula eventos relacionados ao feedback
   */
  bindFeedbackEvents() {
    const { floatingBtn, closeModal, modal, testimonialForm, modalForm, feedbackButtons } = this.elements

    if (floatingBtn) {
      floatingBtn.addEventListener("click", () => this.openFeedbackModal())
    }

    if (closeModal) {
      closeModal.addEventListener("click", () => this.closeFeedbackModal())
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeFeedbackModal()
      })
    }

    if (testimonialForm) {
      testimonialForm.addEventListener("submit", (e) => this.handleTestimonialSubmit(e, false))
    }

    if (modalForm) {
      modalForm.addEventListener("submit", (e) => this.handleTestimonialSubmit(e, true))
    }

    feedbackButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFeedbackButtonClick(e, btn))
    })
  }

  /**
   * Abre o modal de feedback
   */
  openFeedbackModal() {
    const { modal } = this.elements
    modal.style.display = "block"
    document.body.style.overflow = "hidden"
    this.showSpiritualMessage("Que os Orixás abençoem seu testemunho! 🕊️", "success")
  }

  /**
   * Fecha o modal de feedback
   */
  closeFeedbackModal() {
    const { modal } = this.elements
    modal.style.display = "none"
    document.body.style.overflow = "auto"
    this.resetForm()
  }

  /**
   * Reseta o formulário
   */
  resetForm() {
    this.currentRating = 0
    this.elements.stars.forEach((star) => star.classList.remove("active"))

    if (this.elements.modalForm) this.elements.modalForm.reset()
    if (this.elements.testimonialForm) this.elements.testimonialForm.reset()
  }

  /**
   * Manipula o clique nos botões de feedback
   */
  handleFeedbackButtonClick(e, btn) {
    e.preventDefault()
    this.openFeedbackModal()

    const service = btn.getAttribute("data-service")
    if (service && this.elements.modalForm) {
      const serviceSelect = this.elements.modalForm.querySelector("select")
      if (serviceSelect) serviceSelect.value = service
    }
  }

  /**
   * Manipula o envio do testemunho
   */
  handleTestimonialSubmit(e, isModal) {
    e.preventDefault()

    let formData
    if (isModal) {
      formData = new FormData(e.target)
    } else {
      formData = new FormData()
      formData.append("name", document.getElementById("testimonial-name")?.value || "")
      formData.append("service", document.getElementById("testimonial-service")?.value || "")
      formData.append("message", document.getElementById("testimonial-message")?.value || "")
    }

    this.processTestimonial(formData, isModal)
  }

  /**
   * Processa o testemunho
   */
  processTestimonial(formData, isModal) {
    const testimonialData = this.extractTestimonialData(formData)

    if (!this.validateTestimonial(testimonialData)) return

    this.sendTestimonialToWhatsApp(testimonialData)
    this.showSuccessMessage()

    if (isModal) {
      setTimeout(() => this.closeFeedbackModal(), 2000)
    } else {
      this.resetForm()
    }
  }

  /**
   * Extrai dados do testemunho
   */
  extractTestimonialData(formData) {
    return {
      name: formData.get("name") || formData.get("testimonial-name") || "Anônimo",
      service: formData.get("service") || formData.get("testimonial-service") || "Experiência Geral",
      message: formData.get("message") || formData.get("testimonial-message"),
      rating: this.currentRating,
      date: new Date().toISOString(),
    }
  }

  /**
   * Valida o testemunho
   */
  validateTestimonial(data) {
    if (!data.message || !this.currentRating) {
      this.showSpiritualMessage(
        "Por favor, preencha sua experiência e avaliação para que possamos receber sua bênção.",
        "warning",
      )
      return false
    }
    return true
  }

  /**
   * Envia testemunho para WhatsApp
   */
  sendTestimonialToWhatsApp(testimonial) {
    const message = this.formatWhatsAppMessage(testimonial)
    const whatsappUrl = `https://wa.me/${CONFIG.whatsapp.phoneNumber}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank")

    setTimeout(() => {
      this.showSpiritualMessage("Testemunho enviado para nosso WhatsApp! Que os Orixás abençoem! 📱🕊️", "success")
    }, 1000)
  }

  /**
   * Formata mensagem para WhatsApp
   */
  formatWhatsAppMessage(testimonial) {
    const starsEmoji = "⭐".repeat(testimonial.rating)
    const emptyStars = "☆".repeat(5 - testimonial.rating)

    return (
      `🕊️ *NOVO TESTEMUNHO ESPIRITUAL* 🕊️\n\n` +
      `👤 *Nome:* ${testimonial.name}\n` +
      `⭐ *Avaliação:* ${starsEmoji}${emptyStars} (${testimonial.rating}/5)\n` +
      `🙏 *Tipo de Trabalho:* ${testimonial.service}\n` +
      `💬 *Testemunho:*\n"${testimonial.message}"\n\n` +
      `📅 *Data:* ${new Date(testimonial.date).toLocaleDateString("pt-BR")}\n` +
      `🕐 *Horário:* ${new Date(testimonial.date).toLocaleTimeString("pt-BR")}\n\n` +
      `🌟 _Que a luz dos Orixás continue abençoando este irmão!_\n` +
      `✨ _Axé!_`
    )
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccessMessage() {
    const messages = CONFIG.messages.success
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    this.showSpiritualMessage(randomMessage, "success")
  }

  // =====================================================
  // SISTEMA DE AVALIAÇÃO POR ESTRELAS
  // =====================================================

  /**
   * Inicializa o sistema de avaliação por estrelas
   */
  initStarRating() {
    const starContainers = document.querySelectorAll(".stars")

    starContainers.forEach((container) => {
      const containerStars = container.querySelectorAll("i")
      this.bindStarEvents(container, containerStars)
    })
  }

  /**
   * Vincula eventos das estrelas
   */
  bindStarEvents(container, stars) {
    stars.forEach((star, index) => {
      star.addEventListener("click", () => this.handleStarClick(stars, index))
      star.addEventListener("mouseenter", () => this.handleStarHover(stars, index))
    })

    container.addEventListener("mouseleave", () => this.handleStarMouseLeave(stars))
  }

  /**
   * Manipula clique na estrela
   */
  handleStarClick(stars, index) {
    this.currentRating = index + 1
    this.updateStarVisual(stars)

    const message = CONFIG.messages.spiritual[this.currentRating - 1]
    this.showSpiritualMessage(message, "success")
  }

  /**
   * Manipula hover na estrela
   */
  handleStarHover(stars, index) {
    stars.forEach((s, i) => {
      if (i <= index) {
        s.style.color = "#f39c12"
        s.style.transform = "scale(1.1)"
      } else {
        s.style.color = "#ddd"
        s.style.transform = "scale(1)"
      }
    })
  }

  /**
   * Manipula saída do mouse das estrelas
   */
  handleStarMouseLeave(stars) {
    stars.forEach((s, i) => {
      if (i < this.currentRating) {
        s.style.color = "#f39c12"
        s.style.transform = "scale(1)"
      } else {
        s.style.color = "#ddd"
        s.style.transform = "scale(1)"
      }
    })
  }

  /**
   * Atualiza visual das estrelas
   */
  updateStarVisual(stars) {
    stars.forEach((s, i) => {
      if (i < this.currentRating) {
        s.classList.add("active")
      } else {
        s.classList.remove("active")
      }
    })
  }

  // =====================================================
  // SISTEMA DE NAVEGAÇÃO
  // =====================================================

  /**
   * Vincula eventos de navegação
   */
  bindNavigationEvents() {
    const { navToggle, navMenu, navLinks } = this.elements

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => this.toggleMobileMenu())

      navLinks.forEach((link) => {
        link.addEventListener("click", () => this.closeMobileMenu())
      })
    }

    this.initSmoothScroll()
  }

  /**
   * Alterna menu mobile
   */
  toggleMobileMenu() {
    const { navMenu, navToggle } = this.elements
    navMenu.classList.toggle("active")
    navToggle.classList.toggle("active")
  }

  /**
   * Fecha menu mobile
   */
  closeMobileMenu() {
    const { navMenu, navToggle } = this.elements
    navMenu.classList.remove("active")
    navToggle.classList.remove("active")
  }

  /**
   * Inicializa smooth scroll
   */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => this.handleSmoothScroll(e, anchor))
    })
  }

  /**
   * Manipula smooth scroll
   */
  handleSmoothScroll(e, anchor) {
    e.preventDefault()
    const target = document.querySelector(anchor.getAttribute("href"))

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // =====================================================
  // SISTEMA DE DOAÇÕES
  // =====================================================

  /**
   * Vincula eventos de doação
   */
  bindDonationEvents() {
    // Função global para copiar PIX (mantida para compatibilidade)
    window.copyPixKey = () => this.copyPixKey()
  }

  /**
   * Copia chave PIX
   */
  copyPixKey() {
    const { pixKey, copyBtn } = this.elements
    const pixKeyText = pixKey.textContent

    navigator.clipboard
      .writeText(pixKeyText)
      .then(() => {
        this.showSpiritualMessage("Chave PIX copiada com sucesso! 📋✨", "success")
        this.updateCopyButton(copyBtn)
      })
      .catch(() => {
        this.showSpiritualMessage("Erro ao copiar. Tente selecionar manualmente.", "warning")
      })
  }

  /**
   * Atualiza botão de copiar
   */
  updateCopyButton(btn) {
    const originalText = btn.innerHTML
    btn.innerHTML = '<i class="fas fa-check"></i> Copiado!'
    btn.style.background = "rgba(39, 174, 96, 0.3)"

    setTimeout(() => {
      btn.innerHTML = originalText
      btn.style.background = "rgba(255, 255, 255, 0.2)"
    }, 2000)
  }

  // =====================================================
  // SISTEMA DE ANIMAÇÕES
  // =====================================================

  /**
   * Inicializa botão flutuante
   */
  initFloatingButton() {
    const { floatingBtn } = this.elements

    if (!floatingBtn) return

    this.showFloatingButton()
    this.startPulseAnimation()
  }

  /**
   * Mostra botão flutuante
   */
  showFloatingButton() {
    const { floatingBtn } = this.elements

    setTimeout(() => {
      floatingBtn.style.opacity = "1"
      floatingBtn.style.transform = "scale(1)"
    }, CONFIG.animations.floatingButtonDelay)
  }

  /**
   * Inicia animação de pulso
   */
  startPulseAnimation() {
    const { floatingBtn } = this.elements

    setInterval(() => {
      floatingBtn.style.animation = "none"
      setTimeout(() => {
        floatingBtn.style.animation = "gentle-pulse 3s ease-in-out infinite"
      }, 100)
    }, CONFIG.animations.pulseInterval)
  }

  // =====================================================
  // SISTEMA DE MENSAGENS
  // =====================================================

  /**
   * Mostra mensagem espiritual
   */
  showSpiritualMessage(message, type) {
    const messageDiv = this.createMessageElement(message, type)
    document.body.appendChild(messageDiv)

    setTimeout(() => this.removeMessage(messageDiv), CONFIG.animations.messageTimeout)
  }

  /**
   * Cria elemento de mensagem
   */
  createMessageElement(message, type) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `spiritual-alert ${type}`
    messageDiv.innerHTML = `
            <i class="fas fa-star"></i>
            <span>${message}</span>
            <i class="fas fa-star"></i>
        `

    const backgroundColor =
      type === "success" ? "linear-gradient(45deg, #27ae60, #2ecc71)" : "linear-gradient(45deg, #f39c12, #e67e22)"

    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 400px;
            animation: slideInRight 0.5s ease;
        `

    return messageDiv
  }

  /**
   * Remove mensagem
   */
  removeMessage(messageDiv) {
    messageDiv.style.animation = "slideOutRight 0.5s ease"
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv)
      }
    }, 500)
  }

  // =====================================================
  // EVENTOS GERAIS
  // =====================================================

  /**
   * Vincula eventos gerais
   */
  bindGeneralEvents() {
    // Torna showSpiritualMessage disponível globalmente
    window.showSpiritualMessage = (message, type) => this.showSpiritualMessage(message, type)
  }
}

// =====================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  new TerreiroApp()
})

// =====================================================
// UTILITÁRIOS GLOBAIS
// =====================================================

/**
 * Utilitários para debug e desenvolvimento
 */
window.TerreiroUtils = {
  /**
   * Log com timestamp
   */
  log: (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    console[type](`[${timestamp}] Terreiro:`, message)
  },

  /**
   * Valida formulário
   */
  validateForm: (formElement) => {
    const requiredFields = formElement.querySelectorAll("[required]")
    return Array.from(requiredFields).every((field) => field.value.trim() !== "")
  },

  /**
   * Formata telefone brasileiro
   */
  formatPhone: (phone) => {
    return phone.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  },
}
