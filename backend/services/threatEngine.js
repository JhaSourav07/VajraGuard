/**
 * Threat Correlation Engine
 * Analyzes structured security events and detects attack patterns using rule-based logic
 */

const BRUTE_FORCE_THRESHOLD = 5; // failed logins from same IP
const PORT_SCAN_THRESHOLD = 3;   // port scan events from same IP

/**
 * Group events by IP address
 */
function groupByIp(events) {
  return events.reduce((acc, event) => {
    if (!event.ip) return acc;
    if (!acc[event.ip]) acc[event.ip] = [];
    acc[event.ip].push(event);
    return acc;
  }, {});
}

/**
 * Detect brute force: multiple failed logins from same IP
 */
function detectBruteForce(eventsByIp) {
  const threats = [];
  for (const [ip, events] of Object.entries(eventsByIp)) {
    const failed = events.filter((e) => e.event_type === 'failed_login');
    if (failed.length >= BRUTE_FORCE_THRESHOLD) {
      threats.push({
        type: 'Brute Force Attack',
        riskLevel: failed.length >= 10 ? 'Critical' : 'High',
        sourceIp: ip,
        explanation: `${failed.length} failed login attempts detected from IP ${ip}. This indicates a brute-force attack targeting authentication.`,
        recommendedActions: [
          `Block IP ${ip} at firewall level`,
          'Enable account lockout policy after 3 failed attempts',
          'Enable rate limiting on SSH/login endpoints',
          'Implement fail2ban or equivalent IPS',
          'Enable Multi-Factor Authentication (MFA)',
        ],
        relatedEventCount: failed.length,
      });
    }
  }
  return threats;
}

/**
 * Detect account takeover: failed logins followed by successful login from same IP
 */
function detectAccountTakeover(eventsByIp) {
  const threats = [];
  for (const [ip, events] of Object.entries(eventsByIp)) {
    const failed = events.filter((e) => e.event_type === 'failed_login');
    const success = events.filter((e) => e.event_type === 'successful_login');
    if (failed.length >= 2 && success.length >= 1) {
      threats.push({
        type: 'Account Takeover',
        riskLevel: 'Critical',
        sourceIp: ip,
        explanation: `IP ${ip} had ${failed.length} failed login attempts followed by ${success.length} successful login(s). This strongly indicates a compromised account following a brute-force attack.`,
        recommendedActions: [
          `Immediately block IP ${ip}`,
          'Force password reset for affected accounts',
          'Terminate all active sessions for affected accounts',
          'Enable MFA for all privileged accounts',
          'Audit all actions performed during the suspicious session',
        ],
        relatedEventCount: failed.length + success.length,
      });
    }
  }
  return threats;
}

/**
 * Detect port scanning: port scan events from same IP
 */
function detectPortScan(eventsByIp) {
  const threats = [];
  for (const [ip, events] of Object.entries(eventsByIp)) {
    const scans = events.filter((e) => e.event_type === 'port_scan' || e.event_type === 'firewall_block');
    if (scans.length >= PORT_SCAN_THRESHOLD) {
      const uniquePorts = [...new Set(scans.map((e) => e.port).filter(Boolean))];
      threats.push({
        type: 'Port Scan',
        riskLevel: 'Medium',
        sourceIp: ip,
        explanation: `IP ${ip} performed a port scan, probing ${uniquePorts.length > 0 ? uniquePorts.length : 'multiple'} ports. This is reconnaissance preceding a targeted attack.`,
        recommendedActions: [
          `Block IP ${ip} at perimeter firewall`,
          'Enable port-knocking or firewall stealth mode',
          'Review and close all unnecessary open ports',
          'Enable IDS/IPS signatures for port scan detection',
        ],
        relatedEventCount: scans.length,
      });
    }
  }
  return threats;
}

/**
 * Detect suspicious web activity: flood of 404s or requests to admin paths
 */
function detectWebAttack(eventsByIp) {
  const threats = [];
  const suspiciousPaths = ['/admin', '/wp-admin', '/phpMyAdmin', '/.env', '/config', '/shell', '/cmd'];

  for (const [ip, events] of Object.entries(eventsByIp)) {
    const webEvents = events.filter((e) => e.event_type === 'web_request');
    const notFound = webEvents.filter((e) => e.statusCode === 404);
    const suspiciousRequests = webEvents.filter((e) =>
      suspiciousPaths.some((p) => e.url && e.url.toLowerCase().includes(p.toLowerCase()))
    );

    if (notFound.length >= 10 || suspiciousRequests.length >= 3) {
      threats.push({
        type: 'Web Attack',
        riskLevel: suspiciousRequests.length >= 3 ? 'High' : 'Medium',
        sourceIp: ip,
        explanation: `IP ${ip} made ${notFound.length} requests resulting in 404 errors and ${suspiciousRequests.length} requests to sensitive paths. Possible web enumeration or attack attempt.`,
        recommendedActions: [
          `Block IP ${ip} via WAF rule`,
          'Enable Web Application Firewall (WAF)',
          'Rate-limit requests per IP',
          'Remove or protect admin interfaces',
          'Review server access logs for data exfiltration',
        ],
        relatedEventCount: webEvents.length,
      });
    }
  }
  return threats;
}

/**
 * Main correlation function – runs all detectors
 * @param {Array} events - Array of parsed SecurityEvent-like objects
 * @returns {Array} Array of detected threat objects
 */
function correlateThreats(events) {
  if (!events || events.length === 0) return [];

  const eventsByIp = groupByIp(events);
  const threats = [
    ...detectAccountTakeover(eventsByIp), // check account takeover first (higher severity)
    ...detectBruteForce(eventsByIp),
    ...detectPortScan(eventsByIp),
    ...detectWebAttack(eventsByIp),
  ];

  // Deduplicate: if account takeover AND brute force from same IP, keep account takeover only
  const seen = new Set();
  return threats.filter((t) => {
    const key = `${t.sourceIp}`;
    if (seen.has(key) && t.type === 'Brute Force Attack') return false;
    seen.add(key);
    return true;
  });
}

module.exports = { correlateThreats };
