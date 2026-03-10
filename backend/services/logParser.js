/**
 * Log Parser Service
 * Converts raw log lines into structured SecurityEvent objects
 */

// SSH Failed Password: Mar 10 10:22:31 sshd[1234]: Failed password for root from 185.234.218.12 port 22 ssh2
const SSH_FAILED = /(\w+\s+\d+\s[\d:]+).*Failed password for (\S+) from ([\d.]+)/i;

// SSH Accepted Password: Mar 10 10:25:01 sshd[1234]: Accepted password for root from 185.234.218.12 port 22 ssh2
const SSH_SUCCESS = /(\w+\s+\d+\s[\d:]+).*Accepted (?:password|publickey) for (\S+) from ([\d.]+)/i;

// SSH Invalid user: Mar 10 10:22:31 sshd[1234]: Invalid user admin from 185.234.218.12
const SSH_INVALID = /(\w+\s+\d+\s[\d:]+).*Invalid user (\S+) from ([\d.]+)/i;

// Web server log (Apache/Nginx): 192.168.1.1 - - [10/Mar/2026:10:22:31 +0000] "GET /admin HTTP/1.1" 404 512
const WEB_REQUEST = /([\d.]+).*\[([^\]]+)\]\s+"(\w+)\s+(\S+)\s+HTTP[^"]+"\s+(\d+)/;

// Firewall block: Mar 10 10:22:31 kernel: [UFW BLOCK] IN=eth0 SRC=185.234.218.12 DST=10.0.0.1 PROTO=TCP DPT=22
const FIREWALL_BLOCK = /(\w+\s+\d+\s[\d:]+).*(?:BLOCK|DENY|DROP).*SRC=([\d.]+).*DPT=(\d+)/i;

// Port scan: Mar 10 10:22:31 kernel: nmap scan from 185.234.218.12
const PORT_SCAN = /(\w+\s+\d+\s[\d:]+).*(?:port.?scan|nmap|masscan).*from\s+([\d.]+)/i;

function parseLine(line) {
  line = line.trim();
  if (!line) return null;

  let match;

  // SSH Failed Login
  match = line.match(SSH_FAILED);
  if (match) {
    console.log(`[Parser] ❌ SSH Failed Login -> User: ${match[2]} | IP: ${match[3]}`);
    return {
      event_type: 'failed_login',
      timestamp: match[1],
      username: match[2],
      ip: match[3],
      rawLine: line,
    };
  }

  // SSH Invalid User (also counts as failed)
  match = line.match(SSH_INVALID);
  if (match) {
    console.log(`[Parser] ❌ SSH Invalid User -> User: ${match[2]} | IP: ${match[3]}`);
    return {
      event_type: 'failed_login',
      timestamp: match[1],
      username: match[2],
      ip: match[3],
      rawLine: line,
    };
  }

  // SSH Successful Login
  match = line.match(SSH_SUCCESS);
  if (match) {
    console.log(`[Parser] ✅ SSH Success -> User: ${match[2]} | IP: ${match[3]}`);
    return {
      event_type: 'successful_login',
      timestamp: match[1],
      username: match[2],
      ip: match[3],
      rawLine: line,
    };
  }

  // Web Server Request
  match = line.match(WEB_REQUEST);
  if (match) {
    console.log(`[Parser] 🌐 Web Request -> ${match[3]} ${match[4]} | IP: ${match[1]} | Status: ${match[5]}`);
    return {
      event_type: 'web_request',
      timestamp: match[2],
      ip: match[1],
      method: match[3],
      url: match[4],
      statusCode: parseInt(match[5], 10),
      rawLine: line,
    };
  }

  // Firewall Block
  match = line.match(FIREWALL_BLOCK);
  if (match) {
    console.log(`[Parser] 🛡️ Firewall Block -> IP: ${match[2]} | Port: ${match[3]}`);
    return {
      event_type: 'firewall_block',
      timestamp: match[1],
      ip: match[2],
      port: parseInt(match[3], 10),
      rawLine: line,
    };
  }

  // Port Scan
  match = line.match(PORT_SCAN);
  if (match) {
    console.log(`[Parser] 🔎 Port Scan -> IP: ${match[2]}`);
    return {
      event_type: 'port_scan',
      timestamp: match[1],
      ip: match[2],
      rawLine: line,
    };
  }

  // Fallback – unknown event, still capture any IP
  const ipMatch = line.match(/([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/);
  return {
    event_type: 'unknown',
    timestamp: new Date().toISOString(),
    ip: ipMatch ? ipMatch[1] : null,
    rawLine: line,
  };
}

/**
 * Parse full log content into array of structured events
 * @param {string} content - Raw log file content
 * @returns {Array} Array of parsed event objects
 */
function parseLog(content) {
  console.log(`\n[Parser] 🚀 Starting log file parsing...`);
  const lines = content.split('\n');
  const events = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const event = parseLine(line);
    if (event) events.push(event);
  }

  console.log(`[Parser] ✨ Finished! Extracted ${events.length} valid events from ${lines.length} lines.`);
  return events;
}

module.exports = { parseLog, parseLine };
