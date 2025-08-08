import React, { useRef, useEffect } from 'react';

// Default properties for the Night Sky effect
const DEFAULTS = {
    backgroundColor: '#02020a', // Very dark background
    particleColor: '#64ffda', // Mint green for particles
    starColor: '#ffffff',      // White for stars and moon
    // Desktop counts
    desktopParticleCount: 40, 
    desktopStarCount: 50,
    // Mobile counts
    mobileParticleCount: 20,
    mobileStarCount: 30,
    mouseRadius: 150,
};

const MusicalParticleBackground = ({
    backgroundColor = DEFAULTS.backgroundColor,
    particleColor = DEFAULTS.particleColor,
    starColor = DEFAULTS.starColor,
    mouseRadius = DEFAULTS.mouseRadius,
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const staticStarsRef = useRef([]); // Ref for static stars
    const animationFrameRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const mouse = { x: undefined, y: undefined, radius: mouseRadius };

        // --- Dynamic properties based on screen size ---
        let particleCount = DEFAULTS.desktopParticleCount;
        let starCount = DEFAULTS.desktopStarCount;
        let moonRadius = 30;
        let moonXOffset = 0.15;
        let moonYOffset = 0.15;

        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        const handleMouseOut = () => {
            mouse.x = undefined;
            mouse.y = undefined;
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Check for mobile screen size and adjust properties
            if (canvas.width <= 768) {
                particleCount = DEFAULTS.mobileParticleCount;
                starCount = DEFAULTS.mobileStarCount;
                moonRadius = 20;
                moonXOffset = 0.20;
                moonYOffset = 0.10;
            } else {
                particleCount = DEFAULTS.desktopParticleCount;
                starCount = DEFAULTS.desktopStarCount;
                moonRadius = 30;
                moonXOffset = 0.15;
                moonYOffset = 0.15;
            }

            init(); // Re-initialize everything on resize
        };

        // --- Particle Class for falling rain ---
        class Particle {
            constructor(x, y, size, color, speed) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.color = color;
                this.speed = speed;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 5;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            reset() {
                this.size = Math.random() * 1.5 + 0.5;
                this.speed = this.size * 0.3;
                const spawnOffset = Math.random() * (canvas.width + canvas.height);
                this.x = Math.min(spawnOffset, canvas.width);
                this.y = spawnOffset > canvas.width ? spawnOffset - canvas.width : 0;
                this.y = -this.y;
                this.x += 10;
            }

            update() {
                this.x -= this.speed;
                this.y += this.speed;

                if (mouse.x && mouse.y) {
                    const dxMouse = this.x - mouse.x;
                    const dyMouse = this.y - mouse.y;
                    const distMouse = Math.sqrt(dxMouse*dxMouse + dyMouse*dyMouse);
                    if (distMouse < mouse.radius) {
                        const force = (mouse.radius - distMouse) / mouse.radius;
                        this.x += (dxMouse / distMouse) * force * 2;
                        this.y += (dyMouse / distMouse) * force * 2;
                    }
                }

                if (this.y > canvas.height + this.size || this.x < -this.size) {
                    this.reset();
                }
                this.draw();
            }
        }
        
        // --- Functions to draw static elements ---
        const drawStars = () => {
            ctx.fillStyle = starColor;
            staticStarsRef.current.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.globalAlpha = star.alpha;
                ctx.fill();
            });
            ctx.globalAlpha = 1; // Reset alpha
        };

        const drawMoon = () => {
            const moonX = canvas.width * moonXOffset;
            const moonY = canvas.height * moonYOffset;

            ctx.save();
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = starColor;
            ctx.shadowColor = starColor;
            ctx.shadowBlur = 20;
            ctx.fill();
            
            // Create the crescent by drawing a circle of the background color
            ctx.beginPath();
            ctx.arc(moonX - (moonRadius / 3), moonY - (moonRadius / 6), moonRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = backgroundColor;
            ctx.shadowBlur = 0; // No shadow for the cutout
            ctx.fill();
            ctx.restore();
        };

        // --- Initialization ---
        const init = () => {
            particlesRef.current = [];
            staticStarsRef.current = [];

            // Create static stars based on current count
            for (let i = 0; i < starCount; i++) {
                staticStarsRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.2,
                    alpha: Math.random() * 0.5 + 0.2 // Give stars random transparency
                });
            }

            // Create falling particles based on current count
            for (let i = 0; i < particleCount; i++) {
                const size = Math.random() * 1.5 + 0.5;
                const speed = size * 0.3;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particlesRef.current.push(new Particle(x, y, size, particleColor, speed));
            }
        };

        // --- Animation Loop ---
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw static elements first to be in the background
            drawStars();
            drawMoon();

            // Update and draw moving particles
            particlesRef.current.forEach(p => p.update());
        };

        // --- Setup and Teardown ---
        handleResize(); // Initial call to set sizes and init
        animate();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
        };
    }, [backgroundColor, particleColor, starColor, mouseRadius]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10 w-full h-full" />;
};

export default MusicalParticleBackground;
