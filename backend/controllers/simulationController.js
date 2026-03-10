const SecurityEvent = require('../models/SecurityEvent');
const Threat = require('../models/Threat');
const { correlateThreats } = require('../services/threatEngine');
const { analyzeThreat } = require('../services/asiClient');

// Pool of realistic attacker IPs for simulation
const ATTACKER_IPS = [
  '185.234.218.12',
  '91.108.4.117',
  '103.195.236.44',
  '62.102.148.68',
  '45.142.212.100',
  '194.165.16.10',
  '178.128.23.45',
];

const USERNAMES = ['root', 'admin', 'ubuntu', 'user', 'test', 'deploy', 'oracle'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function padZero(n) {
  return String(n).padStart(2, '0');
}

/**
 * Generate realistic fake SSH brute-force log lines
 */
function generateBruteForce(attackerIp, target, startHour = 10) {
  const lines = [];
  const failCount = 8 + Math.floor(Math.random() * 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[new Date().getMonth()];
  const day = new Date().getDate();

  for (let i = 0; i < failCount; i++) {
    const min = padZero(Math.floor(Math.random() * 60));
    const sec = padZero(Math.floor(Math.random() * 60));
    lines.push(
      `${month} ${day} ${padZero(startHour)}:${min}:${sec} server sshd[${1000 + i}]: Failed password for ${target} from ${attackerIp} port ${22000 + i} ssh2`
    );
  }

  // Successful login at the end
  lines.push(
    `${month} ${day} ${padZero(startHour)}:59:02 server sshd[${2000}]: Accepted password for ${target} from ${attackerIp} port 58422 ssh2`
  );

  return lines;
}

/**
 * Generate port scan log lines
 */
function generatePortScan(attackerIp) {
  const { parseLog } = require('../services/logParser');
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date().getMonth()];
  const day = new Date().getDate();
  const ports = [22, 80, 443, 3306, 5432, 6379, 8080, 8443, 27017];
  return ports.map(
    (port, i) =>
      `${month} ${day} 10:${padZero(i + 1)}:00 server kernel: [UFW BLOCK] IN=eth0 OUT= MAC=... SRC=${attackerIp} DST=10.0.0.1 LEN=44 TOS=0x00 PREC=0x00 TTL=51 ID=0 DF PROTO=TCP SPT=54321 DPT=${port} WINDOW=1024 RES=0x00 SYN URGP=0`
  );
}

/**
 * Generate suspicious web requests
 */
function generateWebAttack(attackerIp) {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date().getMonth()];
  const day = new Date().getDate();
  const paths = ['/admin', '/wp-admin', '/phpMyAdmin', '/.env', '/config.php', '/shell.php', '/cmd.php'];
  return paths.map(
    (p, i) =>
      `${attackerIp} - - [${day}/${month}/2026:10:${padZero(i + 1)}:00 +0000] "GET ${p} HTTP/1.1" 404 512 "-" "Mozilla/5.0"`
  );
}

/**
 * POST /api/simulate
 * Generates fake attack log, runs through full pipeline
 */
exports.runSimulation = async (req, res) => {
  try {
    const numAttackers = 2 + Math.floor(Math.random() * 2); // 2-3 attackers
    const selectedIps = ATTACKER_IPS.sort(() => Math.random() - 0.5).slice(0, numAttackers);
    const { parseLog } = require('../services/logParser');

    let allLines = [];
    for (const ip of selectedIps) {
      const target = randomFrom(USERNAMES);
      allLines = [...allLines, ...generateBruteForce(ip, target), ...generatePortScan(ip)];
    }

    // Add web attack from one IP
    allLines = [...allLines, ...generateWebAttack(selectedIps[0])];

    // Shuffle lines
    allLines.sort(() => Math.random() - 0.5);

    const simulatedLog = allLines.join('\n');

    // Parse and correlate
    const parsedEvents = parseLog(simulatedLog);
    const ruleThreats = correlateThreats(parsedEvents);

    // Save to DB
    try {
      await SecurityEvent.insertMany(parsedEvents);
      await Threat.insertMany(
        ruleThreats.map((t) => ({
          type: t.type,
          riskLevel: t.riskLevel,
          sourceIp: t.sourceIp,
          explanation: t.explanation,
          recommendedActions: t.recommendedActions,
        }))
      );
    } catch (_) {}

    // AI analysis
    const aiResult = await analyzeThreat(parsedEvents, ruleThreats);

    res.json({
      success: true,
      message: '🚨 Attack simulation complete',
      simulatedLog: simulatedLog.slice(0, 3000),
      eventCount: parsedEvents.length,
      threatsDetected: ruleThreats.length,
      threats: ruleThreats,
      aiAnalysis: aiResult.analysis,
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
