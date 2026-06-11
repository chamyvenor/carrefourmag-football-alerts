/****************************************
 * CONFIG: Telegram + RapidAPI
 ****************************************/
const TELEGRAM_TOKEN = "8858281538:AAF5heK6dlTUhwtPlXtFbOZ8bJphYE6S4TM";

// CHAT IDs
const CHAT_ID_PRIVATE     = "1348431344";     // Mondyal 2036 (chat prive ou)
const CHAT_ID_CARREFOURMAG = "-1001648939741"; // CARREFOURMAG channel

const RAPIDAPI_KEY  = "fcd4214954msh292aad8343b8a63p196377jsn6476de1ca0ba";
const RAPIDAPI_HOST = "free-api-live-football-data.p.rapidapi.com";

/****************************************
 * Drapo otomatik pou peyi yo
 ****************************************/
const FLAGS = {
  "Haiti": "🇭🇹",
  "Brezil": "🇧🇷",
  "Ajantin": "🇦🇷",
  "USA": "🇺🇸",
  "Etazini": "🇺🇸",
  "France": "🇫🇷",
  "Lafrans": "🇫🇷",
  "Spain": "🇪🇸",
  "Espay": "🇪🇸",
  "Germany": "🇩🇪",
  "Almay": "🇩🇪",
  "Italy": "🇮🇹",
  "Itali": "🇮🇹",
  "Portugal": "🇵🇹",
  "England": "🏴",
  "Angletè": "🏴",
  "Netherlands": "🇳🇱",
  "Oland": "🇳🇱",
  "Mexico": "🇲🇽",
  "Meksik": "🇲🇽",
  "Canada": "🇨🇦",
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
    if (data.thumbnail && data.thumbnail.source) return data.thumbnail.source;
  } catch (e) {
    Logger.log("Team logo error: " + e);
  }
  return "";
}

/****************************************
 * FOTO JWÈ OTOMATIK (DuckDuckGo) – pou GOAL
 ****************************************/
function getPlayerPhoto(player) {
  if (!player) return "";
  try {
    const api = "https://api.duckduckgo.com/?q=" +
      encodeURIComponent(player + " footballer") +
      "&format=json&pretty=1";
    const res = UrlFetchApp.fetch(api, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    if (data.Image) return data.Image;
  } catch (e) {
    Logger.log("Player photo error: " + e);
  }
  return "";
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
    if (data.thumbnail && data.thumbnail.source) return data.thumbnail.source;
  } catch (e) {
    Logger.log("Competition logo error: " + e);
  }
  return "";
}

/****************************************
 * STATS MATCH (RapidAPI)
 ****************************************/
function getMatchStats(matchId) {
  if (!matchId) return null;
  try {
    const url = "https://" + RAPIDAPI_HOST +
      "/football/match-statistics?matchId=" + matchId;

    const options = {
      method: "get",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      muteHttpExceptions: true
    };

    const res = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(res.getContentText());
    if (!data || !data.data || !data.data.statistics) return null;

    const stats = data.data.statistics;
    const get = k => stats[k] || "N/A";

    return {
      possession:    get("possession"),
      shots:         get("shots_total"),
      shotsOnTarget: get("shots_on_target"),
      fouls:         get("fouls"),
      saves:         get("saves"),
      xg:            get("xg")
    };
  } catch (e) {
    Logger.log("Match stats error: " + e);
    return null;
  }
}

/****************************************
 * LINEUPS — SofaScore (PRO+)
 ****************************************/
function getLineupsFromSofaScore(matchId) {
  try {
    const url = "https://api.sofascore.com/api/v1/event/" + matchId + "/lineups";
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    if (!data || !data.home || !data.away) return null;

    const home = data.home;
    const away = data.away;

    const homeXI = home.players
      .filter(p => p.substitute === false)
      .map(p => ({
        name: p.player.name,
        pos: p.position,
        number: p.jerseyNumber,
        photo: "https://api.sofascore.app/api/v1/player/" + p.player.id + "/image"
      }));

    const awayXI = away.players
      .filter(p => p.substitute === false)
      .map(p => ({
        name: p.player.name,
        pos: p.position,
        number: p.jerseyNumber,
        photo: "https://api.sofascore.app/api/v1/player/" + p.player.id + "/image"
      }));

    const homeBench = home.players
      .filter(p => p.substitute === true)
      .map(p => p.player.name);

    const awayBench = away.players
      .filter(p => p.substitute === true)
      .map(p => p.player.name);

    return {
      homeFormation: home.formation,
      awayFormation: away.formation,
      homeXI,
      awayXI,
      homeBench,
      awayBench
    };

  } catch (e) {
    Logger.log("SofaScore lineup error: " + e);
    return null;
  }
}

/****************************************
 * HIGHLIGHTS (RapidAPI – egzanp)
 ****************************************/
function getHighlights(matchId) {
  if (!matchId) return null;
  try {
    const url = "https://" + RAPIDAPI_HOST +
      "/football/match-highlights?matchId=" + matchId;

    const options = {
      method: "get",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      muteHttpExceptions: true
    };

    const res = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(res.getContentText());
    if (!data || !data.data || !data.data.highlights) return null;

    const h = data.data.highlights[0] || {};
    return {
      title: h.title || "Highlights",
      url:   h.url   || ""
    };
  } catch (e) {
    Logger.log("Highlights error: " + e);
    return null;
  }
}

/****************************************
 * STANDINGS (RapidAPI – egzanp)
 ****************************************/
function getStandings(leagueId) {
  if (!leagueId) return null;
  try {
    const url = "https://" + RAPIDAPI_HOST +
      "/football/standings?leagueId=" + leagueId;

    const options = {
      method: "get",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      muteHttpExceptions: true
    };

    const res = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(res.getContentText());
    if (!data || !data.data || !data.data.standings) return null;

    return data.data.standings; // array
  } catch (e) {
    Logger.log("Standings error: " + e);
    return null;
  }
}

/****************************************
 * TACTICAL / HEATMAP / PASSMAP / XTMAP / AVGPOS
 * Ranplase URL yo ak backend pa w
 ****************************************/
function getTacticalBoardImage(matchId) {
  if (!matchId) return "";
  return "https://your-api.com/tactical-board?matchId=" + encodeURIComponent(matchId);
}

function getHeatmapImage(matchId) {
  if (!matchId) return "";
  return "https://your-api.com/heatmap?matchId=" + encodeURIComponent(matchId);
}

function getPassNetworkImage(matchId) {
  if (!matchId) return "";
  return "https://your-api.com/pass-network?matchId=" + encodeURIComponent(matchId);
}

function getXTMapImage(matchId) {
  if (!matchId) return "";
  return "https://your-api.com/xt-map?matchId=" + encodeURIComponent(matchId);
}

function getAveragePositionImage(matchId) {
  if (!matchId) return "";
  return "https://your-api.com/avg-position?matchId=" + encodeURIComponent(matchId);
}

/****************************************
 * Voye mesaj / foto nan Telegram (multi-destinasyon)
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
  chatIds.forEach(id => {
    sendTelegramTo(id, message, imageUrl);
  });
}

/****************************************
 * Fòmate pwofesyonèl pou evènman yo
 ****************************************/
function formatEvent(row) {
  if (!row || row.length < 17) return { text: "", image: "" };

  const matchId = row[0] || "";
  const home    = row[1] || "";
  const away    = row[2] || "";
  const score   = row[3] || "";
  const minute  = row[4] || "";
  const type    = row[5] || "";
  const player  = row[8] || "";
  const assist  = row[9] || "";
  const comp    = row[10] || "";

  const possession = row[11] || "";
  const shots      = row[12] || "";
  const sot        = row[13] || "";
  const fouls      = row[14] || "";
  const saves      = row[15] || "";
  const xg         = row[16] || "";

  const compLogo  = getCompetitionLogo(comp);
  const teamLogo  = getTeamLogo(home);
  const playerImg = player ? getPlayerPhoto(player) : "";

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
🔹 <b>Possession:</b> ${possession}
🔹 <b>Shots:</b> ${shots}
🔹 <b>On Target:</b> ${sot}
🔹 <b>Fouls:</b> ${fouls}
🔹 <b>Saves:</b> ${saves}
🔹 <b>xG:</b> ${xg}

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
🔹 <b>Possession:</b> ${possession}
🔹 <b>Shots:</b> ${shots}
🔹 <b>On Target:</b> ${sot}
🔹 <b>Fouls:</b> ${fouls}
🔹 <b>Saves:</b> ${saves}
🔹 <b>xG:</b> ${xg}

⭐ <b>Man of the Match:</b> ${player}

🏆 <b>${comp}</b>
`,
        image: compLogo || teamLogo
      };

    case "LINEUPS":
      const L = getLineupsFromSofaScore(matchId);
      if (!L) return { text: "", image: "" };

      const firstPhoto =
        (L.homeXI[0] && L.homeXI[0].photo) ||
        (L.awayXI[0] && L.awayXI[0].photo) ||
        teamLogo ||
        compLogo;

      function formatXI(list) {
        return list.map(p =>
          `• <b>${p.name}</b> (${p.pos}) ${p.number ? "#" + p.number : ""}`
        ).join("\n");
      }

      function formatBench(list) {
        return list.map(n => "• " + n).join("\n");
      }

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
      const leagueId = matchId; // MATCH_ID = leagueId nan ka sa
      const standings = getStandings(leagueId);
      if (!standings) return { text: "", image: "" };

      let txt = "🏆 <b>STANDINGS</b>\n\n";
      standings.slice(0, 10).forEach((t, i) => {
        txt += `${i + 1}. <b>${t.team}</b> - ${t.points} pts (GD: ${t.goalDiff})\n`;
      });

      return {
        text: txt,
        image: compLogo
      };

    case "TACTICAL":
      const tacticalImg = getTacticalBoardImage(matchId);
      return {
        text: `
🧠 <b>TACTICAL BOARD</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

📍 Position map (GK, DF, MF, FW sou teren an)

🏆 <b>${comp}</b>
`,
        image: tacticalImg || teamLogo || compLogo
      };

    case "HEATMAP":
      const heatImg = getHeatmapImage(matchId);
      return {
        text: `
🔥 <b>HEATMAP MATCH LA</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Zòn ki pi cho sou teren an (entansite mouvman, atak, presyon).

🏆 <b>${comp}</b>
`,
        image: heatImg || teamLogo || compLogo
      };

    case "PASSMAP":
      const passImg = getPassNetworkImage(matchId);
      return {
        text: `
🔗 <b>PASS NETWORK</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Koneksyon ant jwè yo, pass routes, nœuds kle yo.

🏆 <b>${comp}</b>
`,
        image: passImg || teamLogo || compLogo
      };

    case "XTMAP":
      const xtImg = getXTMapImage(matchId);
      return {
        text: `
📊 <b>EXPECTED THREAT (xT)</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Zòn ki kreye plis danje sou teren an (threat map).

🏆 <b>${comp}</b>
`,
        image: xtImg || teamLogo || compLogo
      };

    case "AVGPOS":
      const avgImg = getAveragePositionImage(matchId);
      return {
        text: `
🧠 <b>AVERAGE POSITION MAP</b>
${flag(home)} <b>${home}</b> vs <b>${away}</b> ${flag(away)}

Pozisyon mwayèn jwè yo sou 90 minit.

🏆 <b>${comp}</b>
`,
        image: avgImg || teamLogo || compLogo
      };

    default:
      return { text: "", image: "" };
  }
}

/****************************************
 * Ranpli stats otomatik nan tab EVENTS
 ****************************************/
function updateStatsInSheet() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

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
 * Pwosesis otomatik pou tab EVENTS
 ****************************************/
function processEventsForTelegram() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("EVENTS");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 17).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 7) continue;

    const status = row[6];
    if (status === "READY") {
      const event = formatEvent(row);
      if (event.text && event.text.trim() !== "") {
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
 * TEST
 ****************************************/
function testTelegram() {
  sendToMultipleChats("🔔 TEST: Mondyal 2036 + CarrefourMag ✔", null, [
    CHAT_ID_CARREFOURMAG,
    CHAT_ID_PRIVATE
  ]);
}
