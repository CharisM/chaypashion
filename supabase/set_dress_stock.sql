-- Set stock to 1 for all dress products (IDs 1-8)
INSERT INTO public.stock (product_id, quantity)
VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (4, 1),
  (5, 1),
  (6, 1),
  (7, 1),
  (8, 1)
ON CONFLICT (product_id)
DO UPDATE SET quantity = 1;
