export const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return `${numberFormatter.format(Math.round(value))} 円/kg`;
}

export function formatSignedCurrency(value: number): string {
  if (value === 0) {
    return "0 円/kg";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${numberFormatter.format(Math.round(value))} 円/kg`;
}

export function formatIndicatorValue(value: number, unit: string): string {
  return `${decimalFormatter.format(value)} ${unit}`;
}
