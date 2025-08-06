import React, { useRef, useEffect } from 'react';

const MusicalParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // New background color
        const backgroundColor = '#1a1a2e';

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const mouse = {
            x: undefined,
            y: undefined,
            radius: 120 // Interaction radius for stretching
        };

        const handleMouseMove = (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        const handleMouseOut = () => {
            mouse.x = undefined;
            mouse.y = undefined;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        let particlesArray = [];
        // Increased particle count for a denser net
        const numberOfParticles = 120;

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.originX = x;
                this.originY = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Wall collision
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Mouse interaction for a "stretch" effect
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;

                if (distance < mouse.radius) {
                    this.x -= forceDirectionX * force * 3;
                    this.y -= forceDirectionY * force * 3;
                } else {
                    // Return to original position smoothly
                    if (this.x !== this.originX) {
                        let dx = this.x - this.originX;
                        this.x -= dx / 20;
                    }
                    if (this.y !== this.originY) {
                        let dy = this.y - this.originY;
                        this.y -= dy / 20;
                    }
                }
                 
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        const init = () => {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 1.5 + 0.5;
                let x = Math.random() * window.innerWidth;
                let y = Math.random() * window.innerHeight;
                let directionX = (Math.random() * 0.2) - 0.1;
                let directionY = (Math.random() * 0.2) - 0.1;
                // New color for particles
                let color = '#89f7fe'; 
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        };

        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                        ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    
                    // Adjusted connection distance for a fuller net
                    if (distance < (canvas.width / 8) * (canvas.height / 8)) {
                        opacityValue = 1 - (distance / 15000);
                        // New color for lines
                        ctx.strokeStyle = `rgba(137, 247, 254, ${opacityValue})`; 
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            // Set the background color on each frame
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        };

        resizeCanvas();
        init();
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Removed Tailwind classes for background color
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[-1]"></canvas>;
};

export default MusicalParticleBackground;
