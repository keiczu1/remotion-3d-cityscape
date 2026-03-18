---
name: ffmpeg
description: Использование FFmpeg и FFprobe в Remotion
metadata:
  tags: ffmpeg, ffprobe, video, trimming
---

## FFmpeg в Remotion

`ffmpeg` и `ffprobe` не нужно ставить отдельно. Они доступны через `bunx remotion ffmpeg` и `bunx remotion ffprobe`:

```bash
bunx remotion ffmpeg -i input.mp4 output.mp3
bunx remotion ffprobe input.mp4
```

### Обрезка видео

Есть два способа обрезать видео:

1. Использовать командную строку FFMpeg. Видео нужно перекодировать заново, иначе в начале могут появиться зависшие кадры.

```bash
# Перекодирует с точного кадра
bunx remotion ffmpeg -ss 00:00:05 -i public/input.mp4 -to 00:00:10 -c:v libx264 -c:a aac public/output.mp4
```

2. Использовать props `trimBefore` и `trimAfter` у компонента `<Video>`. Плюс этого способа в том, что он неразрушающий, и trim можно менять в любой момент.

```tsx
import { Video } from "@remotion/media";

<Video
  src={staticFile("video.mp4")}
  trimBefore={5 * fps}
  trimAfter={10 * fps}
/>;
```
