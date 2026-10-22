import {API_BASE} from './api-config.js';
export async function hasConsent(){return !API_BASE.startsWith('https:') || (await chrome.storage.local.get('callyConsentV1')).callyConsentV1===true;}
