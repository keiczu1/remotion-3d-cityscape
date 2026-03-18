---
name: transcribe-captions
description: Транскрибация аудио для генерации captions в Remotion
metadata:
  tags: captions, transcribe, whisper, audio, speech-to-text
---

# Транскрибация аудио

Чтобы получить captions из аудио в Remotion, можно использовать функцию [`transcribe()`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe) из пакета [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp).

## Подготовка

Сначала установи пакет `@remotion/install-whisper-cpp`.
Если его еще нет, используй команду:

```bash
npx remotion add @remotion/install-whisper-cpp
```

## Транскрибация

Сделай Node.js-скрипт, который скачает Whisper.cpp, модель и выполнит транскрибацию аудио.

```ts
import path from "path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import fs from "fs";

const to = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({
  to,
  version: "1.5.5",
});

await downloadWhisperModel({
  model: "medium.en",
  folder: to,
});

// При необходимости сначала преобразуй аудио в wav 16 KHz:
// import {execSync} from 'child_process';
// execSync('ffmpeg -i /path/to/audio.mp4 -ar 16000 /path/to/audio.wav -y');

const whisperCppOutput = await transcribe({
  model: "medium.en",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: "/path/to/audio123.wav",
  tokenLevelTimestamps: true,
});

// Необязательно: применить рекомендованную постобработку
const { captions } = toCaptions({
  whisperCppOutput,
});

// Записать JSON в public/, чтобы Remotion мог его загрузить
fs.writeFileSync("captions123.json", JSON.stringify(captions, null, 2));
```

Каждый клип лучше транскрибировать отдельно и сохранять в отдельный JSON-файл.

Как отобразить captions в Remotion, смотри в [Отображении captions](display-captions.md).
