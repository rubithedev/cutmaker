// Types
type ParsedSubtitles = Map<
  number,
  {
    start: string;
    end: string;
    text: string;
  }
>;

class FileIterator {
  private lines: string[] = [];
  private currentLine: string = "";
  private currentLineNumber: number = -1;

  constructor(fileContent: string) {
    this.lines = fileContent.split("\n");
  }

  nextLine(): string {
    do {
      if (this.currentLineNumber >= this.lines.length) {
        return "EOF";
      }

      this.currentLineNumber++;
      this.currentLine = this.lines[this.currentLineNumber]!;
    } while (!this.currentLine);

    return this.currentLine;
  }

  getCurrrentLine(): string {
    return this.currentLine;
  }
}

// Implementation.
export function loadSRTSubtitle(path: string) {
  if (!path.endsWith(".srt")) {
    throw new Error("File is not a valid srt.");
  }
  return Bun.file(path);
}

export async function parseSRTSubtitleFile(file: Bun.BunFile) {
  const text = await file.text();
  const lines = new FileIterator(text);

  const parsedEntry: ParsedSubtitles = new Map();

  let currentIndex = 0;
  while (lines.nextLine() != "EOF") {
    const line = lines.getCurrrentLine();

    const indexLine = parseInt(line);
    if (indexLine && !parsedEntry.has(indexLine)) {
      parsedEntry.set(indexLine, {
        text: "",
        start: "",
        end: "",
      });

      currentIndex = indexLine;
      continue;
    }

    if (line.includes("-->")) {
      const split = line.split(" ");
      parsedEntry.get(currentIndex)!.start = split[0]!;
      parsedEntry.get(currentIndex)!.end = split[2]!;

      continue;
    }

    const text = parsedEntry.get(currentIndex)!.text + ` ${line}`;
    parsedEntry.get(currentIndex)!.text = text.trim();
  }

  return parsedEntry;
}
