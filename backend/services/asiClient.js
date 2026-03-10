/**
 * ASI-1 API Client
 * Wraps ASI-1 API calls for threat analysis and AI assistant features
 */

const axios = require('axios');

const ASI1_BASE_URL = process.env.ASI1_BASE_URL || 'https://api.asi1.ai/v1';
const ASI1_API_KEY = process.env.ASI1_API_KEY || '';

/**
 * Make a chat completion request to ASI-1
 * @param {Array} messages - OpenAI-style messages array
 * @param {number} maxTokens - Max tokens for response
 */
async function chatCompletion(messages, maxTokens = 1000) {
  if (!ASI1_API_KEY || ASI1_API_KEY === 'your_asi1_api_key_here') {
    // Return a mock response if no API key is configured
    return getMockResponse(messages);
  }

  const response = await axios.post(
    `${ASI1_BASE_URL}/chat/completions`,
    {
      model: 'asi1-mini',
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${ASI1_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Analyze security events using ASI-1
 * Returns structured threat analysis
 * @param {Array} events - Parsed security events
 * @param {Array} ruleThreats - Rule-based detected threats
 */
async function analyzeThreat(events, ruleThreats = []) {
  const eventSummary = events
    .slice(0, 50) // limit for prompt size
    .map(
      (e) =>
        `[${e.event_type.toUpperCase()}] IP: ${e.ip || 'N/A'} | User: ${e.username || 'N/A'} | Time: ${e.timestamp || 'N/A'}${e.url ? ' | URL: ' + e.url : ''}${e.port ? ' | Port: ' + e.port : ''}`
    )
    .join('\n');

  const ruleDetections =
    ruleThreats.length > 0
      ? ruleThreats
          .map((t) => `• ${t.type} from ${t.sourceIp} (Risk: ${t.riskLevel})`)
          .join('\n')
      : 'None detected by rule engine.';

  const prompt = `You are an expert cybersecurity analyst working in a Security Operations Center (SOC).

Analyze the following security events from an enterprise server and provide a detailed threat assessment.

## Security Events Detected:
${eventSummary}

## Rule-Based Detections (pre-processed):
${ruleDetections}

## Your Analysis Must Include:
1. **Threat Type**: Identify the specific attack type(s)
2. **Risk Level**: Overall risk (Low / Medium / High / Critical)
3. **Attack Chain**: Step-by-step progression of the attack
4. **Threat Actor Profile**: Likely attacker motivation and sophistication
5. **Impact Assessment**: What could the attacker achieve if successful?
6. **Recommended Defensive Actions**: Specific, actionable steps to mitigate

Format your response as a structured security report. Be precise and professional.`;

  const messages = [
    {
      role: 'system',
      content:
        'You are a senior cybersecurity analyst at a Tier-1 SOC. Provide precise, actionable threat analysis. Use markdown formatting in your responses.',
    },
    { role: 'user', content: prompt },
  ];

  try {
    const analysis = await chatCompletion(messages, 1500);
    return { success: true, analysis };
  } catch (err) {
    console.error('ASI-1 API error:', err.message);
    return { success: false, analysis: getFallbackAnalysis(ruleThreats), error: err.message };
  }
}

/**
 * AI Assistant – answer a user's security question based on stored events
 * @param {string} question - User's question
 * @param {Array} events - Recent security events context
 * @param {Array} threats - Detected threats context
 */
async function askAssistant(question, events = [], threats = []) {
  const context = [
    events.length > 0
      ? `Recent Security Events (last ${Math.min(events.length, 30)}):\n` +
        events
          .slice(0, 30)
          .map((e) => `• [${e.event_type}] ${e.ip || ''} ${e.username ? '→ ' + e.username : ''} at ${e.timestamp || e.createdAt}`)
          .join('\n')
      : 'No recent security events.',
    threats.length > 0
      ? `\nDetected Threats:\n` +
        threats
          .map((t) => `• ${t.type} from ${t.sourceIp} | Risk: ${t.riskLevel} | Status: ${t.status}`)
          .join('\n')
      : '\nNo threats detected currently.',
  ].join('\n');

  const messages = [
    {
      role: 'system',
      content:
        'You are VajraGuard AI, an intelligent cybersecurity assistant integrated into a SOC platform. You analyze security events and threats, and answer questions from security analysts. Be concise, accurate, and professional. Use markdown formatting.',
    },
    {
      role: 'user',
      content: `Here is the current security context:\n\n${context}\n\n---\n\nAnalyst Question: ${question}`,
    },
  ];

  try {
    const response = await chatCompletion(messages, 1200);
    return { success: true, response };
  } catch (err) {
    console.error('ASI-1 assistant error:', err.message);
    return {
      success: false,
      response: `I'm unable to connect to the AI backend right now. Based on the available data:\n\n${context}`,
      error: err.message,
    };
  }
}

/**
 * Mock response when no API key is set (for demo/development)
 */
function getMockResponse(messages) {
  const lastMessage = messages[messages.length - 1].content;
  if (lastMessage.includes('security events') || lastMessage.includes('threat')) {
    return `## 🔴 Threat Analysis Report

**Threat Type:** Brute Force Attack → Account Takeover

**Risk Level:** 🔴 Critical

### Attack Chain:
1. **Reconnaissance** – Attacker identified open SSH port 22
2. **Credential Stuffing** – Multiple failed password attempts targeting root account
3. **Compromise** – Successful authentication after password guessing
4. **Post-Exploitation** – Potential data access and lateral movement

### Threat Actor Profile:
Automated attack tool (likely **Hydra** or **Medusa**), possibly operated by a financially motivated threat actor or script kiddie. Attack originates from known malicious IP range.

### Impact Assessment:
- **Immediate**: Root-level system access compromised
- **Short-term**: Data exfiltration, ransomware deployment risk
- **Long-term**: Persistent backdoor installation, botnet enrollment

### Recommended Defensive Actions:
1. **Immediately block** the source IP at the firewall/network perimeter
2. **Disable root SSH login** – use \`PermitRootLogin no\` in \`/etc/ssh/sshd_config\`
3. **Enable SSH key-based authentication** and disable password auth
4. **Deploy fail2ban** with threshold of 3 failures
5. **Force logout** all active sessions and reset compromised credentials
6. **Enable MFA** for all administrative accounts
7. **Audit system logs** for any post-compromise activity
8. **Review cron jobs, startup scripts** for persistence mechanisms

*Analysis powered by VajraGuard AI | ASI-1 Integration (Demo Mode)*`;
  }

  return `Based on the current security context, I can see activity that warrants attention. The system has detected suspicious login patterns and potential reconnaissance activity. I recommend reviewing the threat dashboard for detailed analysis and implementing the suggested defensive actions.\n\n*Note: Configure your ASI-1 API key for full AI-powered analysis.*`;
}

/**
 * Fallback analysis using rule-based results when AI is unavailable
 */
function getFallbackAnalysis(threats) {
  if (!threats || threats.length === 0) {
    return '## Security Analysis\n\nNo significant threats detected in the analyzed log data. Continue monitoring.';
  }
  return (
    `## Automated Threat Analysis\n\n` +
    threats
      .map(
        (t) =>
          `### ${t.type}\n**Risk Level:** ${t.riskLevel}\n**Source:** ${t.sourceIp}\n\n${t.explanation}\n\n**Actions:**\n${t.recommendedActions.map((a) => `- ${a}`).join('\n')}`
      )
      .join('\n\n---\n\n')
  );
}

module.exports = { analyzeThreat, askAssistant };
