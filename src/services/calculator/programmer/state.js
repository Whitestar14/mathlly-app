export class ProgrammerState {
  constructor() {
    this.states = {
      DEC: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
      HEX: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
    };
    this.activeBase = "DEC";
    this.error = "";
  }

  getState(base = this.activeBase) {
    return this.states[base];
  }

  setState(base, value) {
    this.states[base] = { ...value };
  }

  updateAllStates(values) {
    Object.keys(this.states).forEach(base => {
      this.states[base] = { ...values[base] };
    });
  }

  setActiveBase(base) {
    if (this.states[base]) {
      this.activeBase = base;
    }
  }

  clear() {
    Object.keys(this.states).forEach(base => {
      this.states[base] = { input: "0", display: "0" };
    });
    this.error = "";
  }
}
