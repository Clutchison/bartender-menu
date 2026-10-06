import { normalize } from '../public/matcher.mjs';

// Ordered, inspectable aliases. Specific styles always precede broad names.
const alcohol = [
  ['bitters-orange', 'Orange bitters', /orange bitters/],
  ['bitters-walnut', 'Black walnut bitters', /black walnut bitters/],
  ['bitters-cardamom', 'Cardamom / Boker’s bitters', /cardamom|boker/],
  ['bitters-peychaud', 'Peychaud’s-style bitters', /peychaud/],
  ['bitters-aromatic', 'Aromatic bitters', /angostura.*bitters/],
  ['rum-overproof-aged-jamaican', 'Aged Jamaican overproof rum', /smith.*cross/],
  ['rum-overproof-white-jamaican', 'Unaged Jamaican overproof rum', /wray.*nephew/],
  ['rum-151', '151-proof rum', /151.*rum|bacardi 151/],
  ['rum-spiced', 'Spiced rum', /spic[e].*rum|spiced rum|jonah/],
  ['rum-white', 'Light / white rum', /white rum|real mccoy 3/],
  ['rum-dark-jamaican', 'Dark Jamaican rum', /coruba|hamilton.*(?:black|pot still)/],
  ['rum-black', 'Black rum (unspiced)', /gosling|black seal/],
  ['rum-aged-jamaican', 'Aged Jamaican rum', /appleton/],
  ['rum-demerara', 'Aged Demerara rum', /el dorado|hamilton.*86/],
  ['rum-agricole', 'Unaged rhum agricole', /rhum agricole/],
  ['rum-aged', 'Aged / gold rum', /angostura 1919|don q gold|flor de cana 7|real mccoy 12|koloa.*reserve/],
  ['coconut-liqueur', 'Coconut rum liqueur', /malibu/],
  ['tequila-reposado', 'Reposado tequila', /reposado/],
  ['tequila-anejo', 'Añejo tequila', /anejo/],
  ['tequila-blanco', 'Blanco tequila', /blanco tequila|tequila blanco|dragones/],
  ['mezcal', 'Mezcal', /mezcal/],
  ['gin-sloe', 'Sloe gin', /sloe gin/],
  ['gin-old-tom', 'Old Tom gin', /old tom/],
  ['gin-navy', 'Navy-strength gin', /navy strength gin/],
  ['genever', 'Genever', /genever/],
  ['gin-dry', 'Dry gin', /\bgin\b|martin miller/],
  ['bourbon', 'Bourbon', /bourbon|wild turkey 101$/],
  ['rye', 'Rye whiskey', /\brye\b/],
  ['irish-whiskey', 'Irish whiskey', /irish whiskey|jameson/],
  ['scotch-islay', 'Peated Islay Scotch', /laphroaig/],
  ['scotch-island', 'Peated Island Scotch', /talisker/],
  ['scotch-malt', 'Unpeated single malt Scotch', /aberfeldy|edradour/],
  ['scotch-blended', 'Blended malt Scotch', /monkey shoulder/],
  ['vodka', 'Vodka', /vodka|ketel one/],
  ['calvados', 'Calvados', /calvados/],
  ['apple-brandy', 'Apple brandy / applejack', /apple brandy|applejack/],
  ['cognac', 'Cognac', /cognac|meukow/],
  ['brandy', 'Brandy', /brandy|e&j/],
  ['cachaca-aged', 'Aged cachaça', /barrel-aged cachaca/],
  ['cachaca-silver', 'Silver cachaça', /silver cachaca/],
  ['pisco', 'Pisco', /pisco/],
  ['absinthe', 'Absinthe', /absinthe/],
  ['vermouth-sweet', 'Sweet red vermouth', /vermouth.*(?:torino|tornino|rouge)|rouge vermouth/],
  ['vermouth-dry', 'Dry vermouth', /dry vermouth|vermouth.*dry/],
  ['vermouth-blanc', 'Blanc vermouth', /blanc vermouth/],
  ['lillet-blanc', 'Lillet Blanc', /lillet blanc/],
  ['lillet-rouge', 'Lillet Rouge', /lillet rouge/],
  ['cocchi-americano', 'Cocchi Americano Bianco', /cocchi americano/],
  ['sherry-amontillado', 'Amontillado sherry', /amontillado/],
  ['sherry-oloroso', 'Oloroso sherry', /oloroso/],
  ['sherry-fino', 'Fino sherry', /fino sherry/],
  ['port-ruby', 'Ruby port', /ruby port/],
  ['port-tawny', 'Tawny port', /tawny port/],
  ['wine-red', 'Red wine', /red wine/],
  ['wine-sparkling', 'Sparkling wine', /sparkling wine/],
  ['hard-cider', 'Dry hard cider', /hard cider/],
  ['orange-brandy', 'Brandy-based orange liqueur', /grand marnier/],
  ['orange-blue', 'Blue curaçao', /blue curacao/],
  ['orange-liqueur', 'Triple sec / orange curaçao', /cointreau|triple sec|orange curacao|dry curacao/],
  ['cacao-white', 'White crème de cacao', /white.*cacao|cacao white|drillaud.*cocoa/],
  ['cacao-dark', 'Dark crème de cacao', /creme de cacao/],
  ['cream-irish', 'Irish cream liqueur', /irish cream|dempsey/],
  ['coffee-liqueur', 'Coffee liqueur', /coffee liqueur|mr black/],
  ['peach-liqueur', 'Peach liqueur', /peach.*liqueur|creme de peche/],
  ['pear-liqueur', 'Pear liqueur', /pear liqueur/],
  ['apricot-liqueur', 'Apricot liqueur', /abricot|apricot liqueur/],
  ['banana-liqueur', 'Banana liqueur', /banane|banana liqueur/],
  ['mango-liqueur', 'Mango liqueur', /mango liqueur/],
  ['maraschino', 'Maraschino liqueur', /maraschino/],
  ['cassis', 'Crème de cassis', /cassis/],
  ['mure', 'Crème de mûre', /creme de mure/],
  ['violette', 'Crème de violette', /violette/],
  ['menthe', 'Crème de menthe', /creme de menthe/],
  ['noyaux', 'Crème de noyaux', /noyaux/],
  ['elderflower', 'Elderflower liqueur', /elderflower/],
  ['chartreuse-yellow', 'Yellow Chartreuse', /yellow chartreuse/],
  ['chartreuse-green', 'Green Chartreuse', /green chartreuse/],
  ['benedictine', 'Bénédictine', /ben[e]?dictine|benendictine/],
  ['campari', 'Campari', /campari/],
  ['suze', 'Gentian aperitif / Suze', /suze/],
  ['nonino', 'Amaro Nonino', /nonino/],
  ['aperol', 'Aperol', /aperol/],
  ['cynar', 'Cynar', /cynar/],
  ['averna', 'Averna', /averna/],
  ['ramazzotti', 'Ramazzotti', /ramazzotti/],
  ['fernet', 'Fernet-Branca', /fernet/],
  ['drambuie', 'Drambuie', /drambuie/],
  ['amaretto', 'Amaretto', /amaretto/],
  ['walnut-liqueur', 'Walnut liqueur', /walnut liqueur/],
  ['swedish-punsch', 'Swedish punsch', /swedish punsch/],
  ['falernum-alcohol', 'Alcoholic velvet falernum', /velvet falernum/],
  ['allspice-dram', 'Allspice dram', /allspice dram/],
  ['galliano', 'Galliano L’Autentico', /galliano/],
  ['licor-43', 'Licor 43', /licor 43/],
  ['ancho-red', 'Red chile liqueur / Ancho Reyes', /ancho reyes/],
  ['sambuca-black', 'Black sambuca', /black sambuca/],
  ['dubonnet', 'Dubonnet Rouge', /dubonnet/],
];

const other = [
  ['simple', 'Simple syrup (1:1)', /simple syrup/],
  ['simple-semirich', 'Semi-rich simple syrup (1.5:1)', /semi-rich/],
  ['demerara-syrup', 'Rich Demerara syrup (2:1)', /demerara syrup/],
  ['orgeat', 'Orgeat', /orgeat|almond syrup/],
  ['grenadine', 'Grenadine', /grenadine/],
  ['groseille', 'Groseille syrup', /groseille/],
  ['maple', 'Maple syrup', /maple syrup/],
  ['agave', 'Agave nectar', /agave nectar/],
  ['honey-syrup', 'Honey syrup (3:1)', /honey syrup/],
  ['sage-honey', 'Sage-infused honey syrup', /sage infused honey/],
  ['passion-syrup', 'Passion fruit syrup', /passion fruit syrup/],
  ['passion-juice', 'Passion fruit juice', /passion fruit juice/],
  ['ginger-syrup', 'Ginger syrup', /ginger syrup/],
  ['cinnamon-syrup', 'Cinnamon syrup', /cinnamon syrup/],
  ['guava-syrup', 'Guava syrup', /guava syrup/],
  ['hibiscus-syrup', 'Hibiscus syrup', /hibiscus syrup/],
  ['lemon-juice', 'Lemon juice', /lemon juice/],
  ['lime-juice', 'Lime juice', /lime juice/],
  ['orange-juice', 'Orange juice', /orange juice/],
  ['grapefruit-juice', 'Grapefruit juice', /grapefruit juice/],
  ['pineapple-juice', 'Pineapple juice', /pineapple juice/],
  ['soda', 'Soda / sparkling water', /soda water|sparkling (?:mineral )?water/],
  ['lemon-lime-soda', 'Lemon-lime soda', /7up|sprite/],
  ['ginger-beer', 'Ginger beer', /ginger beer/],
  ['ginger-ale', 'Spicy ginger ale', /ginger ale/],
  ['cream-coconut', 'Cream of coconut', /cream of coconut/],
  ['milk-coconut', 'Full-fat coconut milk', /coconut milk/],
  ['cream', 'Heavy cream', /heavy cream/],
  ['half-half', 'Half-and-half', /half.*half|1\/2 & 1\/2/],
  ['creamer', 'Non-dairy creamer', /nondairy creamer|non-dairy creamer|non-dairy substitute/],
  ['milk', 'Milk', /whole milk|standard milk|hot milk|^milk$/],
  ['milk-oat', 'Oat milk', /oat milk/],
  ['milk-evaporated', 'Evaporated milk', /evaporated milk/],
  ['milk-condensed', 'Sweetened condensed milk', /condensed milk/],
  ['icecream', 'Vanilla ice cream', /vanilla ice cream/],
  ['icecream-nondairy', 'Non-dairy ice cream', /nondairy ice cream/],
  ['egg', 'Eggs', /egg|yolk/],
  ['aquafaba', 'Aquafaba', /aquafaba/],
  ['espresso', 'Espresso', /espresso/],
  ['coldbrew', 'Cold brew concentrate', /cold brew/],
  ['coffee', 'Hot coffee', /hot coffee/],
  ['tea-black', 'Black tea', /black tea|darjeeling/],
  ['tea-chamomile', 'Chamomile tea', /chamomile/],
  ['tea-spice', 'Spice tea', /spice tea/],
  ['sugar', 'White / cane sugar', /sugar/],
  ['sugar-brown', 'Brown sugar', /brown sugar/],
  ['sugar-demerara', 'Demerara sugar', /demerara sugar/],
  ['sugar-powdered', 'Powdered sugar', /powdered sugar/],
  ['butter', 'Butter', /butter/],
  ['butter-nondairy', 'Non-dairy butter substitute', /non-dairy substitute/],
  ['vanilla', 'Vanilla extract (check alcohol content)', /vanilla extract/],
  ['lemon', 'Lemons / lemon garnish', /lemon/],
  ['lime', 'Limes / lime garnish', /lime/],
  ['orange', 'Oranges / orange garnish', /orange/],
  ['grapefruit', 'Grapefruit / garnish', /grapefruit/],
  ['pineapple', 'Pineapple / fronds', /pineapple/],
  ['cherry', 'Cocktail cherries', /cherr/],
  ['nutmeg', 'Nutmeg', /nutmeg/],
  ['cinnamon', 'Cinnamon', /cinnamon/],
  ['clove', 'Cloves', /clove/],
  ['allspice', 'Ground allspice', /allspice/],
  ['salt', 'Salt', /salt/],
  ['mint', 'Mint', /mint/],
  ['basil', 'Basil', /basil/],
  ['sage', 'Sage', /sage/],
  ['thyme', 'Thyme', /thyme/],
  ['rosemary', 'Rosemary', /rosemary/],
  ['anise', 'Star anise', /star anise/],
  ['ginger', 'Fresh ginger', /ginger/],
  ['ginger-candied', 'Candied ginger', /candied ginger/],
  ['blackberry', 'Blackberries', /blackberr/],
  ['blueberry', 'Blueberries', /blueberr/],
  ['raspberry', 'Raspberries', /raspberr/],
  ['strawberry', 'Strawberries', /strawberr/],
  ['grape', 'Grapes', /\bgrape/],
  ['peach', 'Peaches', /peach/],
  ['apple', 'Apples', /apple/],
  ['cucumber', 'Cucumber', /cucumber/],
  ['olive-brine', 'Olive brine', /olive brine/],
  ['olive', 'Olives', /olive/],
  ['chocolate', 'Chocolate', /chocolate/],
  ['coffee-bean', 'Coffee beans', /coffee bean/],
  ['rose-water', 'Rose water', /rose water/],
  ['cookies', 'Holiday cookies', /cookies/],
  ['ice', 'Ice', /\bice\b/],
  ['water', 'Water', /\bwater\b/],
];

export const catalog = Object.fromEntries([...alcohol.map(([id,label])=>[id,{id,label,kind:'alcohol'}]),...other.map(([id,label])=>[id,{id,label,kind:'other'}])]);
const req = (text, options, optional=false) => ({text,options,optional});

export function classifyLine(raw) {
  const text = raw.replace(/^\s*-\s*\[[ xX]\]\s*/, '').trim();
  let s = normalize(text);
  const optional = /^\*?optional|^\(optional\)|\(optional\)$/.test(s);
  if (/serve with a small spoon/.test(s)) return [];
  if (/sprig of mint.*optional mist/.test(s)) return [req(text,['mint'])];
  if (/homemade falernum|cocoa nib infused|creme de cacao whipped cream/.test(s)) return [req(text,[],optional)];
  if (/jasper's mix/.test(s)) return ['lime-juice','sugar','bitters-aromatic','nutmeg'].map(id=>req(text,[id],optional));
  if (/chartreuse whipped cream/.test(s)) return [req(text,['cream','milk-coconut']),req(text,['chartreuse-green']),req(text,['sugar-powdered'])];
  if (/tom & jerry batter/.test(s)) return ['egg','sugar','vanilla','clove','allspice','cinnamon','salt','bitters-aromatic','rum-aged-jamaican'].map(id=>req(text,[id],optional));
  if (/yellow chartreuse \(or green\)/.test(s)) return [req(text,['chartreuse-yellow','chartreuse-green'],optional)];
  if (/dry curacao.* or grand marnier/.test(s)) return [req(text,['orange-liqueur','orange-brandy'],optional)];
  const a = alcohol.find(([, , pattern]) => pattern.test(s));
  if (a) {
    const requirements=[req(text,[a[0]],optional)];
    // Alcohol in a garnish is still a required alcoholic ingredient.
    if (/lemon.*angostura/.test(s)) requirements.push(req(text,['lemon'],optional));
    if (/angostura.*pineapple/.test(s)) requirements.push(req(text,['pineapple'],optional));
    if (/inverted lime/.test(s)) requirements.push(req(text,['lime'],optional));
    return requirements;
  }
  if (/bitters/.test(s)) return [req(text,[],optional)];
  if (/lemon or lime juice/.test(s)) return [req(text,['lemon-juice','lime-juice'],optional)];
  if (/groseille.*grenadine/.test(s)) return [req(text,['groseille','grenadine'],optional)];
  if (/semi-rich/.test(s)) return [req(text,/or 1:1/.test(s)?['simple-semirich','simple']:['simple-semirich'],optional)];
  if (/sage infused honey/.test(s)) return [req(text,['sage-honey'],optional)];
  if (/demerara syrup/.test(s)) return [req(text,['demerara-syrup'],optional)];
  if (/cream \(/.test(s)) return [req(text,['cream','half-half','creamer'],optional)];
  if (/cream, milk|half & half, milk/.test(s)) return [req(text,[/half/.test(s)?'half-half':'cream','milk','creamer'],optional)];
  if (/butter/.test(s)) return [req(text,['butter','butter-nondairy'],optional)];
  // Preserve OR alternatives for standard liquids/eggs instead of requiring both.
  if (/egg.*aquafaba|aquafaba.*egg/.test(s)) return [req(text,['egg','aquafaba'],optional)];
  if (/espresso or cold brew/.test(s)) return [req(text,['espresso','coldbrew'],optional)];
  if (/ginger beer or/.test(s)) return [req(text,['ginger-beer','ginger-ale'],optional)];
  if (/ice cream/.test(s)) return [req(text,/nondairy/.test(s)?['icecream','icecream-nondairy']:['icecream'],optional)];
  if (/hot water or hot milk/.test(s)) return [req(text,['water','milk'],optional)];
  if (/oat milk/.test(s)) return [req(text,['milk-oat','milk'],optional)];
  if (/heavy cream.*(?:or|substitute)/.test(s)) return [req(text,['cream',/coconut/.test(s)?'milk-coconut':'creamer'],optional)];
  if (/1\/2 & 1\/2 or/.test(s)) return [req(text,['half-half','creamer'],optional)];
  // Remove measurements before recognizing ingredient tokens; sugar:water is a ratio.
  s=s.replace(/\([^)]*\)/g,'');
  const primary = other.slice(0,other.findIndex(([id])=>id==='lemon')).find(([, , pattern])=>pattern.test(s));
  if (primary && !/sugared|sugar rim|cinnamon sugar|lemon wedge|packed brown|demerara sugar|powdered sugar/.test(s)) return [req(text,[primary[0]],optional)];
  if (/brown sugar/.test(s)) return [req(text,['sugar-brown'],optional)];
  if (/demerara sugar/.test(s)) return [req(text,['sugar-demerara'],optional)];
  if (/powdered sugar/.test(s)) return [req(text,['sugar-powdered'],optional)];
  let matches = other.slice(other.findIndex(([id])=>id==='lemon')).filter(([, , pattern])=>pattern.test(s)).map(([id])=>id);
  if (matches.includes('pineapple')) matches=matches.filter(id=>id!=='apple');
  if (matches.includes('grapefruit')) matches=matches.filter(id=>id!=='grape');
  if (matches.includes('olive-brine')) matches=matches.filter(id=>id!=='olive');
  if (matches.includes('ginger-candied')) matches=matches.filter(id=>id!=='ginger');
  if (matches.includes('ice')) matches=matches.filter(id=>id!=='water');
  if (/sugar/.test(s)) matches.push('sugar');
  if (!matches.length) return [req(text,[],optional)];
  if (/ or /.test(s)) return [req(text,[...new Set(matches)],optional)];
  return [...new Set(matches)].map(id=>req(text,[id],optional));
}

export const products = [
  ['The Botanist','gin-dry'],['Ketel One','vodka'],['CasAgave Añejo','tequila-anejo'],['Casa Dragones Blanco','tequila-blanco'],
  ['Jameson','irish-whiskey'],['Bulleit 95 Rye','rye'],['Wild Turkey 101','bourbon'],['E&J V.S.','brandy'],['Meukow V.S.','cognac'],
  ['Kōloa Single Barrel Kauaʻi Reserve','rum-aged'],["Jonah’s Curse",'rum-spiced'],['Bacardí 151','rum-151'],['St. George Absinthe Verte','absinthe'],
  ['Malibu Original','coconut-liqueur'],['Lillet Blanc','lillet-blanc'],["Dempsey’s",'cream-irish'],['Mr Black Cold Brew','coffee-liqueur'],
  ['Classica Triple Sec','orange-liqueur'],['Lazzaroni Maraschino','maraschino'],['Drillaud White Cocoa','cacao-white'],['Suze','suze'],['Campari','campari'],
  ['Drillaud Peach','peach-liqueur'],["Cointreau L’Unique",'orange-liqueur'],['Green Chartreuse','chartreuse-green'],
  ['Angostura Aromatic Bitters','bitters-aromatic'],['Fee Brothers West Indian Orange Bitters','bitters-orange'],['Giffard Sirop Orgeat','orgeat'],
  ['Master of Mixes Simple Syrup','simple']
].map(([name,type])=>({name,type}));
