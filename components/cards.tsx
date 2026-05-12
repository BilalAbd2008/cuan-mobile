import Image from "next/image";
import { ArrowDownLeft, ArrowUpRight, PencilLine, Trash2 } from "lucide-react";

export function TransactionCard({
  title,
  detail,
  secondary,
  amount,
  type
}: {
  title: string;
  detail: string;
  secondary?: string;
  amount: string;
  type: "income" | "expense";
}) {
  return (
    <article className="ledger-card">
      <span className={`round-status ${type}`}>
        {type === "income" ? <ArrowUpRight /> : <ArrowDownLeft />}
      </span>
      <div className="ledger-card-body">
        <strong>{title}</strong>
        {secondary ? <p className="ledger-secondary">{secondary}</p> : null}
        {detail ? <p className={secondary ? "ledger-muted" : "ledger-secondary"}>{detail}</p> : null}
      </div>
      <b className={`ledger-amount ${type}`}>{amount}</b>
    </article>
  );
}

export function ProductCard({
  title,
  hpp,
  price,
  margin,
  image,
  onEdit,
  onDelete
}: {
  title: string;
  hpp: string;
  price: string;
  margin: string;
  image: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className={`product-card ${onEdit || onDelete ? "product-card-rich" : "product-card-plain"}`}>
      <Image alt={title} height={124} src={image} width={124} />
      <div className="product-card-main">
        <strong>{title}</strong>
        <p className="product-hpp-line">HPP: {hpp}</p>
        <div className="product-price">
          <b>{price}</b>
          {margin ? <span>{margin}</span> : null}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <aside className="product-card-actions">
          {onEdit ? (
            <button aria-label="Edit produk" className="icon-slate-btn ghost" onClick={onEdit} type="button">
              <PencilLine size={18} />
            </button>
          ) : null}
          {onDelete ? (
            <button aria-label="Hapus produk" className="icon-slate-btn ghost" onClick={onDelete} type="button">
              <Trash2 size={18} />
            </button>
          ) : null}
        </aside>
      )}
    </article>
  );
}
