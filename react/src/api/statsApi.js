export async function fetchProfileStats(summonerName) {
  const response = await fetch(
    `http://localhost:3001/api/stats/${encodeURIComponent(summonerName)}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch profile stats');
  }
  return response.json();
}