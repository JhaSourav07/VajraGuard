const SecurityEvent = require('../models/SecurityEvent');
const Threat = require('../models/Threat');
const { correlateThreats } = require('../services/threatEngine');
const { analyzeThreat } = require('../services/asiClient');
const { parseLog } = require('../services/logParser');

const ATTACKER_IPS = [
  '185.234.218.12', '91.108.4.117', '103.195.236.44',
  '62.102.148.68',  '45.142.212.100', '194.165.16.10', '178.128.23.45',
];
const USERNAMES = ['root', 'admin', 'ubuntu', 'user', 'test', 'deploy', 'oracle'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad(n) { return String(n).padStart(2, '0'); }

function identityFields(req) {
  const GUEST_TTL = 24 * 60 * 60 * 1000;
  if (req.isGuest) {
    return { guestId: req.guestId, isGuest: true, guestExpiresAt: new Date(Date.now() + GUEST_TTL) };
  }
  return { userId: req.userId, isGuest: false };
}

function generateBruteForce(ip, target, startHour = 10) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[new Date().getMonth()], d = new Date().getDate();
  const lines = [];
  const count = 8 + Math.floor(Math.random() * 10);
  for (let i = 0; i < count; i++) {
    lines.push(`${m} ${d} ${pad(startHour)}:${pad(Math.floor(Math.random()*60))}:${pad(Math.floor(Math.random()*60))} server sshd[${1000+i}]: Failed password for ${target} from ${ip} port ${22000+i} ssh2`);
  }
  lines.push(`${m} ${d} ${pad(startHour)}:59:02 server sshd[2000]: Accepted password for ${target} from ${ip} port 58422 ssh2`);
  return lines;
}

function generatePortScan(ip) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[new Date().getMonth()], d = new Date().getDate();
  return [22,80,443,3306,5432,6379,8080,8443,27017].map((port,i) =>
    `${m} ${d} 10:${pad(i+1)}:00 server kernel: [UFW BLOCK] IN=eth0 SRC=${ip} DST=10.0.0.1 PROTO=TCP DPT=${port}`
  );
}

function generateWebAttack(ip) {
  const paths = ['/admin','/wp-admin','/phpMyAdmin','/.env','/config.php','/shell.php'];
  return paths.map((p,i) =>
    `${ip} - - [10/Mar/2026:10:${pad(i+1)}:00 +0000] "GET ${p} HTTP/1.1" 404 512`
  );
}

/**
 * POST /api/simulate
 */
exports.runSimulation = async (req, res) => {
  try {
    const extra = identityFields(req);
    const numAttackers = 2 + Math.floor(Math.random() * 2);
    const selectedIps = [...ATTACKER_IPS].sort(() => Math.random() - 0.5).slice(0, numAttackers);

    let allLines = [];
    for (const ip of selectedIps) {
      const target = randomFrom(USERNAMES);
      allLines = [...allLines, ...generateBruteForce(ip, target), ...generatePortScan(ip)];
    }
    allLines = [...allLines, ...generateWebAttack(selectedIps[0])];
    allLines.sort(() => Math.random() - 0.5);

    const simulatedLog = allLines.join('\n');
    const parsedEvents = parseLog(simulatedLog);
    const ruleThreats = correlateThreats(parsedEvents);

    // Save to DB with identity scoping
    try {
      await SecurityEvent.insertMany(parsedEvents.map(e => ({ ...e, ...extra })));
      await Threat.insertMany(ruleThreats.map(t => ({
        type: t.type, riskLevel: t.riskLevel, sourceIp: t.sourceIp,
        explanation: t.explanation, recommendedActions: t.recommendedActions,
        ...extra,
      })));
    } catch (_) {}

    const aiResult = await analyzeThreat(parsedEvents, ruleThreats);

    res.json({
      success: true,
      message: '🚨 Attack simulation complete',
      simulatedLog: simulatedLog.slice(0, 3000),
      eventCount: parsedEvents.length,
      threatsDetected: ruleThreats.length,
      events: parsedEvents.slice(0, 50),
      threats: ruleThreats,
      aiAnalysis: aiResult.analysis,
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
