import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div>
      shoping cart icon
      {quantity ? <div>{quantity}</div> : null}
    </div>
  );
}
