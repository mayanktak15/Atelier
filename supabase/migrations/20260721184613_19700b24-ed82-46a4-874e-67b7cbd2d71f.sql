
-- Atomic stock check + decrement for checkout.
-- Input: jsonb array of { product_id: uuid, quantity: int }
-- Returns: { ok: boolean, shortages: [{ product_id, title, requested, available }] }
CREATE OR REPLACE FUNCTION public.check_and_decrement_stock(items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agg RECORD;
  shortages jsonb := '[]'::jsonb;
BEGIN
  IF items IS NULL OR jsonb_array_length(items) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'shortages', shortages);
  END IF;

  -- Aggregate requested quantities by product and lock the product rows
  CREATE TEMP TABLE _req ON COMMIT DROP AS
  SELECT (e->>'product_id')::uuid AS product_id,
         SUM((e->>'quantity')::int) AS qty
  FROM jsonb_array_elements(items) e
  GROUP BY 1;

  -- Lock rows in a stable order to avoid deadlocks
  PERFORM 1 FROM public.products p
    WHERE p.id IN (SELECT product_id FROM _req)
    ORDER BY p.id
    FOR UPDATE;

  -- Collect shortages
  FOR agg IN
    SELECT r.product_id, r.qty AS requested, COALESCE(p.stock, 0) AS available, p.title
    FROM _req r
    LEFT JOIN public.products p ON p.id = r.product_id
    WHERE p.id IS NULL OR p.stock < r.qty
  LOOP
    shortages := shortages || jsonb_build_object(
      'product_id', agg.product_id,
      'title', COALESCE(agg.title, 'Unknown product'),
      'requested', agg.requested,
      'available', agg.available
    );
  END LOOP;

  IF jsonb_array_length(shortages) > 0 THEN
    RETURN jsonb_build_object('ok', false, 'shortages', shortages);
  END IF;

  -- All good: decrement
  UPDATE public.products p
  SET stock = p.stock - r.qty
  FROM _req r
  WHERE p.id = r.product_id;

  RETURN jsonb_build_object('ok', true, 'shortages', shortages);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_decrement_stock(jsonb) TO authenticated;

-- Trigger: when an order transitions to 'cancelled', restore stock for its items (once).
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND COALESCE(OLD.status, '') <> 'cancelled' THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restore_stock_on_cancel ON public.orders;
CREATE TRIGGER trg_restore_stock_on_cancel
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.restore_stock_on_cancel();
