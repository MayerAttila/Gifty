import React from "react";

type ProductPriceBadgeProps = {
  priceDisplay: string;
};

const ProductPriceBadge = ({ priceDisplay }: ProductPriceBadgeProps) => {
  return (
    <div>
      <span
        className={`rounded-full border px-3 py-1 border-brand/40 bg-brand/10 text-brand`}
      >
        {priceDisplay}
      </span>
    </div>
  );
};

export default ProductPriceBadge;
