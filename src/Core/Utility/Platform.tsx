/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

function getOS(): string | null {
  let userAgent = window.navigator.userAgent;
  let os: string | null = null;
  if (['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].find(v => userAgent.indexOf(v) >= 0)) { os = 'Mac OS'; }
  else if (['iPhone', 'iPad', 'iPod'].find(v => userAgent.indexOf(v) >= 0)) { os = 'iOS'; }
  else if (['Win32', 'Win64', 'Windows', 'WinCE'].find(v => userAgent.indexOf(v) >= 0)) { os = 'Windows'; }
  else if (/Android/.test(userAgent)) { os = 'Android'; }
  else if (!os && /Linux/.test(userAgent)) { os = 'Linux'; }
  return os;
}
export const OS = (): string | null => { return getOS(); };

function getBrowser(): string | null {
  let userAgent = window.navigator.userAgent;
  let browser: string | null = null;
  if (userAgent.indexOf('Chrome') !== -1) { browser = 'Google Chrome'; }
  else if (userAgent.indexOf('Firefox') !== -1) { browser = 'Mozilla Firefox'; }
  else if (userAgent.indexOf('MSIE') !== -1) { browser = 'Internet Exployer'; }
  else if (userAgent.indexOf('Edge') !== -1) { browser = 'Edge'; }
  else if (userAgent.indexOf('Safari') !== -1) { browser = 'Safari'; }
  else if (userAgent.indexOf('Opera') !== -1) { browser = 'Opera'; }
  else if (userAgent.indexOf('Opera') !== -1) { browser = 'YaBrowser'; }
  return browser;
}
export const Browser = (): string | null => { return getBrowser(); };

export const isBrowser = (): boolean => {
  return (window.navigator !== undefined);
};