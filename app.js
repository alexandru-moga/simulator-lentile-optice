class OpticalSimulation {
    constructor() {
        this.canvas = document.getElementById('opticsCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Simulation parameters
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Optical elements
        this.lensType = 'convergent';
        this.focalLength = 150;
        this.objectDistance = 200;
        
        // Animation state
        this.isPlaying = true;
        this.animationId = null;
        this.time = 0;
        
        // Ray properties
        this.rayColors = ['#ff4444', '#ffaa00', '#44ff44', '#4444ff', '#ff44ff'];
        this.rays = [];
        this.raySpeed = 2;
        this.raySpacing = 30;
        
        // Initialize rays
        this.initializeRays();
        this.setupEventListeners();
        this.updateOpticalInfo();
        this.animate();
    }
    
    initializeRays() {
        this.rays = [];
        const numRays = 5;
        const startY = this.centerY - (numRays - 1) * this.raySpacing / 2;
        
        for (let i = 0; i < numRays; i++) {
            this.rays.push({
                x: -50,
                y: startY + i * this.raySpacing,
                color: this.rayColors[i % this.rayColors.length],
                initialY: startY + i * this.raySpacing,
                particles: []
            });
        }
    }
    
    setupEventListeners() {
        // Lens type selector
        document.querySelectorAll('input[name="lensType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.lensType = e.target.value;
                this.updateFocalLengthRange();
                this.updateOpticalInfo();
                this.initializeRays(); // Reset rays when lens type changes
            });
        });
        
        // Focal length slider
        const focalSlider = document.getElementById('focalLength');
        focalSlider.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            this.focalLength = this.lensType === 'divergent' ? -value : value;
            document.getElementById('focalValue').textContent = value;
            this.updateOpticalInfo();
        });
        
        // Object position slider
        const objectSlider = document.getElementById('objectPosition');
        objectSlider.addEventListener('input', (e) => {
            this.objectDistance = parseInt(e.target.value);
            document.getElementById('objectValue').textContent = this.objectDistance;
            this.updateOpticalInfo();
        });
        
        // Play/pause button
        document.getElementById('playPause').addEventListener('click', () => {
            this.toggleAnimation();
        });
        
        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
    }
    
    updateFocalLengthRange() {
        const focalSlider = document.getElementById('focalLength');
        const currentValue = Math.abs(this.focalLength);
        
        focalSlider.min = 50;
        focalSlider.max = 300;
        focalSlider.value = currentValue;
        
        this.focalLength = this.lensType === 'divergent' ? -currentValue : currentValue;
        document.getElementById('focalValue').textContent = currentValue;
    }
    
    toggleAnimation() {
        this.isPlaying = !this.isPlaying;
        const playPauseText = document.getElementById('playPauseText');
        const button = document.getElementById('playPause');
        
        if (this.isPlaying) {
            playPauseText.textContent = 'Oprește';
            button.classList.remove('btn--secondary');
            button.classList.add('btn--primary');
            this.animate();
        } else {
            playPauseText.textContent = 'Pornește';
            button.classList.remove('btn--primary');
            button.classList.add('btn--secondary');
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }
    
    reset() {
        // Stop animation temporarily
        const wasPlaying = this.isPlaying;
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Reset parameters
        this.time = 0;
        this.lensType = 'convergent';
        this.focalLength = 150;
        this.objectDistance = 200;
        
        // Reset UI
        document.querySelector('input[value="convergent"]').checked = true;
        document.getElementById('focalLength').value = 150;
        document.getElementById('objectPosition').value = 200;
        document.getElementById('focalValue').textContent = '150';
        document.getElementById('objectValue').textContent = '200';
        
        // Reset rays
        this.initializeRays();
        this.updateOpticalInfo();
        
        // Restart animation if it was playing
        if (wasPlaying) {
            this.isPlaying = true;
            this.animate();
        } else {
            // Draw one frame to show reset state
            this.drawFrame();
        }
        
        // Update play/pause button
        const playPauseText = document.getElementById('playPauseText');
        const button = document.getElementById('playPause');
        if (this.isPlaying) {
            playPauseText.textContent = 'Oprește';
            button.classList.remove('btn--secondary');
            button.classList.add('btn--primary');
        } else {
            playPauseText.textContent = 'Pornește';
            button.classList.remove('btn--primary');
            button.classList.add('btn--secondary');
        }
    }
    
    updateOpticalInfo() {
        // Update focal length display
        document.getElementById('infoFocal').textContent = `${Math.abs(this.focalLength)} px`;
        
        // Calculate image properties using lens equation: 1/f = 1/do + 1/di
        const f = this.focalLength;
        const do_ = this.objectDistance;
        
        try {
            if (Math.abs(f) > 0.1 && Math.abs(do_ - f) > 0.1) {
                const di = (f * do_) / (do_ - f);
                const magnification = -di / do_;
                
                // Determine image type
                let imageType = '';
                if (this.lensType === 'convergent') {
                    if (do_ > Math.abs(f)) {
                        imageType = di > 0 ? 'Reală, Inversată' : 'Virtuală, Dreaptă';
                    } else {
                        imageType = 'Virtuală, Dreaptă, Mărită';
                    }
                } else {
                    imageType = 'Virtuală, Dreaptă, Micșorată';
                }
                
                document.getElementById('imageType').textContent = imageType;
                document.getElementById('magnification').textContent = `${magnification.toFixed(2)}x`;
            } else {
                document.getElementById('imageType').textContent = 'La infinit';
                document.getElementById('magnification').textContent = '∞';
            }
        } catch (error) {
            document.getElementById('imageType').textContent = 'Eroare calcul';
            document.getElementById('magnification').textContent = '--';
        }
    }
    
    drawLens() {
        const lensX = this.centerX;
        const lensWidth = 8;
        const lensHeight = 150;
        
        this.ctx.strokeStyle = '#32b8c6';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        
        if (this.lensType === 'convergent') {
            // Convex lens - thicker in the middle
            this.ctx.moveTo(lensX - lensWidth/2, this.centerY - lensHeight/2);
            this.ctx.quadraticCurveTo(lensX + lensWidth, this.centerY - lensHeight/3, lensX - lensWidth/2, this.centerY);
            this.ctx.quadraticCurveTo(lensX + lensWidth, this.centerY + lensHeight/3, lensX - lensWidth/2, this.centerY + lensHeight/2);
            
            this.ctx.moveTo(lensX + lensWidth/2, this.centerY - lensHeight/2);
            this.ctx.quadraticCurveTo(lensX - lensWidth, this.centerY - lensHeight/3, lensX + lensWidth/2, this.centerY);
            this.ctx.quadraticCurveTo(lensX - lensWidth, this.centerY + lensHeight/3, lensX + lensWidth/2, this.centerY + lensHeight/2);
        } else {
            // Concave lens - thinner in the middle
            this.ctx.moveTo(lensX - lensWidth/2, this.centerY - lensHeight/2);
            this.ctx.quadraticCurveTo(lensX - lensWidth - 10, this.centerY, lensX - lensWidth/2, this.centerY + lensHeight/2);
            
            this.ctx.moveTo(lensX + lensWidth/2, this.centerY - lensHeight/2);
            this.ctx.quadraticCurveTo(lensX + lensWidth + 10, this.centerY, lensX + lensWidth/2, this.centerY + lensHeight/2);
        }
        
        this.ctx.stroke();
        
        // Draw optical axis
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.width, this.centerY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawFocalPoints() {
        const f = Math.abs(this.focalLength);
        
        // Draw focal points
        this.ctx.strokeStyle = '#32b8c6';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        
        // Left focal point
        this.ctx.beginPath();
        this.ctx.arc(this.centerX - f, this.centerY, 8, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Right focal point
        this.ctx.beginPath();
        this.ctx.arc(this.centerX + f, this.centerY, 8, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Add labels
        this.ctx.fillStyle = '#32b8c6';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('F', this.centerX - f, this.centerY - 15);
        this.ctx.fillText('F\'', this.centerX + f, this.centerY - 15);
    }
    
    calculateRefractedRay(rayY, rayX) {
        const lensX = this.centerX;
        const f = this.focalLength;
        
        if (rayX < lensX - 10) {
            // Before lens - ray travels straight
            return { x: rayX, y: rayY, dx: this.raySpeed, dy: 0 };
        } else if (rayX >= lensX - 10 && rayX <= lensX + 10) {
            // At the lens - continue straight but prepare for refraction
            return { x: rayX, y: rayY, dx: this.raySpeed, dy: 0 };
        } else {
            // After lens - apply refraction
            const heightAtLens = rayY - this.centerY;
            
            if (this.lensType === 'convergent') {
                // Convergent lens: parallel rays converge to focal point
                const focalPointX = lensX + Math.abs(f);
                const focalPointY = this.centerY;
                
                const dx = focalPointX - rayX;
                const dy = focalPointY - rayY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    return {
                        x: rayX,
                        y: rayY,
                        dx: (dx / distance) * this.raySpeed,
                        dy: (dy / distance) * this.raySpeed
                    };
                }
            } else {
                // Divergent lens: rays appear to come from virtual focal point
                const virtualFocalX = lensX + f; // f is negative for divergent
                const virtualFocalY = this.centerY;
                
                const dx = rayX - virtualFocalX;
                const dy = rayY - virtualFocalY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    return {
                        x: rayX,
                        y: rayY,
                        dx: (dx / distance) * this.raySpeed,
                        dy: (dy / distance) * this.raySpeed
                    };
                }
            }
        }
        
        return { x: rayX, y: rayY, dx: this.raySpeed, dy: 0 };
    }
    
    updateRays() {
        if (!this.isPlaying) return;
        
        this.rays.forEach(ray => {
            // Add new particle at the source periodically
            if (this.time % 15 === 0) {
                ray.particles.push({
                    x: -50,
                    y: ray.initialY,
                    dx: this.raySpeed,
                    dy: 0,
                    age: 0
                });
            }
            
            // Update existing particles
            ray.particles.forEach(particle => {
                const refracted = this.calculateRefractedRay(particle.y, particle.x);
                particle.x = refracted.x + refracted.dx;
                particle.y = refracted.y + refracted.dy;
                particle.dx = refracted.dx;
                particle.dy = refracted.dy;
                particle.age++;
            });
            
            // Remove particles that are off-screen or too old
            ray.particles = ray.particles.filter(particle => 
                particle.x < this.width + 100 && particle.age < 400 && 
                particle.y > -50 && particle.y < this.height + 50
            );
        });
    }
    
    drawRays() {
        this.rays.forEach(ray => {
            // Draw ray trail
            if (ray.particles.length > 1) {
                this.ctx.strokeStyle = ray.color;
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.6;
                this.ctx.beginPath();
                this.ctx.moveTo(ray.particles[0].x, ray.particles[0].y);
                
                for (let i = 1; i < ray.particles.length; i++) {
                    this.ctx.lineTo(ray.particles[i].x, ray.particles[i].y);
                }
                
                this.ctx.stroke();
                this.ctx.globalAlpha = 1.0;
            }
            
            // Draw particles with glow effect
            ray.particles.forEach((particle, index) => {
                const alpha = Math.max(0.3, 1 - particle.age / 400);
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = ray.color;
                this.ctx.shadowColor = ray.color;
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1.0;
            });
        });
    }
    
    drawProjector() {
        // Draw light source/projector on the left
        this.ctx.fillStyle = '#ffdd44';
        this.ctx.shadowColor = '#ffdd44';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(30, this.centerY, 12, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Projector body
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(5, this.centerY - 20, 30, 40);
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(35, this.centerY - 8, 12, 16);
        
        // Projector label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SURSA', 20, this.centerY + 35);
    }
    
    drawScreen() {
        // Draw screen/detector on the right
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - 40, this.centerY - 80);
        this.ctx.lineTo(this.width - 40, this.centerY + 80);
        this.ctx.stroke();
        
        // Screen base
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(this.width - 50, this.centerY + 70, 20, 15);
        
        // Screen label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ECRAN', this.width - 40, this.centerY + 100);
    }
    
    drawFrame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw all components
        this.drawProjector();
        this.drawScreen();
        this.drawLens();
        this.drawFocalPoints();
        this.drawRays();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        this.drawFrame();
        this.updateRays();
        
        this.time++;
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const simulation = new OpticalSimulation();
    
    // Handle canvas resize
    window.addEventListener('resize', () => {
        const canvas = document.getElementById('opticsCanvas');
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Maintain aspect ratio while fitting container
        const maxWidth = Math.min(800, rect.width - 32);
        const aspectRatio = 800 / 400;
        const newHeight = maxWidth / aspectRatio;
        
        canvas.style.width = maxWidth + 'px';
        canvas.style.height = newHeight + 'px';
    });
    
    // Initial resize
    window.dispatchEvent(new Event('resize'));
});