import Cart from "@/components/cart";
import OpenCart from "@/components/cart/open-cart";
import { ProductDescription } from "@/components/product/product-description";
import { getCollectionProducts, getCollections } from "@/lib/shopify";
import React, { Suspense } from "react";
import ShopifyButton from "./ShopifyButton";

const Page = async () => {
  const collections = await getCollections();
  const products = await getCollectionProducts({
    collection: "frontpage",
  });
  return (
    <>
      <p>{JSON.stringify(collections.map((collection) => collection.title))}</p>
      <p>{JSON.stringify(products.map((product) => product.title))}</p>
      {/* <ShopifyButton /> */}

      {products.map((product) => (
        <ProductDescription product={product} />
      ))}
      <Suspense fallback={<OpenCart />}>
        <Cart />
      </Suspense>
    </>
  );
};

export default Page;
