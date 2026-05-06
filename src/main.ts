import * as voskTrainerCli from "./vosk-trainer/cli";

async function main() {
  // yt-dlp --write-auto-subs --write-subs --sub-lang pt --convert-subs srt
  const downloadedFiles = await voskTrainerCli.ytdlpDownload({
    video_url: "https://www.youtube.com/watch?v=9iQQ9Qf918c",
    extra_args: {
      "write-auto-subs": true,
      "write-subs": true,
      "sub-lang": "pt",
      "convert-subs": "srt",
      "extract-audio": true,
      "audio-format": "wav",
    },
  });

  console.log(downloadedFiles);
}

main();
