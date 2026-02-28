export const formatCurrency = (value: number | string) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

export const parseCurrencyInput = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers === '') return '';
  return (Number(numbers) / 100).toFixed(2);
};