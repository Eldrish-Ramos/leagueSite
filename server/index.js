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
      iconId: summonerData.profileIconId,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/matches/:puuid', async (req, res) => {
  const { puuid } = req.params;
  const count = parseInt(req.query.count, 10) || 8;
  const apiKey = process.env.RIOT_API_KEY;

  try {
    // Step 1: Get recent match IDs
    const matchIdsRes = await fetch(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${count}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
      }
    );
    if (!matchIdsRes.ok) {
      const text = await matchIdsRes.text();
      return res.status(matchIdsRes.status).json({ error: 'Failed to fetch match IDs', details: text });
    }
    const matchIds = await matchIdsRes.json();

    // Step 2: Fetch match details for each match ID
    const matchPromises = matchIds.map(async (matchId) => {
      const matchRes = await fetch(
        `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            'X-Riot-Token': apiKey,
          },
        }
      );
      if (!matchRes.ok) return null;
      const matchData = await matchRes.json();

      let purchaseHistory = [];
      try {
        const timelineRes = await fetch(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`,
          {
            headers: {
              'X-Riot-Token': apiKey,
            },
          }
        );
        if (timelineRes.ok) {
          const timeline = await timelineRes.json();
          const participantId = matchData.metadata.participants.indexOf(puuid) + 1;
          timeline.info.frames.forEach(frame => {
            frame.events.forEach(event => {
              if (
                event.type === 'ITEM_PURCHASED' &&
                event.participantId === participantId
              ) {
                purchaseHistory.push({
                  minute: Math.floor(event.timestamp / 60000),
                  second: Math.floor((event.timestamp % 60000) / 1000),
                  itemId: event.itemId,
                  // Optionally, you can map itemId to itemName using Data Dragon or a static file
                  itemName: null
                });
              }
            });
          });
        }
      } catch (e) {
        // Ignore timeline errors, just don't provide purchaseHistory
      }

      // Find participant for this puuid
      const participant = matchData.info.participants.find(p => p.puuid === puuid);
      if (!participant) return null;

      // Format duration as mm:ss
      const durationSec = matchData.info.gameDuration;
      const duration = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`;

      // Get queue type (optional: you can map queueId to a name if you want)
      let queue = matchData.info.queueId;
      if (queue === 420) queue = 'Ranked Solo';
      else if (queue === 440) queue = 'Ranked Flex';
      else if (queue === 430) queue = 'Normal Blind';
      else if (queue === 400) queue = 'Normal Draft';
      else queue = 'Game';

      const items = [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5,
        participant.item6
      ];

      return {
        matchId,
        queue,
        result: participant.win ? 'Win' : 'Loss',
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        duration,
        items,
        purchaseHistory,
      };
    });

    const matches = (await Promise.all(matchPromises)).filter(Boolean);

    res.json({ matches });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});