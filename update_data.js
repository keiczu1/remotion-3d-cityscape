const fs = require('fs');
const path = require('path');

const dataPath = path.resolve('d:/Git/Keiczu1/Remotion/public/final_ranking.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const fileData = JSON.parse(rawData);

const overrides = {
  "Hetty Green": {
    money: "19th Century Financier\nWall Street & Real estate",
    fact: "Known as the 'Witch of Wall Street,' she was famously frugal but brilliantly ruthless. She snapped up distressed bonds and foreclosed properties to become the wealthiest woman of the Gilded Age."
  },
  "Madam C. J. Walker": {
    money: "Haircare Pioneer\nBeauty products for Black women",
    fact: "She was America's first female self-made millionaire. She started with nothing and built an empire selling haircare products specifically designed for Black women."
  },
  "Annie Turnbo Malone": {
    money: "Beauty Entrepreneur\nPoro haircare empire",
    fact: "Even before Madam C.J. Walker got famous, Malone was quietly building a massive Black-owned beauty business. She made her millions through cosmetics and a nationwide network of beauty schools."
  },
  "Marjorie Merriweather Post": {
    money: "Food Empire Heiress\nPost Cereal & General Foods",
    fact: "She turned her family's cereal business into the General Foods empire. She was the original owner of the Mar-a-Lago estate long before it became famous for other reasons."
  },
  "Brooke Astor": {
    money: "New York Socialite\nAstor real estate fortune",
    fact: "She married into the legendary Astor dynasty and their vast Manhattan real estate wealth. For decades, her name meant ultimate high society, old money, and huge philanthropic gifts."
  },
  "Huguette Clark": {
    money: "Copper Heiress\nMining fortune",
    fact: "She inherited a massive copper mining fortune but spent decades living entirely out of public sight in hospital rooms. Meanwhile, she owned empty mansions and world-class paintings."
  },
  "Barbara Hutton": {
    money: "Retail Heiress\nWoolworth department stores",
    fact: "The press called her the 'Poor Little Rich Girl.' She inherited the massive Woolworth department store fortune but became famous for her lavish spending and seven turbulent marriages."
  },
  "Doris Duke": {
    money: "Tobacco Heiress\nDuke family fortune",
    fact: "She took the billions her family made from tobacco and power companies and spent them on art, world travel, and sprawling estates. She was essentially American royalty."
  },
  "Dirce Navarro De Camargo": {
    money: "Business Matriarch\nConstruction & Energy",
    fact: "She was the quiet force behind a massive Brazilian conglomerate spanning cement, construction, and electricity. She basically built much of Latin America's modern infrastructure."
  },
  "Doris Fisher": {
    money: "Retail Founder\nGap clothing stores",
    fact: "She co-founded Gap to fix a simple problem: her husband couldn't find jeans that fit. From that one store, they built a global fashion empire that defined 90s casual style."
  },
  "Helen Walton": {
    money: "Retail Matriarch\nWalmart",
    fact: "She was there when her husband Sam opened the first Walmart. As the business grew into a global heavyweight, she quietly became one of the planet's wealthiest people."
  },
  "Anne Cox Chambers": {
    money: "Media Heiress\nTelevision & Newspapers",
    fact: "She and her sister inherited a giant newspaper and TV network, then watched its value explode during the cable television boom. She spent 33 years running the massive Cox media empire."
  },
  "Leona Helmsley": {
    money: "Real Estate Tycoon\nLuxury hotels",
    fact: "Nicknamed the 'Queen of Mean,' she ran a Manhattan hotel empire with an iron fist. She famously went to prison for tax evasion after reportedly claiming 'only the little people pay taxes.'"
  },
  "Barbara Cox Anthony": {
    money: "Media Heiress\nTelevision & Newspapers",
    fact: "She co-owned the mammoth privately-held Cox media empire with her sister. They quietly controlled major newspapers, local TV stations, and a huge chunk of America's cable networks."
  },
  "Liliane Bettencourt": {
    money: "Cosmetics Heiress\nL'Oréal",
    fact: "She was the only child of L'Oréal's founder and became the richest woman in the world. Her final years were overshadowed by a massive scandal involving gifts to a celebrity photographer."
  },
  "Marguerite Harbert": {
    money: "Construction Heiress\nHarbert Corporation",
    fact: "She inherited a fortune born in Alabama construction that eventually expanded into global investments. She quietly became one of the wealthiest people in the American South."
  },
  "Birgit Rausing": {
    money: "Packaging Heiress\nTetra Pak",
    fact: "Her fortune comes from a simple invention: the cardboard drink carton. The Tetra Pak changed how the world buys milk and juice, turning her family into billionaires."
  },
  "Johanna Quandt": {
    money: "Automotive Heiress\nBMW",
    fact: "She started as a secretary at BMW, married the boss who saved the company from bankruptcy, and eventually inherited a massive stake. She was one of the prime forces behind the luxury car maker."
  },
  "Joan Kroc": {
    money: "Fast Food Heiress\nMcDonald's",
    fact: "She inherited the McDonald's fortune from her husband, Ray Kroc. Instead of hoarding the billions, she became famously generous, secretly giving away vast sums to charity."
  },
  "Kwong Siu-hing": {
    money: "Real Estate Matriarch\nSun Hung Kai Properties",
    fact: "She took control of Hong Kong's largest property developer after her husband passed away. She became a central figure in one of Asia's most dramatic wealthy family feuds."
  },
  "Susan Thompson Buffett": {
    money: "Investor's Wife\nBerkshire Hathaway shares",
    fact: "She married Warren Buffett long before he became a billionaire legend. They lived separately for decades but she remained one of the largest shareholders of his massive investment empire."
  },
  "Lily Safra": {
    money: "Banking Widow\nSafra private banking",
    fact: "She married into the intensely secretive Safra banking dynasty. After her husband died in a mysterious fire in Monaco, she became known for her stunning art collection and historic Riviera villas."
  },
  "Eva Gonda de Rivera": {
    money: "Beverage Heiress\nOXXO & Coca-Cola bottling",
    fact: "Her family built a Latin American empire based on convenience stores and soft drinks. Thanks to a massive Coca-Cola bottling operation and the ubiquitous OXXO shops, she became Mexico's wealthiest woman."
  },
  "Nina Wang": {
    money: "Property Tycoon\nChinachem Group",
    fact: "She famously wore pigtails and lived frugally despite being Asia's richest woman. Her life sounded like a movie: her husband was kidnapped and vanished, leaving her to run a massive property empire."
  },
  "Barbara Piasecka Johnson": {
    money: "Healthcare Heiress\nJohnson & Johnson",
    fact: "She arrived in the US from Poland with $100 and got a job as a cook for the Johnson & Johnson heir. She married him, inherited his wealth, and became one of the world's most talked-about billionaires."
  },
  "Judy Love": {
    money: "Highway Retail Hero\nLove's Travel Stops",
    fact: "She and her husband started with a $5,000 loan and one gas station. They turned it into the massive Love's truck stop empire, proving you don't need tech to make billions in America."
  },
  "Maria Franca Fissolo": {
    money: "Confectionery Widow\nFerrero Group (Nutella)",
    fact: "She was a secretary who married Michele Ferrero, the man who brought Nutella, Tic Tacs, and Ferrero Rocher to the world. She inherited the keys to Europe's sweetest fortune."
  },
  "Jacqueline Mars": {
    money: "Candy Heiress\nMars Inc.",
    fact: "She owns a massive slice of the fiercely private company that makes Snickers, M&Ms, and Pedigree pet food. It's a sweet but quiet inherited fortune that rarely makes headlines."
  },
  "Marilyn Carlson Nelson": {
    money: "Travel Heiress\nCarlson Companies",
    fact: "She inherited an empire sprawling across hotels and global travel services. Unlike many quiet heirs, she took an active role, broke glass ceilings, and pushed the company forward."
  },
  "Elaine Wynn": {
    money: "Casino Queen\nWynn Resorts",
    fact: "She's the 'Queen of Las Vegas.' She co-founded sprawling casino resorts that defined the modern Strip, then fought highly public board battles to retain her billionaire status after a divorce."
  },
  "Barbara Carlson Gage": {
    money: "Travel Heiress\nCarlson Companies",
    fact: "Along with her sister, she inherited a global travel and hospitality powerhouse. It's a classic Midwestern American fortune that quietly expanded around the globe."
  },
  "Friede Springer": {
    money: "Publishing Heiress\nAxel Springer Media",
    fact: "She was a nanny who married the founder of Germany's biggest publishing house. After he died, she took control and transformed the company into a modern digital media giant."
  },
  "Iris Fontbona": {
    money: "Mining Matriarch\nAntofagasta PLC",
    fact: "She inherited a massive Chilean copper mining and brewing empire. While staying mostly out of the spotlight, she controls one of the most powerful business groups in Latin America."
  },
  "Massimiliana Landini Aleotti": {
    money: "Pharma Heiress\nMenarini Group",
    fact: "She inherited Menarini, Italy's leading pharmaceutical company. It's an enormous drug empire built quietly over decades, making her one of the very richest women in Europe."
  },
  "Antonia Ax:son Johnson": {
    money: "Trading Heiress\nAxel Johnson Group",
    fact: "She took over a massive Swedish trading and retail empire from her father. She expanded the old-school industrial business into everything from food to energy across Europe."
  },
  "Charlotte Colket Weber": {
    money: "Soup Heiress\nCampbell Soup",
    fact: "Her fortune comes mostly from condensed soup. As a major heir to the Campbell Soup empire, she used her wealth to become a massive patron of art and thoroughbred horse racing."
  },
  "Rosalia Mera": {
    money: "Fashion Founder\nZara",
    fact: "She dropped out of school to become a seamstress. Along with her ex-husband, she started making clothes at home—and built Zara into a business that completely changed global fashion."
  },
  "Elaine Marshall": {
    money: "Industrial Heiress\nKoch Industries",
    fact: "She married into a major stake of the intensely private Koch Industries. It's an empire built on oil, chemicals, and pipelines, making her a silent billionaire powerhouse."
  },
  "Miriam Adelson": {
    money: "Casino Queen\nLas Vegas Sands",
    fact: "She was a doctor researching drug addiction before she married billionaire Sheldon Adelson. Now she controls a massive empire of mega-casinos spanning from Vegas to Macau."
  },
  "Rafaela Aponte-Diamant": {
    money: "Shipping Tycoon\nMSC Cruises & Cargo",
    fact: "She and her husband started with a single cargo ship and built MSC into the world's biggest container line. It's an incredibly rare case of a massive self-made logistics fortune."
  },
  "Diane Hendricks": {
    money: "Building Supplies Tycoon\nABC Supply",
    fact: "She co-founded a roofing and siding distributor and turned it into an absolute juggernaut. Today she's America's wealthiest self-made woman, purely through selling construction materials."
  },
  "Sherry Brydson": {
    money: "Media Heiress\nThomson Reuters",
    fact: "Her fortune comes from a massive Canadian media and financial data empire. She keeps an incredibly low profile while holding a giant stake in the Thomson Reuters holding company."
  },
  "Ann Walton Kroenke": {
    money: "Retail Heiress\nWalmart",
    fact: "As a niece of Walmart founder Sam Walton, she inherited massive stock holdings. She's also married to sports mogul Stan Kroenke, combining retail billions with major league sports."
  },
  "Alice Walton": {
    money: "Retail Heiress\nWalmart",
    fact: "She is the daughter of Walmart founder Sam Walton. Instead of working at the family company, she used her retail billions to curate one of the world's finest private art collections."
  },
  "Christy Walton": {
    money: "Retail Heiress\nWalmart",
    fact: "She married into the Walmart dynasty. After her husband died in a tragic plane crash, she instantly became one of the wealthiest women on earth thanks to his stock holdings."
  },
  "Miuccia Prada": {
    money: "Fashion Icon\nPrada",
    fact: "She took over her grandfather's modest luggage company and transformed it into a global high-fashion powerhouse. She basically defined intellectual luxury clothing for decades."
  },
  "Christina Onassis": {
    money: "Shipping Heiress\nOnassis fleet",
    fact: "She was the sole surviving heir to Aristotle Onassis' legendary shipping fortune. Her life was a mix of unimaginable jet-set luxury and deep personal tragedy."
  },
  "Mary Alice Dorrance Malone": {
    money: "Soup Heiress\nCampbell Soup",
    fact: "She is the largest shareholder of the Campbell Soup Company. Her immense fortune comes from a simple pantry staple, allowing her to live quietly while investing in equestrian estates."
  },
  "Blair Parry-Okeden": {
    money: "Media Heiress\nCox Enterprises",
    fact: "She inherited a quarter of the vast Cox media and automotive empire. Though she grew up in the US, she moved to Australia and quietly became the richest person in the country."
  },
  "Esther Koplowitz": {
    money: "Infrastructure Heiress\nFCC Construction",
    fact: "She inherited a colossal Spanish construction and public services company. She managed to buy out her sister and navigate massive corporate battles while maintaining her billionaire status."
  },
  "Savitri Jindal": {
    money: "Steel Matriarch\nO.P. Jindal Group",
    fact: "After her husband died in a helicopter crash, she took over the sprawling Jindal empire spanning steel, mining, and power generation. She is now the wealthiest woman in India."
  },
  "Beate Heister": {
    money: "Supermarket Heiress\nAldi",
    fact: "She is the notoriously secretive heir to the Aldi discount supermarket fortune. Millions of people buy cheap groceries there every week, steadily adding to her massive wealth."
  },
  "Carrie Perrodo": {
    money: "Oil & Gas Widow\nPerenco",
    fact: "Originally a model from Singapore, she inherited the privately-owned oil company Perenco after her husband's death in a climbing accident. The family has kept the business quietly printing money."
  },
  "Marilyn Simons": {
    money: "Hedge Fund Philanthropist\nRenaissance Technologies",
    fact: "Her husband founded the world's most successful algorithmic hedge fund. Instead of just hoarding the massive tech-finance wealth, she directs billions into advanced scientific and math research."
  },
  "Nancy Walton Laurie": {
    money: "Retail Heiress\nWalmart",
    fact: "Inheriting a fortune from the Walmart empire, she and her family use the dividends for massive investments spanning real estate, dance studios, and professional sports teams."
  },
  "Kirsten Rausing": {
    money: "Packaging Heiress\nTetra Laval",
    fact: "She sits on the board of the Tetra Pak packaging giant. Living in the UK, she spends much of her incredible wealth breeding world-class racehorses at her own stud farm."
  },
  "Vicky Safra": {
    money: "Banking Heir\nBanco Safra",
    fact: "Following her husband's passing, she took over a 180-year-old banking dynasty that stretches across the globe. She is now at the center of one of South America's deepest banking fortunes."
  },
  "Francoise Bettencourt Meyers": {
    money: "Cosmetics Heiress\nL'Oréal",
    fact: "She is the granddaughter of L'Oréal's founder and the richest woman on the planet. Despite her staggering cosmetics fortune, she is heavily focused on writing books about Greek gods."
  },
  "Kiran Mazumdar-Shaw": {
    money: "Biotech Pioneer\nBiocon",
    fact: "She started a biotech company in her garage in India when nobody believed in female entrepreneurs. Today, she's a self-made billionaire making affordable insulin and life-saving drugs."
  },
  "Alicia Koplowitz": {
    money: "Investment Tycoon\nOmega Capital",
    fact: "She sold her share in the family construction business to her sister and turned the cash into an incredibly successful private investment fund, proving her own financial genius."
  },
  "Charlene de Carvalho-Heineken": {
    money: "Brewery Heiress\nHeineken",
    fact: "She is the controlling shareholder of Heineken, inheriting the massive stake from her father. In one smooth transition, she took control of one of the world's most famous beer brands."
  },
  "Gina Rinehart": {
    money: "Mining Magnate\nHancock Prospecting",
    fact: "She took her father's struggling iron ore company and aggressively turned it into a colossal mining empire. She is the undisputed, tough-talking queen of the Australian outback."
  },
  "Oprah Winfrey": {
    money: "Media Mogul\nHarpo Productions",
    fact: "She escaped profound poverty to build a television talk show that completely changed modern culture. She owns her show, her network, and her brand, making her the ultimate self-made media billionaire."
  },
  "Ronda Stryker": {
    money: "Medical Tech Heiress\nStryker Corporation",
    fact: "Her grandfather invented a mobile hospital bed and started a medical equipment company. That business exploded into a global healthcare giant, securing her billions in stock."
  },
  "Trudy Cathy White": {
    money: "Fast Food Heiress\nChick-fil-A",
    fact: "She inherited the wildly popular Chick-fil-A franchise. It's a unique fast-food fortune because the family has kept it completely private and still famously closes all locations on Sundays."
  },
  "Shari Arison": {
    money: "Banking & Cruise Heiress\nCarnival Cruises & Banking",
    fact: "She inherited a massive fortune drawn from Israeli banking and the Carnival cruise line. She then transitioned into high-profile global philanthropy and impact investing."
  },
  "Zhang Yin": {
    money: "Paper Tycoon\nNine Dragons Paper",
    fact: "She saw value where others saw trash. She made billions by importing scrap paper from the US to China and recycling it into ubiquitous cardboard shipping boxes."
  },
  "Valerie Mars": {
    money: "Candy Heiress\nMars Inc.",
    fact: "She is part of the massively wealthy, intensely private Mars family. Every time you buy an M&M, Snickers, or even Whiskas cat food, you're adding to her fortune."
  },
  "Abigail Johnson": {
    money: "Finance CEO\nFidelity Investments",
    fact: "She didn't just inherit the massive Fidelity mutual fund empire; she runs it. She was also one of the first major Wall Street CEOs to aggressively embrace cryptocurrency."
  },
  "Zhong Huijuan": {
    money: "Pharma Founder\nHansoh Pharmaceutical",
    fact: "She quit her job as a chemistry teacher to start a pharmaceutical company. She turned it into a massive drug manufacturer, becoming one of the most successful self-made women in Asia."
  },
  "Margarita Louis-Dreyfus": {
    money: "Commodities Tycoon\nLouis Dreyfus Company",
    fact: "Look at the grain or cotton in your house—her company probably shipped it. After inheriting a centuries-old trading empire from her husband, she successfully consolidated her control over it."
  },
  "Susanne Klatten": {
    money: "Automotive & Chemical Tycoon\nBMW & Altana",
    fact: "She holds sweeping stakes in BMW and an international chemical company. To protect her privacy, she once worked under an assumed name in her own company to learn the business."
  },
  "Laurene Powell Jobs": {
    money: "Tech Investor\nApple & Disney shares",
    fact: "After Steve Jobs passed away, she inherited massive stakes in Apple and Disney. Rather than sitting back, she launched an aggressively active investing and social impact firm."
  },
  "Maria Asuncion Aramburuzabala": {
    money: "Brewery & Real Estate Heiress\nCorona (Grupo Modelo)",
    fact: "Her family gave the world Corona beer. After selling the brewery, she took her immense wealth, became a ruthless venture capitalist, and established herself as a titan in Mexican business."
  },
  "Yelena Baturina": {
    money: "Construction Tycoon\nInteco",
    fact: "As the wife of Moscow's former mayor, she built a staggering fortune in Russian real estate and construction. For a long time, she was the only female billionaire in Russia."
  },
  "Melinda French Gates": {
    money: "Philanthropist & Investor\nMicrosoft shares & Investments",
    fact: "She helped build the world's most powerful philanthropic foundation. Following her towering divorce from Bill Gates, she emerged with her own immense tech fortune and a new investing identity."
  },
  "Wu Yajun": {
    money: "Real Estate Mogul\nLongfor Properties",
    fact: "She started as a factory worker and journalist before building one of China's premier housing developers from scratch. She is the definition of a relentlessly driven self-made titan."
  },
  "J. K. Rowling": {
    money: "Author & Creator\nHarry Potter franchise",
    fact: "She wrote a story about a wizard on a delayed train while living on state benefits. It became the best-selling book series in history, spinning off films, theme parks, and billions."
  },
  "Marijke Mars": {
    money: "Candy Heiress\nMars Inc.",
    fact: "Like her sisters, she inherited a chunk of the privately-held Mars candy and pet empire. It remains one of the quietest and most stable billionaire fortunes in American business."
  },
  "Denise Coates": {
    money: "Online Betting Founder\nbet365",
    fact: "She bought the domain Bet365 on eBay and launched a sports betting site from a portable cabin. Today, she routinely ranks as one of the highest-paid chief executives in the entire world."
  },
  "Renata Kellnerova": {
    money: "Finance & Telecom Widow\nPPF Group",
    fact: "Her husband died in a tragic Alaskan helicopter crash, leaving her control of a massive Czech conglomerate. The empire touches everything from consumer lending to telecommunications across Eastern Europe."
  },
  "Wang Laichun": {
    money: "Electronics Tycoon\nLuxshare Precision",
    fact: "She spent 10 years working on Foxconn assembly lines before quitting to start her own electronics company. Now she makes billions supplying critical parts for Apple's AirPods and iPhones."
  },
  "Sandra Ortega Mera": {
    money: "Fashion Heiress\nZara (Inditex)",
    fact: "She is the daughter of the founders of the Zara fashion empire. Unlike many billionaires, she keeps a fiercely private life, shunning the press and focusing completely on philanthropy."
  },
  "MacKenzie Scott": {
    money: "Philanthropist\nAmazon shares",
    fact: "She was married to Jeff Bezos for 25 years before their divorce gave her a massive stake in Amazon. She instantly became wealthier than most monarchs—and immediately started giving it all away."
  },
  "Zhou Qunfei": {
    money: "Glass Manufacturing Founder\nLens Technology",
    fact: "She dropped out of school to make watch lenses. Eventually, she pioneered the massive glass screens used on smartphones, supplying giants like Apple and Samsung to make her billions."
  },
  "Sara Blakely": {
    money: "Shapewear Inventor\nSpanx",
    fact: "She cut the feet off her pantyhose to make smoothing undergarments, patenting the idea herself. Spanx became an absolute phenomenon, placing her entirely organically into the billionaire club."
  },
  "Lyndal Stephens Greth": {
    money: "Oil Heiress\nEndeavor Energy",
    fact: "Her billionaire status materialized almost overnight after her family's intensely private Texas oil business exploded in value, showcasing how raw natural resources still mint ultra-wealth."
  },
  "Tatyana Kim": {
    money: "E-commerce Founder\nWildberries",
    fact: "While on maternity leave, she started reselling clothes she ordered from German catalogs. It exploded into Wildberries, turning her into Russia's undisputed e-commerce queen."
  },
  "Julia Koch": {
    money: "Industrial Widow\nKoch Industries",
    fact: "When her husband David Koch passed away, she inherited a massive chunk of his fiercely private industrial empire. She essentially went from socialite to one of the richest people on Earth."
  },
  "Yang Huiyan": {
    money: "Real Estate Heiress\nCountry Garden",
    fact: "Before she even turned 30, her father transferred massive shares in his gigantic Chinese property development firm to her name, briefly making her the outright richest woman in Asia."
  },
  "Athina Onassis": {
    money: "Shipping Heiress\nOnassis fortune",
    fact: "She is the sole surviving heir to legendary shipping magnate Aristotle Onassis. Despite growing up with staggering wealth and media attention, her actual liquid fortune turned out smaller than legends claimed."
  },
  "Rihanna": {
    money: "Singer & Business Tycoon\nFenty Beauty & Savage X",
    fact: "Everyone knows her as a singer, but music didn't make her a billionaire. She created a makeup line for all skin tones and completely disrupted the global beauty industry."
  },
  "Taylor Swift": {
    money: "Singer & Songwriter\nMusic catalogue & Eras Tour",
    fact: "Forget selling makeup or running hedge funds. She achieved billionaire status almost entirely through the sheer, unprecedented success of her songwriting, streaming rights, and colossal global tours."
  }
};

fileData.entries = fileData.entries.map(entry => {
  const o = overrides[entry.name];
  if (o) {
    entry.money_from = o.money;
    entry.fact = o.fact;
  }
  return entry;
});

fs.writeFileSync(dataPath, JSON.stringify(fileData, null, 2));
console.log('Update finished.');
