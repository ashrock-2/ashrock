import { match, P } from "ts-pattern";
import {
  notes,
  ScaleMap,
  type Note,
  type Octave,
  type Scale,
} from "../../utils/MusicConstants";

const keys = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyH", "KeyJ", "KeyK", "KeyL"];
type CurrentNote = `${Note}${Octave}`;

class Keyboard extends HTMLElement {
  private audioContext = new AudioContext();
  private audioSourceNodes: Map<number, OscillatorNode> = new Map();
  private masterGainNode: GainNode;
  /** 컴퓨터 키보드를 통한 연주시 참고할 속성. */
  private currentKeyNote: Note = "C";
  private currentScale: Scale = "Major";
  private currentOcatve: Octave = 4;
  private currentNotes: CurrentNote[] = [];

  constructor() {
    super();

    this.masterGainNode = new GainNode(this.audioContext);
    this.masterGainNode.connect(this.audioContext.destination);

    const buttons = this.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        const target = event.target as HTMLButtonElement;
        target.classList.add("active");
        const { freq } = target.dataset;
        this.playNode(Number(freq));
      });
      button.addEventListener("pointerup", (event) => {
        const target = event.target as HTMLButtonElement;
        target.classList.remove("active");
        const { freq } = target.dataset;
        this.stopNode(Number(freq));
      });
      button.addEventListener("pointerleave", (event) => {
        const target = event.target as HTMLButtonElement;
        target.classList.remove("active");
        const { freq } = target.dataset;
        this.stopNode(Number(freq));
      });
    });
    window.addEventListener("keydown", (event) => {
      if (event.repeat) {
        return;
      }
      this.updateCurrentNotes();

      match(event.code)
        .with(
          P.when((code) => keys.includes(code)),
          (code) => {
            const button = this.querySelector(
              `[aria-label="${this.currentNotes[keys.findIndex((key) => key === code)]}"]`,
            ) as HTMLButtonElement;
            button.classList.add("active");
            this.playNode(Number(button.dataset.freq));
          },
        )
        .otherwise(() => {});
    });
    window.addEventListener("keyup", (event) => {
      this.updateCurrentNotes();

      match(event.code)
        .with(
          P.when((code) => keys.includes(code)),
          (code) => {
            const button = this.querySelector(
              `[aria-label="${this.currentNotes[keys.findIndex((key) => key === code)]}"]`,
            ) as HTMLButtonElement;
            button.classList.remove("active");
            this.stopNode(Number(button.dataset.freq));
          },
        )
        .otherwise(() => {});
    });
  }

  private playNode = (freq: number) => {
    const audioNode = new OscillatorNode(this.audioContext, {
      type: "square",
      frequency: freq,
    });
    this.audioSourceNodes.set(freq, audioNode);
    audioNode.connect(this.masterGainNode);
    audioNode.start(0);
  };
  private stopNode = (freq: number) => {
    this.audioSourceNodes.get(freq)?.stop(0);
    this.audioSourceNodes.delete(freq);
  };
  private updateCurrentNotes = () => {
    const keyNoteIdx = notes.findIndex((note) => note === this.currentKeyNote);
    let currentOctave = this.currentOcatve;
    let previousNoteIdx = keyNoteIdx;

    this.currentNotes = ScaleMap[this.currentScale].map((stair, idx) => {
      const noteIdx = (keyNoteIdx + stair) % 12;
      const note = notes[noteIdx];

      /** 옥타브는 C를 기준으로함. C이거나 지나쳤다면 옥타브 상승. */
      if (
        idx !== 0 &&
        (note === "C" || (notes[previousNoteIdx] < "C" && note > "C"))
      ) {
        currentOctave += 1;
      }

      previousNoteIdx = noteIdx;

      return `${note}${currentOctave}` as CurrentNote;
    });
  };
}

customElements.define("key-board", Keyboard);
