export const STORAGE_KEY='home-bar-stock-v1';
export const SETTINGS_KEY='home-bar-settings-v1';
export function validateStock(value,catalog){
  if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Stock must be an object.');
  const result={};
  for(const [id,state] of Object.entries(value)){
    if(!Object.hasOwn(catalog,id)) throw new Error(`Unrecognized ingredient type: ${id}`);
    if(typeof state!=='boolean') throw new Error(`Invalid stock value for ${id}.`);
    result[id]=state;
  }
  return result;
}
export function parseBackup(text,catalog){
  const data=JSON.parse(text);
  if(data.version!==1 || data.app!=='home-bar') throw new Error('Choose a Home Bar stock export (version 1).');
  return validateStock(data.stock,catalog);
}
