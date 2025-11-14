import Link from 'next/link';

export default function NotFound() {
  // Log 404 error
  if (typeof window === 'undefined') {
    console.error('404 Error: Page not found');
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        border: '2px solid rgba(168, 224, 99, 0.3)',
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>404</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Page Not Found</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/countdown"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(to right, #a8e063, #56ab2f)',
            color: 'white',
            textDecoration: 'none',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: '10px',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
          }}
        >
          Go to Countdown
        </Link>
      </div>
    </div>
  );
}
