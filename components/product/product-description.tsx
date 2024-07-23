import { AddToCart } from "@/components/cart/add-to-cart";
import Price from "@/components/price";
import { Product } from "@/lib/shopify/types";
import { Suspense } from "react";
import { VariantSelector } from "./variant-selector";
import Prose from "../prose";

export function ProductDescription({ product }: { product: Product }) {
  return (
    <>
      <div>
        <h1>{product.title}</h1>
        <div>
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>
      <Suspense fallback={null}>
        <VariantSelector
          options={product.options}
          variants={product.variants}
        />
      </Suspense>

      {product.descriptionHtml ? (
        <Prose html={product.descriptionHtml} />
      ) : null}

      <Suspense fallback={null}>
        <AddToCart
          variants={product.variants}
          availableForSale={product.availableForSale}
        />
      </Suspense>
    </>
  );
}
