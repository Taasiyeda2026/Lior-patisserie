-- seed-content.sql — initial content for Lior's Pâtisserie (Supabase / Postgres)
--
-- Gallery was removed from the site and admin. No seed data is inserted for gallery_images.
--
-- Safe to run on a project that already has edits:
--   * site_settings: INSERT ... ON CONFLICT (key) DO NOTHING (never overwrites values).
--   * products, site_features: each row is inserted only if no row exists with the
--     same natural key (name / title). No DELETE.
--
-- Optional (not applied here): add UNIQUE constraints for stricter idempotent upserts, e.g.
--   ALTER TABLE public.products ADD CONSTRAINT products_name_unique UNIQUE (name);
-- Only add such constraints if you are sure there will never be duplicate display names.

-- ── site_settings (keys used by the public site + admin) ───────────────────

insert into public.site_settings (key, value, updated_at) values
  ('hero_image', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/hero/A7405559-hero.png', now()),
  ('hero_logo_image', 'assets/logo.png', now()),
  ('hero_scroll_button_text', 'גללו מטה', now()),
  ('flavors_title', 'הטעמים שלנו', now()),
  ('flavors_intro_primary', E'אצל Lior''s Pâtisserie כל עוגיית Crumble נאפית בעבודת יד,\nעם בצק עשיר, מילוי מפנק ונראות מוקפדת.', now()),
  ('flavors_intro_secondary', E'קולקציה עשירה ובלתי נשכחת,\nשלכל טעם בה יש אופי, מרקם וחוויה משלו.', now()),
  ('flavors_badge_text', 'כשר למהדרין', now()),
  ('flavors_order_button_text', 'להזמנה', now()),
  ('handmade_label', '- עבודת יד -', now()),
  ('handmade_title', 'הפרטים הקטנים שעושים את ההבדל', now()),
  ('handmade_text', E'מהבצק ועד הקרם, מהקישוט ועד האריזה - כל פרט נבחר כדי ליצור קינוח שנראה חגיגי, מרגיש אישי ובעיקר עושה חשק.', now()),
  ('contact_label', '- בואו נדבר -', now()),
  ('contact_title', 'רוצים להזמין טעם שאהבתם?', now()),
  ('contact_text', 'ספרו לליאור איזה טעם אהבתם ונמשיך משם בצורה פשוטה ונעימה.', now()),
  ('contact_email', 'liornahum1911@gmail.com', now()),
  ('whatsapp_number', '972506422900', now()),
  ('order_button_text', 'שליחת הזמנה', now()),
  ('contact_signature_text', 'באהבה, ליאור', now()),
  ('instagram_sentence_text', 'לעוד רגעים מתוקים, טעמים חדשים והצצות מהמטבח - מוזמנים להמשיך איתנו', now()),
  ('instagram_link_text', 'באינסטגרם', now()),
  ('instagram_url', 'https://www.instagram.com/_liornahum_/', now())
on conflict (key) do nothing;

-- ── products (one insert per name, only if missing) ─────────────────────────

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'אוראו דרים', 'עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404929.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404929.jpg', true, 0
where not exists (select 1 from public.products p where p.name = 'אוראו דרים');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'כריות נוגט', 'עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404958.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404958.jpg', true, 1
where not exists (select 1 from public.products p where p.name = 'כריות נוגט');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קוקילוטוס', 'עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404990.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404990.jpg', true, 2
where not exists (select 1 from public.products p where p.name = 'קוקילוטוס');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'פיסטצ׳יו', 'עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404980.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404980.jpg', true, 3
where not exists (select 1 from public.products p where p.name = 'פיסטצ׳יו');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'במבה רד', 'עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7405005.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7405005.jpg', true, 4
where not exists (select 1 from public.products p where p.name = 'במבה רד');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קונפטי פאן', 'עוגייה צבעונית ושמחה עם סוכריות צבעוניות, שוקולד לבן וקרם ורוד.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404978.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404978.jpg', true, 5
where not exists (select 1 from public.products p where p.name = 'קונפטי פאן');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'ס׳מורשמלו', 'עוגיית קקאו עשירה עם שוקולד מריר, קרם אגוזי לוז ומרשמלו שרוף מעל.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404945.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404945.jpg', true, 6
where not exists (select 1 from public.products p where p.name = 'ס׳מורשמלו');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קינדר', 'עוגייה עשירה עם שוקולד חלב, מילוי קרם קינדר בואנו ופניני שוקולד קראנץ׳.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404950.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404950.jpg', true, 7
where not exists (select 1 from public.products p where p.name = 'קינדר');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קורנפלקס שוקולד לבן', 'עוגייה עשירה עם קורנפלקס, שוקולד לבן, קרם שוקולד לבן וקראנץ׳ מפנק.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404939.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404939.jpg', true, 8
where not exists (select 1 from public.products p where p.name = 'קורנפלקס שוקולד לבן');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קורנפלקס שוקולד חלב', 'עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404956.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404956.jpg', true, 9
where not exists (select 1 from public.products p where p.name = 'קורנפלקס שוקולד חלב');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'אמסטרדם', 'עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404918.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404918.jpg', true, 10
where not exists (select 1 from public.products p where p.name = 'אמסטרדם');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'שוקוצ׳יפס', 'עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404900.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404900.jpg', true, 11
where not exists (select 1 from public.products p where p.name = 'שוקוצ׳יפס');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'חצי־חצי', 'חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404971.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404971.jpg', true, 12
where not exists (select 1 from public.products p where p.name = 'חצי־חצי');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'ברוקי', 'בראוניז שוקולד עשיר עם חתיכות בצק עוגיות, קרם שוקולד וזילוף אגוזי לוז.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404968.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404968.jpg', true, 13
where not exists (select 1 from public.products p where p.name = 'ברוקי');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'שוקולד דובאי', 'עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404987.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404987.jpg', true, 14
where not exists (select 1 from public.products p where p.name = 'שוקולד דובאי');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'מגולגלת קינדר', 'עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404964.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404964.jpg', true, 15
where not exists (select 1 from public.products p where p.name = 'מגולגלת קינדר');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'פתיבר', 'עוגייה עשירה עם שוקולד חלב, מילוי קרם פתיבר, עוגיית פתיבר וסוכריות צבעוניות.', null,
  'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/A7404912.jpg', 'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/A7404912.jpg', true, 16
where not exists (select 1 from public.products p where p.name = 'פתיבר');

-- ── site_features ───────────────────────────────────────────────────────────

insert into public.site_features (title, text, image_url, is_active, display_order)
select 'עבודת יד',
  'כל עוגייה נאפית ומעוצבת בעבודת יד, עם טאץ׳ אישי ומוקפד.',
  '', true, 0
where not exists (select 1 from public.site_features f where f.title = 'עבודת יד');

insert into public.site_features (title, text, image_url, is_active, display_order)
select 'טעמים עשירים',
  'קרמים ושוקולדים מפנקים משתלבים לביס עשיר, רך ומלא אופי.',
  '', true, 1
where not exists (select 1 from public.site_features f where f.title = 'טעמים עשירים');

insert into public.site_features (title, text, image_url, is_active, display_order)
select 'חגיגי ומפנק',
  'נראות חגיגית מוקפדת שמתאימת לאירוח, מתנה או פינוק אישי.',
  '', true, 2
where not exists (select 1 from public.site_features f where f.title = 'חגיגי ומפנק');

