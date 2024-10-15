import { match, P } from "ts-pattern";
import { stateStore } from "@src/components/Keyboard/StateStore";
import { audioContextStore } from "@src/components/Keyboard/AudioContextStore";
import {
  notes,
  ScaleMap,
  type Note,
  type Octave,
} from "@src/utils/MusicConstants";
import * as Tone from 'tone';
function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function scheduleRandomRepeat(scheduledFunction, minDelay, maxDelay, startTime = getRandomBetween(minDelay, maxDelay)) {
  console.log('invoked')
  console.log(Tone.getTransport();
  Tone.getTransport().scheduleOnce((time) => {
    scheduledFunction(time);
    const delay = getRandomBetween(minDelay, maxDelay);
    scheduleRandomRepeat(scheduledFunction, minDelay, maxDelay, time + delay);
  }, startTime);
}

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
        this.playNode(target.ariaLabel as Note);
      });
      button.addEventListener("pointerup", (event) => {
        const target = event.target as HTMLButtonElement;
        target.classList.remove("active");
        this.stopNode(target.ariaLabel as Note);
      });
      button.addEventListener("pointerleave", (event) => {
        const target = event.target as HTMLButtonElement;
        target.classList.remove("active");
        this.stopNode(target.ariaLabel as Note);
      });
    });
    window.addEventListener("keydown", (event) => {
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('F4', time);
      }, 0, 5);
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('Ab4', time);
      }, 0, 5);
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('C5', time);
      }, 0, 5);
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('Db5', time);
      }, 0, 5);
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('Eb5', time);
      }, 0, 5);
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('F5', time);
      }, 0, 5);
      scheduleRandomRepeat((time) => {
        audioContextStore.audioSourceNode.triggerAttack('Ab5', time);
      }, 0, 5);
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
            this.playNode(button.ariaLabel as Note);
          },
        )
        .otherwise(() => { });
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
            this.stopNode(button.ariaLabel as Note);
          },
        )
        .otherwise(() => { });
    });
    stateStore.addEventListener(
      "stateChange",
      this.updateCurrentNotes.bind(this),
    );
  }

  private playNode = (note: Note) => {
    audioContextStore.audioSourceNode.triggerAttackRelease(note, "8n");
    // audioContextStore.audioSourceNode.triggerAttack(note);
  };
  private stopNode = (note: Note) => {
    // audioContextStore.audioSourceNode.triggerRelease();
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
