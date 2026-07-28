
CREATE OR REPLACE FUNCTION public.place_order(
  p_order_number text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_total numeric,
  p_items jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_stock jsonb;
  v_item jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items to order';
  END IF;

  -- Atomic stock check + decrement (all-or-nothing within this transaction)
  v_stock := public.check_and_decrement_stock(
    (SELECT jsonb_agg(jsonb_build_object('product_id', e->>'product_id', 'quantity', (e->>'quantity')::int))
     FROM jsonb_array_elements(p_items) e)
  );

  IF NOT (v_stock->>'ok')::boolean THEN
    -- Return shortages; no rows written, transaction still ok to rollback partial temp state
    RETURN jsonb_build_object('ok', false, 'shortages', v_stock->'shortages');
  END IF;

  INSERT INTO public.orders (
    order_number, user_id, customer_name, customer_email, customer_phone,
    shipping_address, total, status
  ) VALUES (
    p_order_number, v_user, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_total, 'pending'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_title, size, color, quantity, price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_title',
      COALESCE(v_item->>'size', ''),
      COALESCE(v_item->>'color', ''),
      (v_item->>'quantity')::int,
      (v_item->>'price')::numeric
    );
  END LOOP;

  -- Clear the user's cart in the same transaction
  DELETE FROM public.cart_items WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'order_number', p_order_number
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, numeric, jsonb) TO authenticated;
