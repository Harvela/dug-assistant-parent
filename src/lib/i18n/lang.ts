const KEY = 'dug_parent_lang_v1';

export type AppLang = 'en' | 'fr';

export function readLangFromStorage(): AppLang | null {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'en' || v === 'fr') return v;
    return null;
  } catch {
    return null;
  }
}

export function writeLangToStorage(lang: AppLang): void {
  localStorage.setItem(KEY, lang);
}

