/**
 * GeoIP Service
 * Resolves IP addresses to geographic coordinates using ip-api.com (free, no key required)
 */

const axios = require('axios');

// Simple in-memory cache to avoid redundant lookups
const cache = new Map();

// Known private/local IP ranges (skip GeoIP for these)
function isPrivateIp(ip) {
  if (!ip) return true;
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.3') ||
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip === '::1'
  );
}

/**
 * Look up a single IP address
 * @param {string} ip
 * @returns {Object} { lat, lng, city, country, isp } or null
 */
async function lookupIp(ip) {
  if (!ip || isPrivateIp(ip)) return null;
  if (cache.has(ip)) return cache.get(ip);

  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,lat,lon,city,country,isp,regionName`, {
      timeout: 5000,
    });

    if (response.data.status === 'success') {
      const geo = {
        ip,
        lat: response.data.lat,
        lng: response.data.lon,
        city: response.data.city,
        country: response.data.country,
        region: response.data.regionName,
        isp: response.data.isp,
      };
      cache.set(ip, geo);
      return geo;
    }
  } catch (err) {
    // Silently fail – geo lookup is best-effort
  }

  return null;
}

/**
 * Look up multiple IPs (batch, with small delay to respect rate limits)
 * @param {Array<string>} ips
 * @returns {Array} Array of geo objects
 */
async function lookupIps(ips) {
  const unique = [...new Set(ips.filter((ip) => ip && !isPrivateIp(ip)))];
  const results = [];

  for (const ip of unique) {
    const geo = await lookupIp(ip);
    if (geo) results.push(geo);
    // Small delay to respect ip-api.com rate limit (45 req/min)
    if (!cache.has(ip)) await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

module.exports = { lookupIp, lookupIps };
