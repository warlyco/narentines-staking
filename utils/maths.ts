import bigDecimal from "js-big-decimal";

export const add = (a: string | number, b: string | number): number => {
  return Number(bigDecimal.add(Number(a), Number(b)));
};

export const subtract = (a: string | number, b: string | number) => {
  return Number(bigDecimal.subtract(Number(a), Number(b)));
};

export const multiply = (a: string | number, b: string | number) => {
  return Number(bigDecimal.multiply(Number(a), Number(b)));
};

const Maths = {
  add,
  subtract,
  multiply,
};

export default Maths;
