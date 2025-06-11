import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import { useState } from 'react';

function Home() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameName.trim() && tagLine.trim()) {
      navigate(`/profile/${encodeURIComponent(gameName.trim())}/${encodeURIComponent(tagLine.trim())}`);
    }
  };

  return (
    <div className="main-content">
      <div className="container text-center">
        <h1 className="display-3 mb-4 gwen-title">LeagueStats</h1>
        <p className="lead mb-5 gwen-lead">
          Track your League of Legends stats with a clean, modern interface.<br />
          Enter your Riot ID below (Game Name and Tag Line).
        </p>
        <form className="d-flex justify-content-center mb-4 gwen-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Riot ID (e.g. Gwen)"
            value={gameName}
            onChange={e => setGameName(e.target.value)}
            autoComplete="off"
            style={{ maxWidth: 200 }}
          />
          <span className="align-self-center mx-1">#</span>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Tagline (e.g. NA1)"
            value={tagLine}
            onChange={e => setTagLine(e.target.value)}
            autoComplete="off"
            style={{ maxWidth: 160 }}
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
        <img
          src="/chibi-gwen.png"
          alt="Chibi Gwen"
          className="mt-4"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:gameName/:tagLine" element={<ProfilePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;