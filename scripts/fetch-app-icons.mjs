import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('public/ranking-corridor/2026-04-07-best-selling-mobile-games/data.json');
const imagesDir = path.resolve('public/ranking-corridor/2026-04-07-best-selling-mobile-games/images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function fetchIcon(term, dest) {
    try {
        console.log(`Searching iTunes for: ${term}`);
        const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=1`);
        const searchJson = await searchRes.json();
        
        if (searchJson.results && searchJson.results.length > 0) {
            let imgUrl = searchJson.results[0].artworkUrl512;
            
            // Sometimes we want 1024x1024 to make sure quality is max
            imgUrl = imgUrl.replace('512x512bb', '1024x1024bb');

            console.log(`Downloading: ${imgUrl}`);
            const imgRes = await fetch(imgUrl);
            const buffer = await imgRes.arrayBuffer();
            fs.writeFileSync(dest, Buffer.from(buffer));
            console.log(`Saved ${dest}`);
            return true;
        } else {
            console.log(`!!! No results for ${term}`);
            return false;
        }
    } catch (e) {
        console.error(`Error fetching for ${term}:`, e.message);
        return false;
    }
}

async function run() {
    console.log(`Staring image extraction for ${data.entries.length} items...`);
    for (const entry of data.entries) {
        const dest = path.join(imagesDir, entry.image_file);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
            console.log(`Skipping ${entry.display_name} - already exists.`);
            continue;
        }
        
        const success = await fetchIcon(entry.display_name, dest);
        if (!success) {
            // Let's try searching the pokemon_name with removed underscores
            const fallbackTerm = entry.pokemon_name.replace(/_/g, ' ');
            console.log(`Trying fallback term: ${fallbackTerm}`);
            await fetchIcon(fallbackTerm, dest);
        }
        
        await delay(500); // polite delay
    }
    console.log("Done!");
}

run();
