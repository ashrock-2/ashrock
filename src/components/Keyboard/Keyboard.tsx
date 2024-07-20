import { useRef, type MutableRefObject } from "react";
import { Fragment } from "react/jsx-runtime";

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const totalKeys = 88;
const startOctave = 0;
const endOctave = 7;
const SUSTAIN = 1;

export const Keyboard = () => {
  const currentOscillator = useRef<OscillatorNode | null>(null);

  return (
    <div className="grid grid-cols-12">
      {new Array(endOctave + 1).fill(null).map((_, octave) => (
        <Fragment key={octave}>
          {notes.map((note) => (
            <Key
              key={`${note}${octave}`}
              note={note}
              octave={octave}
              isBlack={note.includes("#")}
              currentOscillator={currentOscillator}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
};

interface KeyProps {
  note: string;
  octave: number;
  isBlack: boolean;
  currentOscillator: MutableRefObject<OscillatorNode | null>;
}

const audioCtx = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

const createOscillator = (note: string, octave: number) => {
  const frequency =
    440 * Math.pow(2, (notes.indexOf(note) + (octave - 4) * 12) / 12);
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  return oscillator;
};

const playNote = (
  note: string,
  octave: number,
  currentOscillator: MutableRefObject<OscillatorNode | null>,
) => {
  if (currentOscillator.current) {
    currentOscillator.current.stop();
  }
  const oscillator = createOscillator(note, octave);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + SUSTAIN);
  currentOscillator.current = oscillator;
};

const Key = ({ note, octave, isBlack, currentOscillator }: KeyProps) => {
  const handleClick = () => playNote(note, octave, currentOscillator);

  return (
    <div
      className={`${isBlack ? "bg-black" : "bg-white"} ${isBlack ? "text-white" : "text-black"} w-[30px] h-[150px] m-[2px] box-border cursor-pointer border border-black border-solid flex justify-center items-center`}
      onClick={handleClick}
    >
      {note}
      {octave}
    </div>
  );
};
