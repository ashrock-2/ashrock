import { match, P } from "ts-pattern";
import { stateStore } from "@src/components/Keyboard/StateStore";
import { audioContextStore } from "@src/components/Keyboard/AudioContextStore";
import {
  notes,
  ScaleMap,
  type Note,
  type Octave,
} from "@src/utils/MusicConstants";

const keys = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyH", "KeyJ", "KeyK", "KeyL"];
type CurrentNote = `${Note}${Octave}`;

class Keyboard extends HTMLElement {
  private currentNotes: CurrentNote[] = [];

  constructor() {
    super();
    this.updateCurrentNotes();

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
    stateStore.addEventListener(
      "stateChange",
      this.updateCurrentNotes.bind(this),
    );
  }

  private playNode = (freq: number) => {
    const audioNode = new OscillatorNode(audioContextStore.audioContext, {
      type: "sine",
      frequency: freq,
    });
    audioContextStore.audioSourceNodes.set(freq, audioNode);
    audioNode.connect(audioContextStore.masterGainNode);
    audioNode.start(0);
  };
  private stopNode = (freq: number) => {
    audioContextStore.audioSourceNodes.get(freq)?.stop(0);
    audioContextStore.audioSourceNodes.delete(freq);
  };
  private updateCurrentNotes = () => {
    const keyNoteIdx = notes.findIndex((note) => note === stateStore.keyNote);
    let currentOctave = stateStore.octave;
    let previousNoteIdx = keyNoteIdx;

    this.currentNotes = ScaleMap[stateStore.scale].map((stair, idx) => {
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
