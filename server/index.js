import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/account/:gameName/:tagLine', async (req, res) => {
  const { gameName, tagLine } = req.params;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    // Step 1: Get account info (to get puuid)
    const accountRes = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
      }
    );
    const accountText = await accountRes.text();
    if (!accountRes.ok) {
      console.error('Riot API error:', accountRes.status, accountText);
      return res.status(accountRes.status).json({ error: 'Failed to fetch account', details: accountText });
    }
    const accountData = JSON.parse(accountText);

    // Step 2: Get summoner info (to get summonerId)
    const summonerRes = await fetch(
      `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(accountData.puuid)}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
      }
    );
    const summonerText = await summonerRes.text();
    if (!summonerRes.ok) {
      console.error('Riot API error:', summonerRes.status, summonerText);
      return res.status(summonerRes.status).json({ error: 'Failed to fetch summoner', details: summonerText });
    }
    const summonerData = JSON.parse(summonerText);

    // Step 3: Get ranked stats
    const rankedRes = await fetch(
      `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerData.id)}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
      }
    );
    const rankedText = await rankedRes.text();
    if (!rankedRes.ok) {
      console.error('Riot API error:', rankedRes.status, rankedText);
      return res.status(rankedRes.status).json({ error: 'Failed to fetch ranked stats', details: rankedText });
    }
    const rankedData = JSON.parse(rankedText);

    res.json({
      account: accountData,
      summoner: summonerData,
      ranked: rankedData,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});