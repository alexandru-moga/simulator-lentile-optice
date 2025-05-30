// Presentation Controller
class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 11;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressFill = document.getElementById('progressFill');
        this.slideCounter = document.getElementById('slideCounter');
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.bindEvents();
        this.showSlide(1);
    }
    
    bindEvents() {
        // Button navigation
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
            }
        });
        
        // Swipe/touch support for mobile
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Check if it's a horizontal swipe (more horizontal than vertical)
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) { // Minimum swipe distance
                    if (diffX > 0) {
                        // Swipe left - next slide
                        this.nextSlide();
                    } else {
                        // Swipe right - previous slide
                        this.previousSlide();
                    }
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1, 'right');
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1, 'left');
        }
    }
    
    goToSlide(slideNumber, direction = 'right') {
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;
        
        const currentSlideElement = document.querySelector('.slide.active');
        const nextSlideElement = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
        
        if (!nextSlideElement) return;
        
        // Remove active class from current slide
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
            currentSlideElement.classList.add(direction === 'right' ? 'prev' : 'next');
            
            // Clean up transition classes after animation
            setTimeout(() => {
                currentSlideElement.classList.remove('prev', 'next');
            }, 300);
        }
        
        // Add animation class based on direction
        nextSlideElement.classList.add(direction === 'right' ? 'slide-in-right' : 'slide-in-left');
        
        // Set new active slide
        setTimeout(() => {
            nextSlideElement.classList.add('active');
            nextSlideElement.classList.remove('slide-in-right', 'slide-in-left');
        }, 50);
        
        this.currentSlide = slideNumber;
        this.updateUI();
    }
    
    showSlide(slideNumber) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show target slide
        const targetSlide = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
        if (targetSlide) {
            targetSlide.classList.add('active');
        }
        
        this.currentSlide = slideNumber;
        this.updateUI();
    }
    
    updateUI() {
        // Update progress bar
        const progressPercent = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progressPercent}%`;
        
        // Update slide counter
        this.slideCounter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
        
        // Update button states
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        // Update button text for last slide
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.textContent = 'Sfârșit';
        } else {
            this.nextBtn.textContent = 'Următor →';
        }
        
        // Update button text for first slide
        if (this.currentSlide === 1) {
            this.prevBtn.textContent = 'Început';
        } else {
            this.prevBtn.textContent = '← Anterior';
        }
    }
}

// Slide Content Enhancers
class SlideEnhancers {
    constructor() {
        this.init();
    }
    
    init() {
        this.enhanceFormulas();
        this.enhanceAnimations();
        this.enhanceAccessibility();
    }
    
    enhanceFormulas() {
        // Add hover effects to formulas
        const formulas = document.querySelectorAll('.formula');
        formulas.forEach(formula => {
            formula.addEventListener('mouseenter', () => {
                formula.style.transform = 'scale(1.05)';
                formula.style.boxShadow = '0 8px 25px rgba(50, 184, 198, 0.3)';
            });
            
            formula.addEventListener('mouseleave', () => {
                formula.style.transform = 'scale(1)';
                formula.style.boxShadow = 'none';
            });
        });
    }
    
    enhanceAnimations() {
        // Add subtle animations to interactive elements
        const interactiveElements = document.querySelectorAll('.toc-item, .app-item, .variable-item');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        interactiveElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(element);
        });
    }
    
    enhanceAccessibility() {
        // Add ARIA labels and roles
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
        });
        
        // Add semantic structure
        const headings = document.querySelectorAll('.slide h2, .slide h3');
        headings.forEach(heading => {
            heading.setAttribute('tabindex', '0');
        });
        
        // Enhance navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.setAttribute('aria-label', 'Go to previous slide');
        nextBtn.setAttribute('aria-label', 'Go to next slide');
    }
}

// Slide-specific functionality
class SlideSpecificFeatures {
    constructor(presentationController) {
        this.presentation = presentationController;
        this.init();
    }
    
    init() {
        this.enhanceComparisonTable();
        this.enhanceExercises();
        this.addSlideSpecificAnimations();
    }
    
    enhanceComparisonTable() {
        const comparisonRows = document.querySelectorAll('.comparison-row');
        comparisonRows.forEach((row, index) => {
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'rgba(50, 184, 198, 0.1)';
                row.style.transform = 'scale(1.02)';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = 'transparent';
                row.style.transform = 'scale(1)';
            });
        });
    }
    
    enhanceExercises() {
        const solutions = document.querySelectorAll('.solution');
        solutions.forEach(solution => {
            const parent = solution.parentElement;
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = 'Afișează soluția';
            toggleBtn.className = 'btn btn--secondary';
            toggleBtn.style.marginTop = '16px';
            
            // Initially hide solutions
            solution.style.display = 'none';
            
            toggleBtn.addEventListener('click', () => {
                if (solution.style.display === 'none') {
                    solution.style.display = 'block';
                    solution.style.animation = 'slideInRight 0.3s ease';
                    toggleBtn.textContent = 'Ascunde soluția';
                } else {
                    solution.style.display = 'none';
                    toggleBtn.textContent = 'Afișează soluția';
                }
            });
            
            parent.insertBefore(toggleBtn, solution);
        });
    }
    
    addSlideSpecificAnimations() {
        // Add entrance animations for slide 1 (title slide)
        const titleSlide = document.querySelector('.slide[data-slide="1"]');
        if (titleSlide) {
            const titleElements = titleSlide.querySelectorAll('.slide-title, .subtitle, .lens-illustration, .author');
            titleElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.8s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 300);
            });
        }
    }
}

// Utility functions
class PresentationUtils {
    static addFullscreenSupport() {
        // Add fullscreen toggle
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.innerHTML = '⛶';
        fullscreenBtn.className = 'nav-btn';
        fullscreenBtn.style.position = 'fixed';
        fullscreenBtn.style.top = '20px';
        fullscreenBtn.style.right = '20px';
        fullscreenBtn.style.zIndex = '1001';
        fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
        
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen not supported:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
        
        document.body.appendChild(fullscreenBtn);
    }
    
    static addPrintSupport() {
        // Add print styles and functionality
        const printBtn = document.createElement('button');
        printBtn.innerHTML = '🖨';
        printBtn.className = 'nav-btn';
        printBtn.style.position = 'fixed';
        printBtn.style.top = '20px';
        printBtn.style.right = '80px';
        printBtn.style.zIndex = '1001';
        printBtn.setAttribute('aria-label', 'Print presentation');
        
        printBtn.addEventListener('click', () => {
            window.print();
        });
        
        document.body.appendChild(printBtn);
    }
    
    static addKeyboardShortcutsHelp() {
        let helpVisible = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' || e.key === 'h') {
                e.preventDefault();
                this.toggleHelp();
            }
            if (e.key === 'Escape' && helpVisible) {
                this.hideHelp();
            }
        });
    }
    
    static toggleHelp() {
        let helpModal = document.getElementById('helpModal');
        
        if (!helpModal) {
            helpModal = this.createHelpModal();
        }
        
        if (helpModal.style.display === 'block') {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }
    
    static createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1a365d;
            color: #FCFCF9;
            padding: 32px;
            border-radius: 12px;
            border: 2px solid #32B8C6;
            max-width: 500px;
            text-align: left;
        `;
        
        content.innerHTML = `
            <h3 style="color: #32B8C6; margin-bottom: 20px;">Scurtături tastatură</h3>
            <div style="line-height: 1.8;">
                <div><strong>→</strong> sau <strong>Space</strong> - Slide-ul următor</div>
                <div><strong>←</strong> - Slide-ul anterior</div>
                <div><strong>Home</strong> - Primul slide</div>
                <div><strong>End</strong> - Ultimul slide</div>
                <div><strong>?</strong> sau <strong>h</strong> - Afișează acest ajutor</div>
                <div><strong>Esc</strong> - Închide ajutorul</div>
            </div>
            <button id="closeHelp" style="
                background: #32B8C6;
                color: #FCFCF9;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                margin-top: 20px;
                cursor: pointer;
            ">Închide</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close button functionality
        document.getElementById('closeHelp').addEventListener('click', () => {
            this.hideHelp();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideHelp();
            }
        });
        
        return modal;
    }
    
    static showHelp() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.style.display = 'flex';
            helpVisible = true;
        }
    }
    
    static hideHelp() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.style.display = 'none';
            helpVisible = false;
        }
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main presentation controller
    const presentation = new PresentationController();
    
    // Initialize slide enhancers
    new SlideEnhancers();
    
    // Initialize slide-specific features
    new SlideSpecificFeatures(presentation);
    
    // Add utility features
    PresentationUtils.addFullscreenSupport();
    PresentationUtils.addPrintSupport();
    PresentationUtils.addKeyboardShortcutsHelp();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('📊 Presentare despre lentile inițializată cu succes!');
    console.log('💡 Apasă "?" pentru a vedea scurtăturile de tastatură');
});