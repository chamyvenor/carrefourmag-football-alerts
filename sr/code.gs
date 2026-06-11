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
 * Drapo otomatik pou peyi yo
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
 * LOGO EKIP OTOMATIK (Wikipedia)
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

/****************************************
 * FOTO JWÈ OTOMATIK (DuckDuckGo)
 ****************************************/
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

/****************************************
 * LOGO KONPETISYON (Wikipedia)
 ****************************************/
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
 * STATS MATCH (RapidAPI)
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
 * LINEUPS — SofaScore (PRO+)
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
 * STANDINGS
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
 * FIFA+ MODULES (BACKEND URLs)
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
 * TELEGRAM MULTI-SEND
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
 * FORMAT EVENT
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

    default:
      return { text: "", image: "" };
  }
}

/****************************************
 * UPDATE STATS IN SHEET
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
 * PROCESS EVENTS
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
