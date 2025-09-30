import React, { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  gravity: number;
}

interface AddParticlesOptions {
  count: number;
  x: number;
  y: number;
  color?: string;
  speed?: number;
  gravity?: number;
  type?: 'spark' | 'shower';
}

interface ParticleManagerType {
  addParticles: (options: AddParticlesOptions) => void;
}

const ParticlesContext = createContext<ParticleManagerType | null>(null);

export const useParticles = () => {
  return useContext(ParticlesContext);
};

interface ParticleProviderProps {
  children: ReactNode;
}

export const ParticleProvider: React.FC<ParticleProviderProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const managerRef = useRef<ParticleManagerType>({
    addParticles: ({ 
        count, 
        x, 
        y, 
        color = '#fff', 
        speed = 1, 
        gravity = 0.05,
        type = 'spark'
    }) => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * speed;
        newParticles.push({
          x,
          y,
          vx: type === 'shower' ? (Math.random() - 0.5) * speed * 2 : Math.cos(angle) * velocity,
          vy: type === 'shower' ? (Math.random() * -1 - 0.5) * speed * 2 : Math.sin(angle) * velocity,
          life: 80 + Math.random() * 40,
          color: color,
          size: 1 + Math.random() * 2,
          gravity,
        });
      }
      setParticles(p => [...p, ...newParticles]);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;

    const render = (time: number) => {
        if (lastTime === 0) lastTime = time;
        const deltaTime = (time - lastTime) / 16.67; // normalize to 60fps
        lastTime = time;

        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        setParticles(currentParticles => {
            const updatedParticles = currentParticles.map(p => {
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
                p.vy += p.gravity * deltaTime;
                p.life -= 1 * deltaTime;
                return p;
            }).filter(p => p.life > 0);

            updatedParticles.forEach(p => {
                if(!ctx) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 100);
                ctx.fill();
            });

            return updatedParticles;
        });

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <ParticlesContext.Provider value={managerRef.current}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
      {children}
    </ParticlesContext.Provider>
  );
};
