import { useMemo } from "react";
import MemberConnectionBadge from "./MemberConnectionBadge";

type ProductPriceBadgeProps = {
  priceDisplay?: string;
  priceValue?: number;
  currency?: string;
};

const DEFAULT_CURRENCY = "USD";

const formatPrice = (
  priceValue: number | undefined,
  priceDisplay: string | undefined,
  currency: string
): string => {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "symbol",
      }).format(priceValue);
    } catch {
      return `${currency.toUpperCase()} ${priceValue.toFixed(2)}`;
    }
  }

  const trimmedDisplay = (priceDisplay ?? "").trim();
  if (!trimmedDisplay) {
    return currency.toUpperCase();
  }

  const hasCurrencyNotation =
    /^[^\d\s]/.test(trimmedDisplay) ||
    /\b[A-Z]{3}\b/.test(trimmedDisplay.toUpperCase());

  if (hasCurrencyNotation) {
    return trimmedDisplay;
  }

  return `${currency.toUpperCase()} ${trimmedDisplay}`;
};

const ProductPriceBadge = ({
  priceDisplay,
  priceValue,
  currency = DEFAULT_CURRENCY,
}: ProductPriceBadgeProps) => {
  const label = useMemo(
    () => formatPrice(priceValue, priceDisplay, currency),
    [currency, priceDisplay, priceValue]
  );

  return (
    <MemberConnectionBadge
      label={label}
      badgeClassName="border-brand/40 bg-brand/10 text-brand"
    />
  );
};

export default ProductPriceBadge;
