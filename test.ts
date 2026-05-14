import { data } from "./src/compositions/2026-03-30-richest-women/model/data.ts";
console.log(data.slice(0, 5).map(d => `${d.name}: relHeight=${d.relHeight}, height=${Math.pow(d.relHeight, 1.45) * 6.5}`));
