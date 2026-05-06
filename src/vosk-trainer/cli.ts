// Exposes some CLI commands as a ergonomic TS call to the rest of the code.

import { $ } from "bun";
import * as fs from "node:fs/promises";

type ExtraArgs = Record<string, any>;

function extraArgsToString(args?: ExtraArgs): string {
  if (!args) {
    return "";
  }

  let buff = "";

  for (const [key, value] of Object.entries(args)) {
    if (typeof value === "boolean") {
      buff += ` --${key}`;
    } else {
      buff += ` --${key} ${value}`;
    }
  }

  return buff.trim();
}

// YT-DLP
export async function ytdlpDownload(args: {
  video_url: string;
  extra_args?: ExtraArgs;
}): Promise<{ downloadedFiles: string[] }> {
  // Here goes some checks to make sure the inputed URL is a valid YT URL.
  if (!args.video_url) {
    throw new Error("ytdlpDownload() ERROR: No YouTube video URL");
  }

  const parsedUrl = URL.parse(args.video_url);

  if (!parsedUrl) {
    throw new Error(
      "ytdlpDownload() ERROR: Could not parse the requested URL: " +
        args.video_url,
    );
  }

  if (
    !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
      parsedUrl.host,
    )
  ) {
    throw new Error(
      "ytdlpDownload() ERROR: Inputed URL is not a youtube URL: " +
        args.video_url,
    );
  }

  const videoId = parsedUrl.searchParams.get("v");

  if (!videoId) {
    throw new Error(
      "ytdlpDownload() ERROR: Inputed URL has no video ID: " + args.video_url,
    );
  }

  // All good, lets download the video.
  if (!(await fs.exists("downloads"))) {
    await fs.mkdir("downloads");
  }

  if (!(await fs.exists(`downloads/${videoId}`))) {
    await fs.mkdir(`downloads/${videoId}`);
  }

  const cmd = `cd downloads/${videoId} && yt-dlp ${extraArgsToString(args.extra_args)} "${args.video_url}"`;
  await $`${{
    raw: cmd,
  }}`;

  return {
    downloadedFiles: await fs.readdir(`downloads/${videoId}`),
  };
}
