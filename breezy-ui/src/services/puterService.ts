/**
 * Optional Puter.js AI access for Breezy.
 * Puter keeps model/API billing on the user's Puter account, so Breezy
 * does not need to store a provider API key for this mode.
 */

declare global {
  interface Window {
    puter?: any;
  }
}

let loadPromise: Promise<any> | null = null;

async function loadPuter(): Promise<any> {
  if (typeof window === 'undefined') throw new Error('Puter.js is only available in the browser.');
  if (window.puter) return window.puter;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-breezy-puter]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.puter));
      existing.addEventListener('error', () => reject(new Error('Could not load Puter.js.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.dataset.breezyPuter = '1';
    script.onload = () => window.puter ? resolve(window.puter) : reject(new Error('Puter.js loaded without its API.'));
    script.onerror = () => reject(new Error('Could not load Puter.js.'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export const puterService = {
  async ensureLoaded(): Promise<any> {
    return loadPuter();
  },

  async isSignedIn(): Promise<boolean> {
    try {
      const puter = await loadPuter();
      return Boolean(puter?.auth?.isSignedIn?.());
    } catch {
      return false;
    }
  },

  async signIn(): Promise<void> {
    const puter = await loadPuter();
    if (puter.auth?.isSignedIn?.()) return;
    if (!puter.auth?.signIn) throw new Error('Puter authentication is unavailable.');
    await puter.auth.signIn();
  },

  async chat(prompt: string, options?: { model?: string; system?: string }): Promise<string> {
    const puter = await loadPuter();
    if (!puter.auth?.isSignedIn?.()) await this.signIn();

    const messages = options?.system
      ? [
          { role: 'system', content: options.system },
          { role: 'user', content: prompt },
        ]
      : prompt;

    const response = await puter.ai.chat(messages, {
      model: options?.model || 'gpt-5-nano',
    });

    if (typeof response === 'string') return response;
    return response?.message?.content || response?.text || response?.content || String(response ?? '');
  },
};
