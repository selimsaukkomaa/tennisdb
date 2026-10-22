import pkg from '../package.json';

/** App release as shown in the UI: 0.991.0 -> "0.991". The data keeps its own version. */
export const APP_VERSION = pkg.version.split('.').slice(0, 2).join('.');
