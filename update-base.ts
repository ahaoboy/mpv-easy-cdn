import { decode, encode, File, Fmt } from "@easy-install/easy-archive";
import { downloadBinary } from "@mpv-easy/mpsm";
import { writeFileSync } from "fs";

const now = BigInt(+new Date());

async function updateYtdlp() {
  const bin = await downloadBinary(
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
  );
  const zip = encode(Fmt.Zip, [
    new File("yt-dlp.exe", bin, null, false, now),
  ]);
  if (!zip) {
    console.log("ytdlp encode zip error");
    return;
  }
  writeFileSync("yt-dlp.zip", zip);
}

const FFmpegist = [
  {
    name: "ffmpeg-windows",
    url:
      "https://github.com/mpv-easy/mpv-easy/releases/latest/download/ffmpeg-windows.zip",
  },
  // {
  //   name: "ffmpeg-v3-windows",
  //   url:
  //     "https://github.com/mpv-easy/mpv-easy/releases/latest/download/ffmpeg-v3-windows.zip",
  // },
];

async function updateFFmpeg() {
  for (const { name, url } of FFmpegist) {
    const bin = await downloadBinary(url);
    const xzName = name + ".tar.xz";
    const files = decode(Fmt.Zip, bin);
    if (!files) {
      console.log(`${name} decode zip error`);
      continue;
    }
    const xz = encode(Fmt.TarXz, files);
    if (!xz) {
      console.log(`${name} encode xz error`);
      continue;
    }
    writeFileSync(xzName, xz);
  }
}

const BaseList = [
  {
    name: "mpv-windows",
    url:
      "https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-windows.zip",
  },
  {
    name: "mpv-v3-windows",
    url:
      "https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-v3-windows.zip",
  },
  {
    name: "mpv-qjs-windows",
    url:
      "https://github.com/mpv-easy/mpv-easy/releases/latest/download/mpv-qjs-windows.zip",
  },
  {
    name: "mpv.net",
    url:
      "https://github.com/mpvnet-player/mpv.net/releases/download/v7.1.1.0/mpv.net-v7.1.1.0-portable.zip",
  },
  {
    name: "deno",
    url:
      "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-pc-windows-msvc.zip",
  },
];

async function updateBase() {
  for (const { name, url } of BaseList) {
    const bin = await downloadBinary(url);
    const xzName = name + ".tar.xz";
    const files = decode(Fmt.Zip, bin);
    if (!files) {
      console.log(`${name} decode zip error`);
      continue;
    }
    const xz = encode(Fmt.TarXz, files);
    if (!xz) {
      console.log(`${name} encode xz error`);
      continue;
    }
    writeFileSync(xzName, xz);
  }
}

const PlayWithList = [
  "mpv-easy-play-with-android",
  "mpv-easy-play-with-linux",
  "mpv-easy-play-with-macos-amd64",
  "mpv-easy-play-with-macos-arm64",
  "mpv-easy-play-with-windows.exe",
];
async function updatePlayWith() {
  for (const i of PlayWithList) {
    const name = i.replace(".exe", "") + ".zip";
    const url =
      `https://github.com/mpv-easy/mpv-easy/releases/latest/download/${i}`;
    const bin = await downloadBinary(url);
    const files = [new File(i, bin, null, false, now)];
    const zip = encode(Fmt.Zip, files);
    if (!zip) {
      console.log(`${name} encode zip error`);
      continue;
    }
    writeFileSync(name, zip);
  }
}

await updateYtdlp();
await updateFFmpeg();
await updateBase();
await updatePlayWith();
