/* d:\portfolio\script.js */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('checkbox');
    const themeLabel = document.getElementById('theme-label');
    const customCursor = document.getElementById('custom-cursor');
    const body = document.body;

    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.id = 'effect-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let isSuperman = false;

    // Theme Switch
    themeToggle.addEventListener('change', (e) => {
        const oldBgColor = getComputedStyle(document.body).backgroundColor;

        // Create comic book halftone transition element
        const wipe = document.createElement('div');
        wipe.classList.add('comic-wipe');

        // Use a stark comic color based on theme (Yellow for Gotham, Blue/Red for Metropolis)
        const comicColor = isSuperman ? '#262626' : '#ed1d24'; // Opposite color of the current theme for high contrast "POW"
        wipe.style.setProperty('--comic-bg', comicColor);
        document.body.appendChild(wipe);

        // Start 'POW' growing animation
        requestAnimationFrame(() => {
            wipe.classList.add('expanding');
        });

        setTimeout(() => {
            // Apply theme change when comic dots cover the screen
            if (e.target.checked) {
                body.classList.add('superman-theme');
                themeLabel.textContent = "LIGHT MODE";
                isSuperman = true;
            } else {
                body.classList.remove('superman-theme');
                themeLabel.textContent = "DARK MODE";
                isSuperman = false;
            }
            createBurst(width / 2, height / 2, isSuperman);

            // Retract/Fade the comic wipe
            wipe.classList.remove('expanding');
            wipe.classList.add('contracting');

            setTimeout(() => {
                wipe.remove();
            }, 500);
        }, 600); // Wait for the 'POW' expansion
    });

    // Custom Cursor
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';

        // Add trail dot
        addTrailDot(e.clientX, e.clientY);
    });

    // Hover effects for links and buttons
    const links = document.querySelectorAll('a, button, .theme-switch');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(2)';
            customCursor.style.backgroundColor = isSuperman ? 'var(--secondary-color)' : 'var(--primary-color)';
        });
        link.addEventListener('mouseleave', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            customCursor.style.backgroundColor = isSuperman ? 'var(--primary-color)' : 'var(--primary-color)';
        });
    });

    // Click effect (Burst)
    document.addEventListener('mousedown', (e) => {
        customCursor.classList.add('click-effect');
        setTimeout(() => customCursor.classList.remove('click-effect'), 200);
        createBurst(e.clientX, e.clientY, isSuperman);
    });

    // Particle System
    let particles = [];
    let trails = [];

    class Particle {
        constructor(x, y, isSuperman) {
            this.x = x;
            this.y = y;
            this.isSuperman = isSuperman;
            this.size = Math.random() * 5 + 3;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.05 + 0.02;

            // Themes: Superman has Red/Blue. Batman has Yellow/Dark Gray
            if (isSuperman) {
                this.color = Math.random() > 0.5 ? '#ed1d24' : '#005b9f';
                if (Math.random() > 0.8) this.color = '#ffc900';
            } else {
                this.color = Math.random() > 0.5 ? '#f0c330' : '#444444';
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
        }

        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (!this.isSuperman) {
                // Batman shape (simple triangle/bat approx)
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size * 1.5, this.y + this.size);
                ctx.lineTo(this.x - this.size * 1.5, this.y + this.size);
            } else {
                // Superman shape (diamonds)
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size, this.y);
                ctx.lineTo(this.x, this.y + this.size);
                ctx.lineTo(this.x - this.size, this.y);
            }
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class Trail {
        constructor(x, y, isSuperman) {
            this.x = x;
            this.y = y;
            this.size = isSuperman ? 4 : 3;
            this.life = 1;
            this.decay = 0.05;
            this.color = isSuperman ? 'rgba(237, 29, 36, 0.5)' : 'rgba(240, 195, 48, 0.4)';
        }
        update() {
            this.life -= this.decay;
            this.size *= 0.9;
        }
        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function createBurst(x, y, isSuperman) {
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(x, y, isSuperman));
        }
    }

    function addTrailDot(x, y) {
        trails.push(new Trail(x, y, isSuperman));
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw trails
        for (let i = trails.length - 1; i >= 0; i--) {
            trails[i].update();
            trails[i].draw(ctx);
            if (trails[i].life <= 0) {
                trails.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Scroll Animation (Fade in elements)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.skill-card, .project-card, .leadership-card');
    hiddenElements.forEach((el) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });
});
