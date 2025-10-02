import React, { useRef, useEffect } from 'react';
import { BackgroundStyle } from '../types';

interface AnimatedBackgroundProps {
    style: BackgroundStyle;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ style }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let elements: any[] = [];

        const resizeCanvas = () => {
            if (canvas) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() * 0.4 - 0.2);
                this.speedY = (Math.random() * 0.4 - 0.2);
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(192, 132, 252, 0.6)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        class Bubble {
            x: number; y: number; size: number; speedY: number;
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height + canvas.height;
                this.size = Math.random() * 20 + 5;
                this.speedY = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.y -= this.speedY;
                if (this.y < -this.size) {
                    this.y = canvas.height + this.size;
                    this.x = Math.random() * canvas.width;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(${Math.random() * 50 + 150}, ${Math.random() * 50 + 150}, 255, 0.3)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        class RainDrop {
             x: number; y: number; length: number; speedY: number; color: string;
             constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.length = Math.random() * 20 + 10;
                this.speedY = Math.random() * 8 + 4;
                const colors = ['#0ff', '#f0f', '#0f0'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
             }
             update() {
                this.y += this.speedY;
                 if (this.y > canvas.height) {
                    this.y = Math.random() * -100;
                    this.x = Math.random() * canvas.width;
                 }
             }
             draw() {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y - this.length);
                ctx.stroke();
                ctx.shadowBlur = 0; // Reset shadow
             }
        }
        
        class FallingLeaf {
            x: number; y: number; size: number; speedY: number; speedX: number; emoji: string; rotation: number; rotationSpeed: number;
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.size = Math.random() * 20 + 15;
                this.speedY = Math.random() * 1.5 + 1;
                this.speedX = Math.random() * 2 - 1;
                const emojis = ['🌸', '🍁', '🍂', '🍃', '🌷'];
                this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.rotationSpeed;
                if (this.x > canvas.width + this.size || this.x < -this.size) {
                    this.speedX *= -1;
                }
                if (this.y > canvas.height + this.size) {
                    this.y = -this.size;
                    this.x = Math.random() * canvas.width;
                }
            }
            draw() {
                if(!ctx) return;
                ctx.save();
                ctx.font = `${this.size}px Arial`;
                ctx.globalAlpha = 0.8;
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillText(this.emoji, 0, 0);
                ctx.restore();
            }
        }


        const init = () => {
            elements = [];
            let count;
            switch(style) {
                case 'particles': count = 100; break;
                case 'bubbles': count = 40; break;
                case 'neon_rain': count = 70; break;
                case 'falling_leaves': count = 40; break;
                default: count = 70;
            }

            for (let i = 0; i < count; i++) {
                if (style === 'particles') elements.push(new Particle());
                if (style === 'bubbles') elements.push(new Bubble());
                if (style === 'neon_rain') elements.push(new RainDrop());
                if (style === 'falling_leaves') elements.push(new FallingLeaf());
            }
        };

        const animate = () => {
            if(!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const el of elements) {
                el.update();
                el.draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [style]); // Rerun effect when style changes

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />;
};

export default AnimatedBackground;