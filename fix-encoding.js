const fs = require('fs');

function fixMojibake(str) {
    if (!str) return str;
    
    const cp1251 = [
        0x402, 0x403, 0x201A, 0x453, 0x201E, 0x2026, 0x2020, 0x2021,
        0x20AC, 0x2030, 0x409, 0x2039, 0x40A, 0x40C, 0x40B, 0x40F,
        0x452, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
        0, 0x2122, 0x459, 0x203A, 0x45A, 0x45C, 0x45B, 0x45F,
        0xA0, 0x40E, 0x45E, 0x408, 0xA4, 0x490, 0xA6, 0xA7,
        0x401, 0xA9, 0x404, 0xAB, 0xAC, 0xAD, 0xAE, 0x407,
        0xB0, 0xB1, 0x406, 0x456, 0x491, 0xB5, 0xB6, 0xB7,
        0x451, 0x2116, 0x454, 0xBB, 0x458, 0x405, 0x455, 0x457
    ];
    
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code < 128) {
            bytes.push(code);
        } else {
            let byte = -1;
            if (code >= 0x410 && code <= 0x44F) {
                byte = code - 0x410 + 0xC0;
            } else {
                for (let j = 0; j < cp1251.length; j++) {
                    if (cp1251[j] === code) {
                        byte = 0x80 + j;
                        break;
                    }
                }
                if (byte === -1) {
                    byte = code < 256 ? code : 63;
                }
            }
            bytes.push(byte);
        }
    }
    
    let buffer = Buffer.from(bytes);
    let decoded = buffer.toString('utf8');
    if (decoded.includes('\uFFFD')) {
        return str; 
    }
    return decoded;
}

const path = "public/Рост президентов стран/data/leaders-by-height.clean.json";
let raw = fs.readFileSync(path, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
}
let data = JSON.parse(raw);

let changed = false;
for (let entry of data) {
    let newLeader = fixMojibake(entry.leader);
    let newCountry = fixMojibake(entry.country);
    if (newLeader !== entry.leader || newCountry !== entry.country) {
        console.log(`Fixing: ${entry.leader} -> ${newLeader}`);
        entry.leader = newLeader;
        entry.country = newCountry;
        changed = true;
    }
}

if (changed) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
    console.log("Fixed JSON saved.");
}
