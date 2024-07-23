"use client";

import Price from "@/components/price";
import { DEFAULT_OPTION } from "@/lib/constants";
import type { Cart } from "@/lib/shopify/types";
import { createUrl } from "@/lib/utils";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import CloseCart from "./close-cart";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal({ cart }: { cart: Cart | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    // Open cart modal when quantity changes.
    if (cart?.totalQuantity !== quantityRef.current) {
      // But only if it's not already open (quantity also changes when editing items in cart).
      if (!isOpen) {
        setIsOpen(true);
      }

      // Always update the quantity reference
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity, quantityRef]);

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} />
      </button>
      <div style={{ display: isOpen ? "block" : "none" }}>
        <div>
          <p>My Cart</p>

          <button aria-label="Close cart" onClick={closeCart}>
            close cart
          </button>
        </div>

        {!cart || cart.lines.length === 0 ? (
          <div>
            shoping cart icon
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div>
            <ul>
              {cart.lines.map((item, i) => {
                const merchandiseSearchParams = {} as MerchandiseSearchParams;

                item.merchandise.selectedOptions.forEach(({ name, value }) => {
                  if (value !== DEFAULT_OPTION) {
                    merchandiseSearchParams[name.toLowerCase()] = value;
                  }
                });

                const merchandiseUrl = createUrl(
                  `/product/${item.merchandise.product.handle}`,
                  new URLSearchParams(merchandiseSearchParams)
                );

                return (
                  <li key={i}>
                    <div>
                      <div>
                        <DeleteItemButton item={item} />
                      </div>
                      <Link href={merchandiseUrl} onClick={closeCart}>
                        <div>
                          <img
                            width={64}
                            height={64}
                            alt={
                              item.merchandise.product.featuredImage.altText ||
                              item.merchandise.product.title
                            }
                            src={item.merchandise.product.featuredImage.url}
                          />
                        </div>

                        <div>
                          <span>{item.merchandise.product.title}</span>
                          {item.merchandise.title !== DEFAULT_OPTION ? (
                            <p>{item.merchandise.title}</p>
                          ) : null}
                        </div>
                        <div>
                          {JSON.stringify(item.merchandise.selectedOptions)}
                        </div>
                      </Link>
                      <div>
                        <Price
                          amount={item.cost.totalAmount.amount}
                          currencyCode={item.cost.totalAmount.currencyCode}
                        />
                        <div>
                          <EditItemQuantityButton item={item} type="minus" />
                          <p>
                            <span>{item.quantity}</span>
                          </p>
                          <EditItemQuantityButton item={item} type="plus" />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div>
              <div>
                <p>Taxes</p>
                <Price
                  amount={cart.cost.totalTaxAmount.amount}
                  currencyCode={cart.cost.totalTaxAmount.currencyCode}
                />
              </div>
              <div>
                <p>Shipping</p>
                <p>Calculated at checkout</p>
              </div>
              <div>
                <p>Total</p>
                <Price
                  amount={cart.cost.totalAmount.amount}
                  currencyCode={cart.cost.totalAmount.currencyCode}
                />
              </div>
            </div>
            <a href={cart.checkoutUrl}>Proceed to Checkout</a>
          </div>
        )}
      </div>
    </>
  );
}
