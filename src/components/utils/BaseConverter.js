import { bignumber } from "mathjs";

export class BaseConverter {
  static convertBase(value, fromBase, toBase) {
    const decValue = bignumber(value, fromBase);
    return decValue.toString(toBase);
  }
}
