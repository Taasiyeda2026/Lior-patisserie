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
  ('hero_image', 'A7405559-hero.png', now()),
  ('hero_logo_image', 'assets/logo.png', now()),
  ('hero_scroll_button_text', 'גללו מטה', now()),
  ('flavors_title', 'הטעמים שלנו', now()),
  ('flavors_intro_primary', E'ב־Lior''s Pâtisserie כל עוגיית Crumble נאפית בעבודת יד,\nעם בצק עשיר, מילויים מפנקים ונראות מוקפדת.', now()),
  ('flavors_intro_secondary', E'קולקציה עשירה ובלתי נשכחת -\nלכל עוגייה יש אופי, מרקם וחוויה משלה.', now()),
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
  ('order_button_text', 'דברו עם ליאור', now()),
  ('contact_signature_text', 'באהבה, ליאור', now()),
  ('instagram_sentence_text', 'לעוד רגעים מתוקים, טעמים חדשים והצצות מהמטבח - מוזמנים להמשיך איתנו', now()),
  ('instagram_link_text', 'באינסטגרם', now()),
  ('instagram_url', 'https://www.instagram.com/_liornahum_/', now())
on conflict (key) do nothing;

-- ── products (one insert per name, only if missing) ─────────────────────────

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'אוראו דרים', 'עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל.', null,
  'A7404929.JPG', 'cards/A7404929.webp', true, 0
where not exists (select 1 from public.products p where p.name = 'אוראו דרים');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'כריות נוגט', 'עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן.', null,
  'A7404958.JPG', 'cards/A7404958.webp', true, 1
where not exists (select 1 from public.products p where p.name = 'כריות נוגט');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קוקילוטוס', 'עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל.', null,
  'A7404990.jpg', 'cards/A7404990.webp', true, 2
where not exists (select 1 from public.products p where p.name = 'קוקילוטוס');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'פיסטצ׳יו', 'עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס.', null,
  'A7404980.jpg', 'cards/A7404980.webp', true, 3
where not exists (select 1 from public.products p where p.name = 'פיסטצ׳יו');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'במבה רד', 'עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה.', null,
  'A7405005.jpg', 'cards/A7405005.webp', true, 4
where not exists (select 1 from public.products p where p.name = 'במבה רד');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קונפטי פאן', 'עוגייה צבעונית ושמחה עם סוכריות צבעוניות, שוקולד לבן וקרם ורוד.', null,
  'A7404978.JPG', 'cards/A7404978.webp', true, 5
where not exists (select 1 from public.products p where p.name = 'קונפטי פאן');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'ס׳מורשמלו', 'עוגיית קקאו עשירה עם שוקולד מריר, קרם אגוזי לוז ומרשמלו שרוף מעל.', null,
  'A7404945.JPG', 'cards/A7404945.webp', true, 6
where not exists (select 1 from public.products p where p.name = 'ס׳מורשמלו');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קינדר', 'עוגייה עשירה עם שוקולד חלב, מילוי קרם קינדר בואנו ופניני שוקולד קראנץ׳.', null,
  'A7404950.jpg', 'cards/A7404950.webp', true, 7
where not exists (select 1 from public.products p where p.name = 'קינדר');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קורנפלקס שוקולד לבן', 'עוגייה עשירה עם קורנפלקס, שוקולד לבן, קרם שוקולד לבן וקראנץ׳ מפנק.', null,
  'A7404939.JPG', 'cards/A7404939.webp', true, 8
where not exists (select 1 from public.products p where p.name = 'קורנפלקס שוקולד לבן');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'קורנפלקס שוקולד חלב', 'עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי.', null,
  'A7404956.jpg', 'cards/A7404956.webp', true, 9
where not exists (select 1 from public.products p where p.name = 'קורנפלקס שוקולד חלב');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'אמסטרדם', 'עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן.', null,
  'A7404918.jpg', 'cards/A7404918.webp', true, 10
where not exists (select 1 from public.products p where p.name = 'אמסטרדם');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'שוקוצ׳יפס', 'עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד.', null,
  'A7404900.jpg', 'cards/A7404900.webp', true, 11
where not exists (select 1 from public.products p where p.name = 'שוקוצ׳יפס');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'חצי־חצי', 'חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים.', null,
  'A7404971.jpg', 'cards/A7404971.webp', true, 12
where not exists (select 1 from public.products p where p.name = 'חצי־חצי');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'ברוקי', 'בראוניז שוקולד עשיר עם חתיכות בצק עוגיות, קרם שוקולד וזילוף אגוזי לוז.', null,
  'A7404968.jpg', 'cards/A7404968.webp', true, 13
where not exists (select 1 from public.products p where p.name = 'ברוקי');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'שוקולד דובאי', 'עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף.', null,
  'A7404987.JPG', 'cards/A7404987.webp', true, 14
where not exists (select 1 from public.products p where p.name = 'שוקולד דובאי');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'מגולגלת קינדר', 'עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל.', null,
  'A7404964.JPG', 'cards/A7404964.webp', true, 15
where not exists (select 1 from public.products p where p.name = 'מגולגלת קינדר');

insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order)
select 'פתיבר', 'עוגייה עשירה עם שוקולד חלב, מילוי קרם פתיבר, עוגיית פתיבר וסוכריות צבעוניות.', null,
  'A7404912.JPG', 'cards/A7404912.webp', true, 16
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

