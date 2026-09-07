import { writeFileSync } from "fs";
import { encode, File, Fmt } from "@easy-install/easy-archive";
import {
  downloadBinaryFromGithub,
  getScriptFiles,
  type Script,
  tryFix,
} from "@mpv-easy/mpsm";

// zip package size in bytes, filled in after a successful pack
const DATA: Record<string, Script> = JSON.parse(
  await fetch(
    "https://raw.githubusercontent.com/mpv-easy/mpsm-scripts/main/scripts-full.json",
  ).then((i) => i.text()),
);

// GITHUB limit 50MB
const MAX_ZIP_SIZE = 50 * 1024 * 1024;

function formatSize(size: number) {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
  return `${(size / (1024 * 1024)).toFixed(2)}MB`;
}

for (const name in DATA) {
  const script = DATA[name];
  const { download } = script;
  const zipName = name + ".zip";

  if (![".js", ".lua", ".zip", ".conf"].some((i) => download.endsWith(i))) {
    continue;
  }

  try {
    const scriptFiles = await getScriptFiles(download, script);
    if (!scriptFiles.length) {
      continue;
    }
    const confURL = download.split(".").slice(0, -1).join(".") + ".conf";
    try {
      // detect conf
      const buffer = await downloadBinaryFromGithub(confURL);
      if (buffer) {
        const confName = confURL.split("/").at(-1)!;
        const file = new File(
          confName,
          new Uint8Array(buffer),
          undefined,
          false,
          BigInt(+new Date()),
        );
        scriptFiles.push(file);
      }
    } catch {
      console.log("not found conf: ", confURL, script);
    }

    const fixFiles = tryFix(scriptFiles, script);

    const bin = encode(Fmt.Zip, fixFiles);
    if (!bin) {
      console.log("encode error");
      continue;
    }

    script.size = bin.length;

    if (bin.length > MAX_ZIP_SIZE) {
      console.log("too big", bin.length, script);
      continue;
    }
    writeFileSync(zipName, bin);

    // download & pack succeed, write the zip size back to scripts-full.json
    console.log("ok", zipName, formatSize(script.size));
  } catch (e) {
    console.log(script, e);
  }
}

writeFileSync("scripts-full.json", JSON.stringify(DATA));
