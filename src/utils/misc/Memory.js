import { evaluate, bignumber } from "mathjs";

export class Memory {
  constructor() {
    this.memory = 0;
  }

  clear() {
    this.memory = 0;
    return this.memory;
  }

  recall() {
    return this.memory;
  }

  add(value) {
    try {
      this.memory = evaluate(`${this.memory} + ${value}`);
      return true;
    } catch {
      return false;
    }
  }

  subtract(value) {
    try {
      this.memory = evaluate(`${this.memory} - ${value}`);
      return true;
    } catch {
      return false;
    }
  }

  store(value) {
    try {
      this.memory = bignumber(value);
      return true;
    } catch {
      return false;
    }
  }
}
