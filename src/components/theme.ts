export type Theme = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'sakura-theme'

/**
 * Inline script for <head>. Applies the saved theme before first paint so there is no flash.
 * "system" (or nothing saved) leaves data-theme unset, so CSS follows prefers-color-scheme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
