// composables/useInputValidation.js
export const useInputValidation = () => {
  const isValidForBase = (value, base) => {
    const pattern = {
      BIN: /^[0-1]$/,
      OCT: /^[0-7]$/,
      DEC: /^[0-9]$/,
      HEX: /^[0-9a-fA-F]$/,
    };
    const allowedKeys = [
      'AC',
      'backspace',
      '=',
      '+',
      '-',
      '×',
      '÷',
      '(',
      ')',
      '>>',
      '<<',
      '%',
      '±',
    ];
    return allowedKeys.includes(value) || pattern[base]?.test(value);
  };

  return { isValidForBase };
};
