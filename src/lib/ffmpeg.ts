import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
// import coreURL from '../ffmpeg/ffmpeg-core.js?url';
// import wasmURL from '../ffmpeg/ffmpeg-core.wasm?url';
// import workerURL from '../ffmpeg/ffmpeg-worker.js?url';
const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/esm/';
const coreURL = `${baseURL}ffmpeg-core.js`;
const wasmURL = `${baseURL}ffmpeg-core.wasm`;
const workerURL = `${baseURL}ffmpeg-core.worker.js`;

let ffmpeg: FFmpeg | null;

export async function getFFmpeg() {
  if (ffmpeg) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL: await toBlobURL(coreURL, 'text/javascript'),
      wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
      workerURL: await toBlobURL(workerURL, 'text/javascript'),
    });
  }

  return ffmpeg;
}
