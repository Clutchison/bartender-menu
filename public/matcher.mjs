export function normalize(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’ʻ]/g, "'");
}

// Each requirement is an OR group. Find the smallest set of additional types
// that covers every unsatisfied group, counting a type once across a recipe.
export function minimumMissing(groups, stocked) {
  const unmet = groups.filter(group => !group.some(id => stocked.has(id)));
  let best = null;
  function visit(index, selected) {
    if (best && selected.size >= best.size) return;
    while (index < unmet.length && unmet[index].some(id => selected.has(id))) index++;
    if (index === unmet.length) { best = new Set(selected); return; }
    for (const id of unmet[index]) visit(index + 1, new Set([...selected, id]));
  }
  visit(0, new Set());
  return [...(best || [])].sort();
}

export function matchRecipe(recipe, inventory, catalog) {
  const stocked = inventory instanceof Set ? inventory : new Set(Object.keys(inventory).filter(id => inventory[id] === true));
  const required = recipe.requirements.filter(r => !r.optional);
  const unknown = required.filter(r => !r.options.length || r.options.some(id => !catalog[id]));
  const groups = kind => required.filter(r => r.options.length && r.options.every(id => catalog[id]?.kind === kind)).map(r => r.options);
  const mixed = required.filter(r => r.options.length && new Set(r.options.map(id => catalog[id]?.kind)).size > 1);
  const missingAlcohol = minimumMissing(groups('alcohol'), stocked);
  const missingOther = minimumMissing(groups('other'), stocked);
  return { recipe, missingAlcohol, missingOther, unresolved: [...unknown, ...mixed], stocked };
}

export function filterRecipes(recipes, inventory, catalog, options = {}) {
  const raw = Number(options.maxMissing ?? 0);
  const maxMissing = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
  const query = normalize(options.search || '').trim();
  return recipes.map(recipe => matchRecipe(recipe, inventory, catalog))
    .filter(result => !result.unresolved.length
      && result.missingAlcohol.length <= maxMissing
      && (!options.requireOther || !result.missingOther.length)
      && (!options.category || result.recipe.category === options.category)
      && (!query || normalize([result.recipe.name, result.recipe.category,
        ...result.recipe.requirements.flatMap(r => [r.text, ...r.options.map(id => catalog[id]?.label || '')])].join(' ')).includes(query)))
    .sort((a, b) => a.missingAlcohol.length - b.missingAlcohol.length || a.recipe.name.localeCompare(b.recipe.name));
}
