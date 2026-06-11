/****************************************
 * CONFIG: Telegram + RapidAPI
 ****************************************/
const TELEGRAM_TOKEN = "8858281538:AAF5heK6dlTUhwtPlXtFbOZ8bJphYE6S4TM";

// CHAT IDs
const CHAT_ID_PRIVATE      = "1348431344";      // Mondyal 2036 (chat prive)
const CHAT_ID_CARREFOURMAG = "-1001648939741";  // CARREFOURMAG channel

const RAPIDAPI_KEY  = "fcd4214954msh292aad8343b8a63p196377jsn6476de1ca0ba";
const RAPIDAPI_HOST = "free-api-live-football-data.p.rapidapi.com";

/****************************************
 * FLAGS
 ****************************************/
const FLAGS = {
  "Haiti": "🇭🇹", "Brezil": "🇧🇷", "Ajantin": "🇦🇷",
  "USA": "🇺🇸", "Etazini": "🇺🇸", "France": "🇫🇷",
  "Lafrans": "🇫🇷", "Spain": "🇪🇸", "Espay": "🇪🇸",
  "Germany": "🇩🇪", "Almay": "🇩🇪", "Italy": "🇮🇹",
  "Itali": "🇮🇹", "Portugal": "🇵🇹", "England": "🏴",
  "Angletè": "🏴", "Netherlands": "🇳🇱", "Oland": "🇳🇱",
  "Mexico": "🇲🇽", "Meksik": "🇲🇽", "Canada": "🇨🇦",
  "Kanada": "🇨🇦"
};

function flag(country) {
  return FLAGS[country] || "";
}

/****************************************
 * LOGOS & PLAYER PHOTOS
 ****************************************/
function getTeamLogo(team) {
  if (!team) return "";
  try {
    const api = "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(team + " national football team");
    const res = UrlFetchApp.fetch(api, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    return data.thumbnail?.source || "";
  } catch (e) { return ""; }
}

function getPlayerPhoto(player) {
  if (!player) return "";
  try {
    const api = "https://api.duckduckgo.com/?q=" +
      encodeURIComponent(player + " footballer") +
      "&format=json&pretty=1";
    const res = UrlFetchApp.fetch(api, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    return data.Image || "";
  } catch (e) { return ""; }
}

function getCompetitionLogo(name) {
  if (!name) return "";
  try {
    const api = "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(name);
    const res = UrlFetchApp.fetch(api, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    return data.thumbnail?.source || "";
  } catch (e) { return ""; }
}

/****************************************
 * MATCH STATS (RapidAPI)
 ****************************************/
function getMatchStats(matchId) {
  try {
    const url = `https://${RAPIDAPI_HOST}/football/match-statistics?matchId=${matchId}`;
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      muteHttpExceptions: true
    });

    const data = JSON.parse(res.getContentText());
    const stats = data?.data?.statistics || {};

    return {
      possession: stats.possession || "N/A",
      shots: stats.shots_total || "N/A",
      shotsOnTarget: stats.shots_on_target || "N/A",
      fouls: stats.fouls || "N/A",
      saves: stats.saves || "N/A",
      xg: stats.xg || "N/A"
    };
  } catch (e) { return null; }
}

/****************************************
 * LINEUPS (SofaScore)
 ****************************************/
function getLineupsFromSofaScore(matchId) {
  try {
    const url = `https://api.sofascore.com/api/v1/event/${matchId}/lineups`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());

    const home = data.home;
    const away = data.away;

    const mapXI = p => ({
      name: p.player.name,
      pos: p.position,
      number: p.jerseyNumber,
      photo: `https://api.sofascore.app/api/v1/player/${p.player.id}/image`
    });

    return {
      homeFormation: home.formation,
      awayFormation: away.formation,
      homeXI: home.players.filter(p => !p.substitute).map(mapXI),
      awayXI: away.players.filter(p => !p.substitute).map(mapXI),
      homeBench: home.players.filter(p => p.substitute).map(p => p.player.name),
      awayBench: away.players.filter(p => p.substitute).map(p => p.player.name)
    };
  } catch (e) { return null; }
}

/****************************************
 * HIGHLIGHTS (RapidAPI)
 ****************************************/
function getHighlights(matchId) {
  try {
    const url = `https://${RAPIDAPI_HOST}/football/match-highlights?matchId=${matchId}`;
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      muteHttpExceptions: true
    });

    const h = JSON.parse(res.getContentText())?.data?.highlights?.[0];
    return h ? { title: h.title, url: h.url } : null;
  } catch (e) { return null; }
}

/****************************************
 * STANDINGS (RapidAPI)
 ****************************************/
function getStandings(leagueId) {
  try {
    const url = `https://${RAPIDAPI_HOST}/football/standings?leagueId=${leagueId}`;
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      muteHttpExceptions: true
    });

    return JSON.parse(res.getContentText())?.data?.standings || null;
  } catch (e) { return null; }
}

/****************************************
 * TACTICAL IMAGES (Cloudflare Workers)
 ****************************************/
function getTacticalBoardImage(matchId) {
  return `https://your-worker-url.workers.dev/tactical?matchId=${matchId}`;
}
function getHeatmapImage(matchId) {
  return `https://your-worker-url.workers.dev/heatmap?matchId=${matchId}`;
}
function getPassNetworkImage(matchId) {
  return `https://your-worker-url.workers.dev/passmap?matchId=${matchId}`;
}
function getXTMapImage(matchId) {
  return `https://your-worker-url.workers.dev/xt?matchId=${matchId}`;
}
function getAveragePositionImage(matchId) {
  return `https://your-worker-url.workers.dev/avgpos?matchId=${matchId}`;
}

/****************************************
 * TELEGRAM
 ****************************************/
function sendTelegramTo(chatId, message, imageUrl = null) {
  const url = imageUrl
    ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`
    : `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  const payload = imageUrl
    ? { chat_id: chatId, photo: imageUrl, caption: message, parse_mode: "HTML" }
    : { chat_id: chatId, text: message, parse_mode: "HTML" };

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}

function sendToMultipleChats(message, imageUrl, chatIds) {
  chatIds.forEach(id => sendTelegramTo(id, message, imageUrl));
}

/****************************************
 * FORMAT EVENT (MANUAL EVENTS SHEET)
 ****************************************/
function formatEvent(row) {
  const matchId = row[0];
  const home    = row[1];
  const away    = row[2];
  const score   = row[3];
  const minute  = row[4];
  const type    = row[5];
  const player  = row[8];
  const assist  = row[9];
  const comp    = row[10];

  const possession = row[11];
  const shots      = row[12];
  const sot        = row[13];
  const fouls      = row[14];
  const saves      = row[15];
  const xg         = row[16];

  const compLogo  = getCompetitionLogo(comp);
  const teamLogo  = getTeamLogo(home);
  const playerImg = getPlayerPhoto(player);

  switch (type) {

    case "GOAL":
      return {
        text: `
<b>⚽️ GÒL !!!</b>
${flag(home)} <b>${home}</b> ${score} <b>${away}</b> ${flag(away)}
<i>Min: ${minute}’</i>

👤 <b>Buteur:</b> ${player}
🎯 <b>Assist:</b> ${assist}

🏆 <b>${comp}</b>
`,
        image: playerImg || teamLogo || compLogo
      };

    case "CARD":
      return {
        text: `
🟨 <b>KAT JÒN</b>
${flag(home)} ${home} vs ${away} ${flag(away)}
<i>Min: ${minute}’</i>

👤 <b>Jwè:</b> ${player}

🏆 <b>${comp}</b>
`,
        image: teamLogo || compLogo
      };

    case "VAR":
      return {
        text: `
🖥️ <b>VAR REVIEW</b>
${flag(home)} ${home} vs ${away} ${flag(away)}
<i>Min: ${minute}’</i>

<b>Decisyon:</b> ${player}

🏆 <b>${comp}</b>
`,
        image: compLogo || teamLogo
      };

    case "HALFTIME":
      return {
        text: `
⏸️ <b>MITAN</b>
${flag(home)} <b>${home}</b> ${score} <b>${away}</b> ${flag(away)}

📊 <b>STATISTIK MITAN</b>
🔹 Possession: ${possession}
🔹 Shots: ${shots}
🔹 On Target: ${sot}
🔹 Fouls: ${fouls}
🔹 Saves: ${saves}
🔹 xG: ${xg}

🏆 <b>${comp}</b>
`,
        image: compLogo || teamLogo
      };

    case "FINAL":
      return {
        text: `
🏁 <b>FINAL SCORE</b>
${flag(home)} <b>${home}</b> ${score} <b>${away}</b> ${flag(away)}

📊 <b>STATISTIK MATCH</b>
🔹 Possession: ${possession}
🔹 Shots: ${shots}
🔹 On Target: ${sot}
🔹 Fouls: ${fouls}
🔹 Saves: ${saves}
🔹 xG: ${xg}

⭐ Man of the Match: ${player}

🏆 <b>${comp}</b>
`,
        image: compLogo || teamLogo
      };

    case "LINEUPS":
      const L = getLineupsFromSofaScore(matchId);
      if (!L) return { text: "", image: "" };

      const firstPhoto =
        L.homeXI[0]?.photo ||
        L.awayXI[0]?.photo ||
        teamLogo ||
        compLogo;

      const formatXI = list =>
        list.map(p => `• <b>${p.name}</b> (${p.pos}) #${p.number}`).join("\n");

      const formatBench = list =>
        list.map(n => `• ${n}`).join("\n");

      return {
        text: `
📋 <b>LINEUPS OFISYÈL</b>

${flag(home)} <b>${home}</b> — <i>${L.homeFormation}</i>
<b>XI:</b>
${formatXI(L.homeXI)}

${flag(away)} <b>${away}</b> — <i>${L.awayFormation}</i>
<b>XI:</b>
${formatXI(L.awayXI)}

🪑 <b>Bench ${home}:</b>
${formatBench(L.homeBench)}

🪑 <b>Bench ${away}:</b>
${formatBench(L.awayBench)}

🏆 <b>${comp}</b>
`,
        image: firstPhoto
      };

    case "HIGHLIGHTS":
      const hl = getHighlights(matchId);
      if (!hl) return { text: "", image: "" };
      return {
        text: `
🎬 <b>HIGHLIGHTS MATCH LA</b>
${flag(home)} <b>${home}</b> ${score} <b>${away}</b> ${flag(away)}

<b>${hl.title}</b>
${hl.url}

🏆 <b>${comp}</b>
`,
        image: compLogo || teamLogo
      };

    case "STANDINGS":
      const standings = getStandings(matchId);
      if (!standings) return { text: "", image: "" };

      let txt = "🏆 <b>STANDINGS</b>\n\n";
      standings.slice(0, 10).forEach((t, i) => {
        txt += `${i + 1}. <b>${t.team}</b> - ${t.points} pts (GD: ${t.goalDiff})\n`;
      });

      return { text: txt, image: compLogo };

    case "TACTICAL":
      return {
        text: `
🧠 <b>TACTICAL BOARD</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

📍 Position map (GK, DF, MF, FW)

🏆 <b>${comp}</b>
`,
        image: getTacticalBoardImage(matchId)
      };

    case "HEATMAP":
      return {
        text: `
🔥 <b>HEATMAP MATCH LA</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Zòn ki pi cho sou teren an.

🏆 <b>${comp}</b>
`,
        image: getHeatmapImage(matchId)
      };

    case "PASSMAP":
      return {
        text: `
🔗 <b>PASS NETWORK</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Koneksyon ant jwè yo.

🏆 <b>${comp}</b>
`,
        image: getPassNetworkImage(matchId)
      };

    case "XTMAP":
      return {
        text: `
📊 <b>EXPECTED THREAT (xT)</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Zòn ki kreye plis danje.

🏆 <b>${comp}</b>
`,
        image: getXTMapImage(matchId)
      };

    case "AVGPOS":
      return {
        text: `
🧠 <b>AVERAGE POSITION MAP</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Pozisyon mwayèn jwè yo.

🏆 <b>${comp}</b>
`,
        image: getAveragePositionImage(matchId)
      };

    case "START":
      return {
        text: `
🚀 <b>MATCH STARTED</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Kickoff now!

🏆 <b>${comp}</b>
`,
        image: teamLogo || compLogo
      };

    default:
      return { text: "", image: "" };
  }
}

/****************************************
 * UPDATE STATS IN SHEET (HALFTIME/FINAL)
 ****************************************/
function updateStatsInSheet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();

  for (let i = 2; i <= lastRow; i++) {
    const matchId = sheet.getRange(i, 1).getValue();
    const type    = sheet.getRange(i, 6).getValue();

    if (type === "FINAL" || type === "HALFTIME") {
      const stats = getMatchStats(matchId);
      if (stats) {
        sheet.getRange(i, 12).setValue(stats.possession);
        sheet.getRange(i, 13).setValue(stats.shots);
        sheet.getRange(i, 14).setValue(stats.shotsOnTarget);
        sheet.getRange(i, 15).setValue(stats.fouls);
        sheet.getRange(i, 16).setValue(stats.saves);
        sheet.getRange(i, 17).setValue(stats.xg);
      }
    }
  }
}

/****************************************
 * PROCESS MANUAL EVENTS → TELEGRAM
 ****************************************/
function processEventsForTelegram() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 17).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const status = row[6];

    if (status === "READY") {
      const event = formatEvent(row);

      if (event.text.trim() !== "") {
        sendToMultipleChats(event.text, event.image, [
          CHAT_ID_CARREFOURMAG,
          CHAT_ID_PRIVATE
        ]);

        sheet.getRange(i + 2, 7).setValue("POSTED");
        sheet.getRange(i + 2, 8).setValue(event.text);
      }
    }
  }
}

/****************************************
 * AUTO MODULES — MATCH START
 * Col: R = START_SENT
 ****************************************/
function checkMatchStart() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 18).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const startSent = row[17];

    if (!matchId || startSent === "YES") continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const status = json?.event?.status?.type;

    if (status === "inprogress") {
      const message = `
🚀 <b>MATCH STARTED</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Kickoff now!

🏆 <b>${comp}</b>
`;

      sendToMultipleChats(message, null, [
        CHAT_ID_CARREFOURMAG,
        CHAT_ID_PRIVATE
      ]);

      sheet.getRange(i + 2, 18).setValue("YES");
    }
  }
}

/****************************************
 * AUTO MODULES — MATCH END
 * Col: S = END_SENT
 ****************************************/
function checkMatchEnd() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 19).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const endSent = row[18];

    if (!matchId || endSent === "YES") continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const status = json?.event?.status?.type;
    const scoreHome = json?.event?.homeScore?.current ?? 0;
    const scoreAway = json?.event?.awayScore?.current ?? 0;

    if (status === "finished") {
      const message = `
🏁 <b>MATCH FINISHED</b>
${flag(home)} <b>${home}</b> ${scoreHome}–${scoreAway} <b>${away}</b> ${flag(away)}

Full-time whistle!

🏆 <b>${comp}</b>
`;

      sendToMultipleChats(message, null, [
        CHAT_ID_CARREFOURMAG,
        CHAT_ID_PRIVATE
      ]);

      sheet.getRange(i + 2, 19).setValue("YES");
    }
  }
}

/****************************************
 * AUTO MODULES — GOAL (SCORE CHANGE)
 * Col: T = LAST_SCORE
 ****************************************/
function checkGoals() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 20).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastScore = row[19];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const homeScore = json?.event?.homeScore?.current ?? 0;
    const awayScore = json?.event?.awayScore?.current ?? 0;

    const currentScore = `${homeScore}-${awayScore}`;

    if (currentScore !== lastScore && lastScore !== "") {
      const scorerTeam = homeScore > parseInt(lastScore.split("-")[0])
        ? home
        : away;

      const message = `
⚽🔥 <b>GÒL !!!</b>

${flag(home)} <b>${home}</b> ${currentScore} <b>${away}</b> ${flag(away)}

<b>Team that scored:</b> ${scorerTeam}

🏆 <b>${comp}</b>
`;

      sendToMultipleChats(message, null, [
        CHAT_ID_CARREFOURMAG,
        CHAT_ID_PRIVATE
      ]);
    }

    sheet.getRange(i + 2, 20).setValue(currentScore);
  }
}

/****************************************
 * AUTO MODULES — GOAL SCORER (INCIDENTS)
 * Col: V = LAST_GOAL_MINUTE
 ****************************************/
function checkGoalScorers() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastGoalMinute = row[21];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const incidents = json?.incidents || [];
    const goals = incidents.filter(x => x.type === "goal");

    if (goals.length === 0) continue;

    const last = goals[goals.length - 1];

    const minute = last.time;
    const scorer = last.player?.name || "Unknown";
    const assist = last.assist?.name || "None";
    const teamSide = last.teamSide;

    if (minute == lastGoalMinute) continue;

    const scoringTeam = teamSide === "home" ? home : away;

    const message = `
⚽🔥 <b>GÒL !!!</b>

<b>${scoringTeam}</b> scored!

👤 <b>Buteur:</b> ${scorer}
🎯 <b>Assist:</b> ${assist}
⏱️ <b>Minut:</b> ${minute}’

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 22).setValue(minute);
  }
}

/****************************************
 * AUTO MODULES — LINEUPS (PRE-MATCH)
 * Col: U = LINEUPS_SENT
 ****************************************/
function checkLineups() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 21).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lineupSent = row[20];

    if (!matchId || lineupSent === "YES") continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/lineups`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const homePlayers = json?.home?.players;
    const awayPlayers = json?.away?.players;

    if (!homePlayers || !awayPlayers) continue;

    const homeXI = homePlayers.filter(p => !p.substitute);
    const awayXI = awayPlayers.filter(p => !p.substitute);

    const homeFormation = json?.home?.formation || "";
    const awayFormation = json?.away?.formation || "";

    const formatXI = list =>
      list.map(p => `• <b>${p.player.name}</b> (${p.position}) #${p.jerseyNumber}`).join("\n");

    const formatBench = list =>
      list.filter(p => p.substitute).map(p => `• ${p.player.name}`).join("\n");

    const message = `
📋 <b>LINEUPS OFISYÈL</b>

${flag(home)} <b>${home}</b> — <i>${homeFormation}</i>
<b>XI:</b>
${formatXI(homeXI)}

${flag(away)} <b>${away}</b> — <i>${awayFormation}</i>
<b>XI:</b>
${formatXI(awayXI)}

🪑 <b>Bench ${home}:</b>
${formatBench(homePlayers)}

🪑 <b>Bench ${away}:</b>
${formatBench(awayPlayers)}

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 21).setValue("YES");
  }
}

/****************************************
 * AUTO MODULES — PENALTY SHOOTOUT
 * Cols: W,X,Y,Z,AA
 ****************************************/
function checkPenaltyShootout() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 27).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];

    const shootHome = row[22];
    const shootAway = row[23];
    const lastHome = row[24];
    const lastAway = row[25];
    const finished = row[26];

    if (!matchId || finished === "YES") continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const status = json?.event?.status?.type;
    const shootout = json?.event?.shootout;

    if (!shootout) continue;

    const newHome = shootout.home ?? 0;
    const newAway = shootout.away ?? 0;

    if (newHome > lastHome) {
      const message = `
🥅 <b>PENALTY SCORED!</b>
${flag(home)} <b>${home}</b>

<b>Score:</b> ${newHome} – ${newAway}

🏆 <b>${comp}</b>
`;

      sendToMultipleChats(message, null, [
        CHAT_ID_CARREFOURMAG,
        CHAT_ID_PRIVATE
      ]);

      sheet.getRange(i + 2, 25).setValue(newHome);
    }

    if (newAway > lastAway) {
      const message = `
🥅 <b>PENALTY SCORED!</b>
${flag(away)} <b>${away}</b>

<b>Score:</b> ${newHome} – ${newAway}

🏆 <b>${comp}</b>
`;

      sendToMultipleChats(message, null, [
        CHAT_ID_CARREFOURMAG,
        CHAT_ID_PRIVATE
      ]);

      sheet.getRange(i + 2, 26).setValue(newAway);
    }

    if (status === "finished") {
      const message = `
🏁 <b>PENALTY SHOOTOUT FINISHED</b>

${flag(home)} <b>${home}</b> ${newHome} – ${newAway} <b>${away}</b> ${flag(away)}

🏆 <b>${comp}</b>
`;

      sendToMultipleChats(message, null, [
        CHAT_ID_CARREFOURMAG,
        CHAT_ID_PRIVATE
      ]);

      sheet.getRange(i + 2, 27).setValue("YES");
    }

    sheet.getRange(i + 2, 23).setValue(newHome);
    sheet.getRange(i + 2, 24).setValue(newAway);
  }
}

/****************************************
 * AUTO MODULES — PENALTY MISSED
 * Col: AB = LAST_MISSED_MINUTE
 ****************************************/
function checkPenaltyMissed() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 28).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastMissed = row[27];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const incidents = json?.incidents || [];
    const missed = incidents.filter(x => x.type === "missedPenalty");

    if (missed.length === 0) continue;

    const last = missed[missed.length - 1];

    const minute = last.time;
    const player = last.player?.name || "Unknown";
    const teamSide = last.teamSide;
    const team = teamSide === "home" ? home : away;

    if (minute == lastMissed) continue;

    const message = `
❌🥅 <b>PENALTY MISSED!</b>

<b>${team}</b> failed to score.

👤 <b>Jwè:</b> ${player}
⏱️ <b>Minut:</b> ${minute}’

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 28).setValue(minute);
  }
}

/****************************************
 * AUTO MODULES — VAR
 * Col: AC = LAST_VAR_MINUTE
 ****************************************/
function checkVAR() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 29).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastVar = row[28];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const incidents = json?.incidents || [];
    const vars = incidents.filter(x => x.type === "var");

    if (vars.length === 0) continue;

    const last = vars[vars.length - 1];
    const minute = last.time;
    const reason = last.text || "VAR check";

    if (minute == lastVar) continue;

    const message = `
🖥️ <b>VAR REVIEW</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

⏱️ <b>Minut:</b> ${minute}’
📋 <b>Motif:</b> ${reason}

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 29).setValue(minute);
  }
}

/****************************************
 * AUTO MODULES — RED CARD
 * Col: AD = LAST_RED_MINUTE
 ****************************************/
function checkRedCards() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 30).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastRed = row[29];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const incidents = json?.incidents || [];
    const reds = incidents.filter(x => x.type === "card" && x.card === "red");

    if (reds.length === 0) continue;

    const last = reds[reds.length - 1];

    const minute = last.time;
    const player = last.player?.name || "Unknown";
    const teamSide = last.teamSide;
    const team = teamSide === "home" ? home : away;

    if (minute == lastRed) continue;

    const message = `
🟥 <b>RED CARD!</b>

${team} down to 10 men.

👤 <b>Jwè:</b> ${player}
⏱️ <b>Minut:</b> ${minute}’

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 30).setValue(minute);
  }
}

/****************************************
 * AUTO MODULES — HIGHLIGHTS
 * Col: AE = HIGHLIGHTS_SENT
 ****************************************/
function checkHighlightsAuto() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 31).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const sent = row[30];

    if (!matchId || sent === "YES") continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const status = json?.event?.status?.type;
    if (status !== "finished") continue;

    const hl = getHighlights(matchId);
    if (!hl) continue;

    const message = `
🎬 <b>HIGHLIGHTS MATCH LA</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

<b>${hl.title}</b>
${hl.url}

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 31).setValue("YES");
  }
}

/****************************************
 * AUTO MODULES — OFFSIDE
 * Col: AF = LAST_OFFSIDE_MINUTE
 ****************************************/
function checkOffside() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 32).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastOff = row[31];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const incidents = json?.incidents || [];
    const offsides = incidents.filter(x => x.type === "offside");

    if (offsides.length === 0) continue;

    const last = offsides[offsides.length - 1];

    const minute = last.time;
    const teamSide = last.teamSide;
    const team = teamSide === "home" ? home : away;

    if (minute == lastOff) continue;

    const message = `
🚩 <b>OFFSIDE</b>

${team} caught offside.

⏱️ <b>Minut:</b> ${minute}’

🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 32).setValue(minute);
  }
}

/****************************************
 * AUTO MODULES — SUBSTITUTIONS
 * Col: AG = LAST_SUB_MINUTE
 ****************************************/
function checkSubstitutions() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 33).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const matchId = row[0];
    const home = row[1];
    const away = row[2];
    const comp = row[10];
    const lastSub = row[32];

    if (!matchId) continue;

    const url = `https://api.sofascore.com/api/v1/event/${matchId}/incidents`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    const incidents = json?.incidents || [];
    const subs = incidents.filter(x => x.type === "substitution");

    if (subs.length === 0) continue;

    const last = subs[subs.length - 1];

    const minute = last.time;
    const playerIn = last.playerIn?.name || "Unknown";
    const playerOut = last.playerOut?.name || "Unknown";
    const teamSide = last.teamSide;
    const team = teamSide === "home" ? home : away;

    if (minute == lastSub) continue;

    const message = `
🔄 <b>SUBSTITUTION</b>

${flag(team)} <b>${team}</b>

⬆️ <b>Antre:</b> ${playerIn}
⬇️ <b>Soti:</b> ${playerOut}

⏱️ <b>Minut:</b> ${minute}’
🏆 <b>${comp}</b>
`;

    sendToMultipleChats(message, null, [
      CHAT_ID_CARREFOURMAG,
      CHAT_ID_PRIVATE
    ]);

    sheet.getRange(i + 2, 33).setValue(minute);
  }
}

/****************************************
 * (OPTIONAL) MASTER LIVE LOOP
 * Call this in a time-driven trigger every 1 min
 ****************************************/
function liveLoop() {
  checkMatchStart();
  checkMatchEnd();
  checkGoals();
  checkGoalScorers();
  checkLineups();
  checkPenaltyShootout();
  checkPenaltyMissed();
  checkVAR();
  checkRedCards();
  checkHighlightsAuto();
  checkOffside();
  checkSubstitutions();
}
