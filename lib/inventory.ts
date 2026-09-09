// Keep stock operations in the same D1 batch as their order writes. The hosting
// migration runner cannot parse multi-statement SQLite trigger bodies.
export function reserveStock(db: D1Database, productId: string, size: string, quantity: number) {
  return db.prepare(`INSERT INTO inventory (product_id,size,quantity)
    VALUES (?,?,COALESCE((SELECT quantity FROM inventory WHERE product_id=? AND size=?),0)-?)
    ON CONFLICT(product_id,size) DO UPDATE SET quantity=excluded.quantity`)
    .bind(productId,size,productId,size,quantity);
}

// Operator-only helper; never expose this as an unauthenticated HTTP endpoint.
// Call only after reconciling the gateway and completing any necessary refund.
export async function cancelReconciledOrder(db: D1Database, orderCode: string) {
  await db.batch([
    db.prepare(`UPDATE inventory SET quantity=quantity+COALESCE((
      SELECT SUM(i.quantity) FROM order_items i JOIN orders o ON o.id=i.order_id
      WHERE o.order_code=? AND o.status<>'cancelled' AND o.is_demo=0
        AND o.request_hash IS NOT NULL AND i.product_id=inventory.product_id AND i.size=inventory.size
    ),0) WHERE EXISTS (
      SELECT 1 FROM order_items i JOIN orders o ON o.id=i.order_id
      WHERE o.order_code=? AND o.status<>'cancelled' AND o.is_demo=0
        AND o.request_hash IS NOT NULL AND i.product_id=inventory.product_id AND i.size=inventory.size
    )`).bind(orderCode,orderCode),
    db.prepare("UPDATE orders SET status='cancelled',updated_at=? WHERE order_code=? AND status<>'cancelled'")
      .bind(new Date().toISOString(),orderCode),
  ]);
}
