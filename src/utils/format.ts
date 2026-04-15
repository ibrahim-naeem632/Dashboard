export const formatCurrency = (num: number) => {
  return "$" + num.toLocaleString();
};

export const formatChange = (num: number) => {
  return `${num > 0 ? "+" : ""}${num}%`;
};