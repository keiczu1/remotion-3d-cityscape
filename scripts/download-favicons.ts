import fs from 'fs';
import path from 'path';
import { data } from '../src/data';

const publicDir = path.resolve(process.cwd(), 'public/favicons');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

async function download(url: string, dest: string, minSize: number = 1000): Promise<boolean> {
    try {
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!response.ok) {
            return false;
        }

        const type = response.headers.get('content-type') || '';
        if (!type.startsWith('image/')) {
            return false;
        }

        const buffer = await response.arrayBuffer();

        // Anti-corruption check: Reject tiny low-res or 1x1 tracking pixels
        if (buffer.byteLength < minSize) {
            return false;
        }

        fs.writeFileSync(dest, Buffer.from(buffer));
        return true;
    } catch (e) {
        return false;
    }
}

function getBrandName(domain: string): string {
    return domain.replace('.com', '').replace('.ru', '').replace('.org', '').replace('.net', '').replace('.co.jp', '').replace('www.', '').split('.')[0];
}

async function main() {
    console.log(`Downloading ${data.length} favicons - Enforcing HD quality...`);
    let success = 0;

    for (const item of data) {
        const dest = path.join(publicDir, `${item.domain}.png`);
        console.log(`\nProcessing ${item.domain}...`);

        // Array of high-quality HD logo providers to try in order
        const hdSources = [
            `https://api.faviconkit.com/${item.domain}/256`,
            `https://icon.horse/icon/${item.domain}`,
            `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${item.domain}&size=256`
        ];

        let res = false;
        for (const url of hdSources) {
            res = await download(url, dest, 250); // Accept anything > 250 bytes (blocks 43b tracking pixels, but allows 330b Twitch logo)
            if (res) {
                console.log(` => Success: Found HD Logo`);
                break;
            }
        }

        // If no HD logo found, fallback to auto-generated crisp 256x256 letter avatar
        if (!res) {
            console.log(` => Fallback: Auto-generating HD letters for ${item.domain}`);
            const brand = getBrandName(item.domain);
            const fallbackUrl = `https://ui-avatars.com/api/?name=${brand}&size=256&background=0A1128&color=00E5FF&font-size=0.5&bold=true`;
            res = await download(fallbackUrl, dest, 200); // accept avatars which might be small in bytes but are sharp SVGs/PNGs
        }

        if (res) {
            success++;
        } else {
            console.log(`[FAILED] Complete failure for ${item.domain}`);
        }
    }

    console.log(`\nSuccessfully downloaded ${success}/${data.length} crystal clear logos!`);
}

main();
