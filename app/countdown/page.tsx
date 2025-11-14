'use client';

import { useEffect, useState } from 'react';

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  useEffect(() => {
    const targetDate = new Date('2025-11-15T20:00:00Z');

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isLive: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div style={{ 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        
        .bg-logo {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: url('https://github.com/SylvanToken/SylvanToken/raw/main/assets/images/sylvan-token-logo.png');
          background-position: center;
          background-repeat: no-repeat;
          background-size: 60%;
          opacity: 0.08;
          z-index: 0;
        }
        
        .bg-pattern {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(168, 224, 99, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: moveBackground 20s linear infinite;
          z-index: 0;
        }
        
        @keyframes moveBackground {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 900px;
          position: relative;
          z-index: 1;
        }
        
        .logo {
          font-size: 5rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }
        
        h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
          background: linear-gradient(45deg, #a8e063, #56ab2f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tagline {
          font-size: 1.3rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
        }
        
        .countdown {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin: 3rem 0;
          flex-wrap: wrap;
        }
        
        .time-box {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 2rem 1.5rem;
          border-radius: 20px;
          min-width: 130px;
          border: 2px solid rgba(168, 224, 99, 0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .time-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(168, 224, 99, 0.3);
        }
        
        .time-box .number {
          font-size: 3.5rem;
          font-weight: bold;
          display: block;
          color: #a8e063;
          text-shadow: 0 0 20px rgba(168, 224, 99, 0.5);
          line-height: 1;
        }
        
        .time-box .label {
          font-size: 0.95rem;
          text-transform: uppercase;
          opacity: 0.8;
          margin-top: 0.8rem;
          letter-spacing: 1px;
        }
        
        .subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-top: 3rem;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
        }
        
        .features {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-top: 4rem;
          flex-wrap: wrap;
        }
        
        .feature {
          background: rgba(255,255,255,0.05);
          padding: 1.5rem;
          border-radius: 15px;
          max-width: 200px;
          border: 1px solid rgba(168, 224, 99, 0.2);
        }
        
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .feature-text {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .live-message {
          color: #a8e063;
          font-size: 2.5rem;
          font-weight: bold;
          text-shadow: 0 0 20px rgba(168, 224, 99, 0.5);
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem;
          }
          .logo {
            font-size: 3.5rem;
          }
          .countdown {
            gap: 1rem;
          }
          .time-box {
            min-width: 90px;
            padding: 1.5rem 1rem;
          }
          .time-box .number {
            font-size: 2.5rem;
          }
          .features {
            gap: 1rem;
          }
          .feature {
            max-width: 150px;
            padding: 1rem;
          }
        }
      `}</style>
      
      <div className="bg-logo"></div>
      <div className="bg-pattern"></div>
      
      <div className="container">
        <div className="logo">🌿</div>
        <h1>Sylvan Token</h1>
        <p className="tagline">Empowering a Sustainable Future Through Blockchain</p>
        
        <div className="countdown">
          {timeLeft.isLive ? (
            <h2 className="live-message">🎉 We are live! 🎉</h2>
          ) : (
            <>
              <div className="time-box">
                <span className="number">{formatNumber(timeLeft.days)}</span>
                <span className="label">Days</span>
              </div>
              <div className="time-box">
                <span className="number">{formatNumber(timeLeft.hours)}</span>
                <span className="label">Hours</span>
              </div>
              <div className="time-box">
                <span className="number">{formatNumber(timeLeft.minutes)}</span>
                <span className="label">Minutes</span>
              </div>
              <div className="time-box">
                <span className="number">{formatNumber(timeLeft.seconds)}</span>
                <span className="label">Seconds</span>
              </div>
            </>
          )}
        </div>
        
        <p className="subtitle">
          {timeLeft.isLive ? 'Welcome to Sylvan Token!' : '🚀 Something amazing is coming...'}
        </p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🎁</div>
            <div className="feature-text">Airdrop Rewards</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🌱</div>
            <div className="feature-text">Eco-Friendly</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">Secure Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
}
