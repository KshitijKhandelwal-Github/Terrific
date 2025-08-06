import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '100px', padding: '20px' }}>
      <h1>Welcome to Terrific</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        Your personal AI code generation assistant.
      </p>
      <p>Log in or create an account to get started.</p>
      <button 
        style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}
        onClick={() => navigate('/app')}
      >
        Get Started
      </button>
    </div>
  );
};

export default LandingPage;