insert into public.products (id, name, price, image, stock)
values
  (1, 'Classic Floral Dress', 899, '/D1.jpg', 10),
  (2, 'Elegant Wrap Dress', 1099, '/D2.jpg', 10),
  (3, 'Boho Maxi Dress', 1199, '/D3.jpg', 10),
  (4, 'Mini Sundress', 799, '/D4.jpg', 10),
  (5, 'Ruffle Hem Dress', 949, '/D5.jpg', 10),
  (6, 'Off-Shoulder Dress', 1049, '/D6.jpg', 10),
  (7, 'Flowy Chiffon Dress', 1149, '/D7.jpg', 10),
  (8, 'Bodycon Midi Dress', 1299, '/D8.jpg', 10),
  (11, 'Fossil Townsman Watch', 4999, '/WD1.jpg', 10),
  (15, 'Fossil Neutra Watch', 3499, '/W1.jpg', 10),
  (17, 'Fossil Carlie Watch', 5999, '/W3.jpg', 10),
  (22, 'Coach Bracelet Watch', 5299, '/W8.jpg', 10),
  (25, 'Herborist Body Scrub', 699, '/SCRUB1.jpg', 10),
  (28, 'Hair Oil', 599, '/oil.jpg', 10),
  (29, 'Gluta Soap', 299, '/glutasoap.jpg', 10),
  (30, 'Fossil Water Resistant Watch', 5999, '/FWW1.jpg', 10)
on conflict (id) do update
set
  name = excluded.name,
  price = excluded.price,
  image = excluded.image,
  stock = excluded.stock;
