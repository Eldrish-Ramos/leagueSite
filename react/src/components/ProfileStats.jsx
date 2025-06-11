import { useEffect, useState } from 'react';

function ProfileStats({ gameName, tagLine }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameName || !tagLine) return;
    fetch(`http://localhost:3001/api/account/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch account');
        return res.json();
      })
      .then(setProfile)
      .catch(err => setError(err.message));
  }, [gameName, tagLine]);

  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!profile) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>;

  const { account, ranked } = profile;

  // Find solo queue stats (or use first entry)
  const soloQ = ranked?.find(q => q.queueType === 'RANKED_SOLO_5x5') || ranked?.[0];
  let rank = 'Unranked', winRate = 'N/A';
  if (soloQ) {
    rank = `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)`;
    const wins = soloQ.wins;
    const losses = soloQ.losses;
    winRate = ((wins / (wins + losses)) * 100).toFixed(1) + '%';
  }

  return (
    <div className="card mx-auto gwen-card">
      <div className="card-body">
        <h2 className="card-title mb-3">Riot Account</h2>
        <ul className="list-group mb-3">
          <li className="list-group-item bg-light">
            <strong>Game Name:</strong> {account.gameName}
          </li>
          <li className="list-group-item bg-light">
            <strong>Tag Line:</strong> {account.tagLine}
          </li>
          <li className="list-group-item bg-light">
            <strong>PUUID:</strong> {account.puuid}
          </li>
          <li className="list-group-item bg-light">
            <strong>Rank:</strong> {rank}
          </li>
          <li className="list-group-item bg-light">
            <strong>Win Rate:</strong> {winRate}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ProfileStats;