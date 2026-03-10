export const Colors = '\
--outline-color: #ccc; \
--text-color-dark: #606570; \
--text-color-light: #fafafa; \
--bg-color-light: #f0f0f0;\
--bg-color-light2: #f6f6f6 ;\
--bg-color-medium: #e0e0e0;\
--bg-color-dark: #606570;\
--main-color1: #6eb8ff;\
--main-color1-light: #6eb8ff20;\
--main-color2: #4777a4;\
--warning-color: crimson;\
--warning-text-color: #fefafa;\
--warning-color-light: #ffd5ce;\
--warning-link-color:#fae550;\
--warning-link-hover-color:#ffee80;\
--container-bg-color: #fff;\
--container-bg-color-hover: #fafdff;\
';

export function getDefaults(options) {
   const out = {};
   for(const opt of Object.keys(options)) {
      out[opt] = options[opt].default;
   }
   return out;
}
