import { Label } from '@radix-ui/react-label';
import { Separator } from '@radix-ui/react-separator';
import { FileVideo, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useMemo, useRef, useState } from 'react';
import { getFFmpeg } from '@/lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const previewUrl = useMemo(() => {
    if (!videoFile) {
      return;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile('input.mp4', await fetchFile(video.name));

    ffmpeg.on('progress', (progress) => {
      console.log('Convert progress:' + Math.round(progress.progress) * 100);
    });

    await ffmpeg.exec([
      'i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      'acodec',
      'libmp3lame',
      'output.mp3',
    ]);

    const data = await ffmpeg.readFile('output.mp3');

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' });
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio.mpeg',
    });

    console.log('Convert Finished');

    return audioFile;
  }

  async function handleUploadEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) return;

    const audioFile = await convertVideoToAudio(videoFile);

    console.log(audioFile);
  }

  return (
    <form className="space-y-6" onSubmit={handleUploadEvent}>
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewUrl}
            controls={false}
            className="pointer-events-none absolute inset-0 w-full h-full items-center justify-center"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        type="file"
        name="video"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          id="transcription_prompt"
          name="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras chaves mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>

      <Button type="submit" className="w-full">
        Carregar vídeo
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
