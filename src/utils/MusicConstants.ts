export type Note =
  | "A"
  | "A#"
  | "B"
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#";
export const notes: Note[] = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
];
export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Scale = "Major" | "Minor";
const majorScale = [0, 2, 4, 5, 7, 9, 11, 12];
const minorScale = [0, 2, 3, 5, 7, 8, 10, 12];
export const ScaleMap: Record<Scale, number[]> = {
  Major: majorScale,
  Minor: minorScale,
};
