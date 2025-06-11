import { useEffect, useState } from 'react';

// Emblem images (public/emblems/) and color themes for each rank
const RANK_EMBLEMS = {
  IRON: '/emblems/Emblem_Iron.png',
  BRONZE: '/emblems/Emblem_Bronze.png',
  SILVER: '/emblems/Emblem_Silver.png',
  GOLD: '/emblems/Emblem_Gold.png',
  PLATINUM: '/emblems/Emblem_Platinum.png',
  EMERALD: '/emblems/Emblem_Emerald.png',
  DIAMOND: '/emblems/Emblem_Diamond.png',
  MASTER: '/emblems/Emblem_Master.png',
  GRANDMASTER: '/emblems/Emblem_Grandmaster.png',
  CHALLENGER: '/emblems/Emblem_Challenger.png',
};

const RANK_THEMES = {
  IRON: {
    card: 'linear-gradient(135deg, #232323 60%, #434343 100%)',
    border: '#7a7a7a',
    accent: '#b0b0b0',
    text: '#f5f5f5',
    badge: 'linear-gradient(135deg, #434343 60%, #232323 100%)'
  },
  BRONZE: {
    card: 'linear-gradient(135deg, #ad7b5c 0%, #6e4b2a 100%)',
    border: '#ad7b5c',
    accent: '#e0b089',
    text: '#fff8f0',
    badge: 'linear-gradient(135deg, #e0b089 0%, #ad7b5c 100%)'
  },
  SILVER: {
    card: 'linear-gradient(135deg, #e6e6e6 0%, #bfc6ce 60%, #7a838c 100%)',
    border: '#bfc6ce',
    accent: '#7a838c',
    text: '#232946',
    badge: 'linear-gradient(135deg, #e6e6e6 0%, #bfc6ce 60%, #7a838c 100%)'
  },
  GOLD: {
    card: 'linear-gradient(135deg, #fff6c1 0%, #ffe066 60%, #bfa43a 100%)',
    border: '#ffe066',
    accent: '#bfa43a',
    text: '#232946',
    badge: 'linear-gradient(135deg, #ffe066 0%, #fff6c1 100%)'
  },
  PLATINUM: {
    card: 'linear-gradient(135deg, #baffea 0%, #43e6b8 60%, #2e8c6a 100%)',
    border: '#43e6b8',
    accent: '#2e8c6a',
    text: '#232946',
    badge: 'linear-gradient(135deg, #baffea 0%, #43e6b8 100%)'
  },
  EMERALD: {
    card: 'linear-gradient(135deg, #0b3c2f 0%, #1e6b3a 40%, #3be881 80%, #baffd9 100%)',
    border: '#1e6b3a',
    accent: '#3be881',
    text: '#232946',
    badge: 'linear-gradient(135deg, #1e6b3a 0%, #3be881 70%, #baffd9 100%)'
  },
  DIAMOND: {
    card: 'linear-gradient(135deg, #b388ff 0%, #7ed6e7 60%, #3e4a7b 100%)',
    border: '#7ed6e7',
    accent: '#b388ff',
    text: '#232946',
    badge: 'linear-gradient(135deg, #7ed6e7 0%, #b388ff 100%)'
  },
  MASTER: {
    card: 'linear-gradient(135deg, #b388ff 0%, #7e57c2 100%)',
    border: '#b388ff',
    accent: '#fff',
    text: '#fff',
    badge: 'linear-gradient(135deg, #e0c3fc 0%, #b388ff 100%)'
  },
  GRANDMASTER: {
    card: 'linear-gradient(135deg, #ffd6e0 0%, #ff5e62 60%, #b388ff 100%)',
    border: '#ff5e62',
    accent: '#fff',
    text: '#fff',
    badge: 'linear-gradient(135deg, #ff5e62 0%, #ffd6e0 100%)'
  },
  CHALLENGER: {
    card: 'linear-gradient(135deg, #ffe066 0%, #7ed6e7 60%, #b388ff 100%)',
    border: '#ffe066',
    accent: '#232946',
    text: '#232946',
    badge: 'linear-gradient(135deg, #7ed6e7 0%, #ffe066 100%)'
  },
  UNRANKED: {
    card: 'linear-gradient(135deg, #232946 0%, #3e4a7b 100%)',
    border: '#7ed6e7',
    accent: '#e6eaff',
    text: '#e6eaff',
    badge: 'linear-gradient(135deg, #b388ff 0%, #7ed6e7 100%)'
  }
};

const ITEM_DATA_URL = 'https://ddragon.leagueoflegends.com/cdn/14.12.1/data/en_US/item.json';

function ProfileStats({ gameName, tagLine }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [itemData, setItemData] = useState({});

  useEffect(() => {
    fetch(ITEM_DATA_URL)
      .then(res => res.json())
      .then(data => setItemData(data.data || {}));
  }, []);

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

  useEffect(() => {
    if (!profile?.account?.puuid) return;
    setLoadingMatches(true);
    fetch(`http://localhost:3001/api/matches/${encodeURIComponent(profile.account.puuid)}?count=8`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch match history');
        return res.json();
      })
      .then(data => setMatches(data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false));
  }, [profile?.account?.puuid]);

  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!profile) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>;

  const { account, summoner, ranked } = profile;
  const soloQ = ranked?.find(q => q.queueType === 'RANKED_SOLO_5x5') || ranked?.[0];
  let rank = 'Unranked', winRate = 'N/A', tier = 'UNRANKED', lp = null, division = null;
  if (soloQ) {
    tier = soloQ.tier;
    division = soloQ.rank;
    lp = soloQ.leaguePoints;
    rank = `${tier} ${division} (${lp} LP)`;
    const wins = soloQ.wins;
    const losses = soloQ.losses;
    winRate = ((wins / (wins + losses)) * 100).toFixed(1) + '%';
  }
  const theme = RANK_THEMES[tier] || RANK_THEMES.UNRANKED;
  const iconId = summoner?.profileIconId || profile.iconId;
  const iconUrl = iconId
    ? `https://ddragon.leagueoflegends.com/cdn/14.12.1/img/profileicon/${iconId}.png`
    : '';
  const emblemUrl = tier && RANK_EMBLEMS[tier]
    ? RANK_EMBLEMS[tier]
    : RANK_EMBLEMS['IRON'];

  return (
    <>
      <div
        className="mx-auto"
        style={{
          maxWidth: 420,
          background: theme.card,
          borderRadius: '1.5rem',
          border: `2.5px solid ${theme.border}`,
          padding: '2.2rem 1.5rem 1.5rem 1.5rem',
          boxShadow: `0 4px 24px 0 #0003`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: theme.text,
          fontFamily: 'Quicksand, Segoe UI, Arial, sans-serif'
        }}
      >
        {/* Icon and Username */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 18
        }}>
          <img
            src={iconUrl}
            alt="Summoner Icon"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: `2.5px solid ${theme.border}`,
              background: theme.card,
              marginBottom: 10
            }}
          />
          <h2
            style={{
              color: theme.text,
              fontWeight: 800,
              fontSize: '1.7rem',
              letterSpacing: '0.5px',
              margin: 0,
              textShadow: 'none',
              lineHeight: 1.1
            }}
          >
            {account.gameName}
            <span style={{
              color: theme.accent,
              fontWeight: 600,
              fontSize: '1.05rem',
              marginLeft: 6
            }}>
              #{account.tagLine}
            </span>
          </h2>
        </div>
        {/* Emblem centered with label below */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 18,
          width: '100%'
        }}>
          <div
            style={{
              background: theme.badge,
              borderRadius: '50%',
              padding: 12,
              boxShadow: `0 0 0 4px ${theme.border}33, 0 2px 12px 0 #0002`,
              border: `2.5px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            <img
              src={emblemUrl}
              alt={`${tier || 'Unranked'} Emblem`}
              style={{
                width: 70,
                height: 70,
                display: 'block'
              }}
            />
          </div>
          <span
            style={{
              marginTop: 10,
              color: theme.text,
              fontWeight: 700,
              fontSize: '1.13rem',
              letterSpacing: '0.5px',
              background: theme.badge,
              borderRadius: '0.7rem',
              padding: '0.18rem 1.1rem',
              border: `1.5px solid ${theme.border}`,
              marginBottom: 2
            }}
          >
            {tier !== 'UNRANKED'
              ? tier.charAt(0) + tier.slice(1).toLowerCase()
              : 'Unranked'}
          </span>
        </div>
        {/* Rank and Winrate badges */}
        <div style={{
          margin: '1.1rem 0 0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span
            style={{
              background: theme.badge,
              color: theme.text,
              borderRadius: '1rem',
              padding: '0.38rem 1.1rem',
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '0.3px',
              border: `1.5px solid ${theme.border}`
            }}
          >
            {rank}
          </span>
          <span
            style={{
              background: theme.badge,
              color: theme.text,
              borderRadius: '1rem',
              padding: '0.38rem 1.1rem',
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '0.3px',
              border: `1.5px solid ${theme.border}`
            }}
          >
            Win Rate: {winRate}
          </span>
        </div>
        {/* Rank type */}
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              fontSize: '1.01rem',
              color: theme.text,
              opacity: 0.7,
              fontStyle: 'italic',
              letterSpacing: '0.2px'
            }}
          >
            {tier !== 'UNRANKED' ? `Ranked Solo/Duo` : `No ranked data for this season.`}
          </span>
        </div>
      </div>

      {/* Improved Match History Section for readability */}
      <div style={{
        maxWidth: 900,
        margin: '2.5rem auto 0 auto',
        background: '#232946',
        borderRadius: '1.5rem',
        border: '2.5px solid #b388ff',
        padding: '1.5rem 2rem 1.2rem 2rem',
        color: '#e6eaff',
        fontFamily: 'Quicksand, Segoe UI, Arial, sans-serif',
        boxShadow: '0 4px 24px 0 #7ed6e799, 0 2px 12px 0 #b388ff33',
        overflowX: 'auto'
      }}>
        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#ffe066',
          marginBottom: '1.2rem',
          letterSpacing: '1px',
          textAlign: 'center',
          textShadow: '0 2px 8px #23294688'
        }}>
          Recent Match History
        </h3>
        {loadingMatches ? (
          <div className="spinner-border text-primary" role="status" style={{ margin: '1rem auto', display: 'block' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ color: '#b388ff', fontStyle: 'italic', marginBottom: '1rem', textAlign: 'center' }}>
            No recent matches found.
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            {matches.map((match, idx) => (
              <div key={match.matchId || idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 160px 100px',
                  alignItems: 'center',
                  background: idx % 2 === 0
                    ? '#232946'
                    : '#2e3c5e',
                  borderRadius: '1rem',
                  marginBottom: 0,
                  padding: '1.1rem 1.5rem',
                  boxShadow: idx % 2 === 0
                    ? '0 2px 8px 0 #b388ff22'
                    : '0 2px 8px 0 #7ed6e722',
                  borderLeft: `6px solid ${match.result === 'Win' ? '#7ed6e7' : '#ff5e62'}`,
                  minHeight: 72
                }}
              >
                {/* Champion Icon */}
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/champion/${match.championName}.png`}
                  alt={match.championName}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '0.7rem',
                    border: `2px solid ${match.result === 'Win' ? '#7ed6e7' : '#ff5e62'}`,
                    background: '#181c2f',
                    boxShadow: '0 2px 8px #0004',
                    margin: '0 auto'
                  }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                {/* Main Info */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  minWidth: 0
                }}>
                  <div style={{
                    fontWeight: 700,
                    color: match.result === 'Win' ? '#7ed6e7' : '#ff5e62',
                    fontSize: '1.13rem',
                    letterSpacing: '0.5px',
                    marginBottom: 2,
                    textShadow: '0 1px 4px #23294699'
                  }}>
                    {match.queue || 'Game'} &mdash; {match.result || 'Unknown'}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 18,
                    fontSize: '1.06rem',
                    color: '#e6eaff',
                    fontWeight: 500
                  }}>
                    <span>
                      <span style={{ color: '#ffe066', fontWeight: 700 }}>KDA:</span>{' '}
                      <span style={{ color: '#b388ff', fontWeight: 700 }}>
                        {match.kills}/{match.deaths}/{match.assists}
                      </span>
                    </span>
                    <span>
                      <span style={{ color: '#7ed6e7', fontWeight: 700 }}>CS:</span>{' '}
                      <span style={{ color: '#ffe066', fontWeight: 700 }}>{match.cs}</span>
                    </span>
                    <span>
                      <span style={{ color: '#e0b089', fontWeight: 700 }}>Duration:</span>{' '}
                      <span style={{ color: '#e0b089', fontWeight: 700 }}>{match.duration}</span>
                    </span>
                  </div>
                  {/* Items Purchased */}
                  {match.items && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 6,
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ color: '#b388ff', fontWeight: 700, marginRight: 4 }}>Items:</span>
                      {match.items.length === 0 ? (
                        <span style={{ color: '#888', fontStyle: 'italic' }}>No items</span>
                      ) : (
                        match.items.map((itemId, i) =>
                          itemId > 0 ? (
                            <img
                              key={i}
                              src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/item/${itemId}.png`}
                              alt={`Item ${itemId}`}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: '1.5px solid #b388ff',
                                background: '#181c2f',
                                marginRight: 2,
                                objectFit: 'cover'
                              }}
                            />
                          ) : null
                        )
                      )}
                    </div>
                  )}
                  {/* Purchase History */}
                  {match.purchaseHistory && match.purchaseHistory.length > 0 && (
                    <div style={{
                      marginTop: 10,
                      background: '#181c2f',
                      borderRadius: '0.7rem',
                      padding: '0.7rem 1rem',
                      maxHeight: 140,
                      overflowY: 'auto',
                      fontSize: '0.99rem'
                    }}>
                      <span style={{ color: '#ffe066', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                        Purchase History:
                      </span>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}>
                        {match.purchaseHistory.map((purchase, i) => {
                          const itemName =
                            itemData && itemData[purchase.itemId]
                              ? itemData[purchase.itemId].name
                              : `Item ${purchase.itemId}`;
                          return (
                            <div key={i} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: i % 2 === 0 ? 'transparent' : '#232946',
                              borderRadius: 6,
                              padding: '2px 6px'
                            }}>
                              <span style={{
                                color: '#7ed6e7',
                                fontWeight: 600,
                                minWidth: 48,
                                fontVariantNumeric: 'tabular-nums'
                              }}>
                                [{purchase.minute}:{String(purchase.second).padStart(2, '0')}]
                              </span>
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/item/${purchase.itemId}.png`}
                                alt={itemName}
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 4,
                                  border: '1px solid #b388ff',
                                  background: '#232946',
                                  marginRight: 3,
                                  verticalAlign: 'middle'
                                }}
                              />
                              <span style={{
                                color: '#e6eaff',
                                fontWeight: 500,
                                fontSize: '1rem'
                              }}>
                                {itemName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {/* Champion Name and Result Badge in a vertical stack for better fit */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 160,
                  maxWidth: 220,
                  gap: 8
                }}>
                  <div style={{
                    fontWeight: 900,
                    color: '#fff',
                    fontSize: '1.18rem',
                    width: '100%',
                    textAlign: 'center',
                    textShadow: '0 2px 8px #181c2f, 0 1px 4px #000',
                    letterSpacing: '0.7px',
                    background: match.result === 'Win' ? '#2e8c6a' : '#b23a48',
                    borderRadius: '0.7rem',
                    padding: '0.3rem 0.7rem',
                    border: `2px solid ${match.result === 'Win' ? '#7ed6e7' : '#ff5e62'}`,
                    overflow: 'hidden',
                    display: 'block',
                    minWidth: 140,
                    maxWidth: 220,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                  }}>
                    {match.championName}
                  </div>
                  <div style={{
                    fontWeight: 700,
                    color: match.result === 'Win' ? '#232946' : '#fff',
                    fontSize: '1.05rem',
                    textAlign: 'center',
                    background: match.result === 'Win' ? '#7ed6e7' : '#ff5e62',
                    borderRadius: '0.7rem',
                    padding: '0.3rem 0.7rem',
                    border: `2px solid ${match.result === 'Win' ? '#43e6b8' : '#b23a48'}`,
                    boxShadow: '0 1px 4px #23294699',
                    width: '100%',
                    minWidth: 80
                  }}>
                    {match.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileStats;