class TranslatorApp {
    constructor() {
        this.englishText = document.getElementById('english-text')
        this.translationOutput = document.getElementById('translation-output')
        this.translateBtn = document.getElementById('translate-btn')
        this.copyBtn = document.getElementById('copy-btn')
        this.themeToggle = document.getElementById('theme-toggle')
        this.charCount = document.getElementById('char-count')
        this.processingTime = document.getElementById('processing-time')
        this.accuracyNote = document.getElementById('accuracy-note')
        this.notification = document.getElementById('notification')
        this.init()
    }

    init() {
        this.loadTheme()
        this.setupEventListeners()
        this.updateCharCount()
    }

    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', theme)
    }

    setupEventListeners() {
        this.englishText.addEventListener('input', () => this.updateCharCount())
        this.translateBtn.addEventListener('click', () => this.translate())
        this.copyBtn.addEventListener('click', () => this.copyTranslation())
        this.themeToggle.addEventListener('click', () => this.toggleTheme())

        this.englishText.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault()
                this.translate()
            }
        })
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme')
        const next = current === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
    }

    updateCharCount() {
        this.charCount.textContent = this.englishText.value.length
    }

    async translate() {
        const text = this.englishText.value.trim()
        if (!text) {
            this.showNotification('Please enter text to translate', 'warning')
            return
        }

        this.setLoading(true)
        this.hideAccuracyNote()
        this.processingTime.textContent = 'Processing...'

        try {
            const start = performance.now()
            const response = await fetch('/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })

            const data = await response.json()
            const time = ((performance.now() - start) / 1000).toFixed(2)

            if (!response.ok) throw new Error()

            this.translationOutput.innerHTML =
                `<div class="translation-text">${data.translation}</div>`

            this.processingTime.textContent = `${time}s`
            this.showAccuracyNote()
            this.showNotification('Translation completed', 'success')
        } catch {
            this.translationOutput.innerHTML =
                `<div class="translation-text">Translation failed</div>`
            this.processingTime.textContent = 'Failed'
            this.showNotification('Translation error', 'error')
        } finally {
            this.setLoading(false)
        }
    }

    setLoading(state) {
        this.translateBtn.disabled = state
        this.translateBtn.textContent = state ? 'Translating...' : 'Translate to Hindi'

        if (state) {
            this.translationOutput.innerHTML = `
                <div class="placeholder">
                    <p>Translating...</p>
                </div>
            `
        }
    }

    showAccuracyNote() {
        if (this.accuracyNote) this.accuracyNote.classList.remove('hidden')
    }

    hideAccuracyNote() {
        if (this.accuracyNote) this.accuracyNote.classList.add('hidden')
    }

    copyTranslation() {
        const textEl = this.translationOutput.querySelector('.translation-text')
        if (!textEl || !textEl.textContent.trim()) {
            this.showNotification('Nothing to copy', 'warning')
            return
        }

        navigator.clipboard.writeText(textEl.textContent)
        this.showNotification('Copied to clipboard', 'success')
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message
        this.notification.className = `notification show ${type}`
        setTimeout(() => this.notification.classList.remove('show'), 3000)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TranslatorApp()
})
