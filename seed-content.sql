-- seed-content.sql — current content for Lior's Pâtisserie (Supabase / Postgres)
--
-- Gallery was removed from the site and admin. No seed data is inserted for gallery_images.
--
-- Safe to run on a project that already has edits:
--   * site_settings: INSERT ... ON CONFLICT (key) DO NOTHING (never overwrites values).
--   * site_features: each row is inserted only if no row exists with the same title.
--   * products: all existing products are deactivated, then the final 27-product
--     catalog is upserted by unique name with the current Supabase Storage URLs.
--
-- Product image paths intentionally use only:
--   * site-images/products/cards/*.jpg
--   * site-images/products/full/*.jpg

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
  ('contact_email', 'lior.patisserie@outlook.com', now()),
  ('whatsapp_number', '972506422900', now()),
  ('order_button_text', 'שליחת הזמנה', now()),
  ('contact_signature_text', 'באהבה, ליאור', now()),
  ('instagram_sentence_text', 'לעוד רגעים מתוקים, טעמים חדשים והצצות מהמטבח - מוזמנים להמשיך איתנו', now()),
  ('instagram_link_text', 'באינסטגרם', now()),
  ('instagram_url', 'https://www.instagram.com/_liornahum_/', now())
on conflict (key) do nothing;

-- ── products (final 27-product catalog) ────────────────────────────────────

update public.products
set is_active = false;

with final_products (name, description, filename, display_order) as (
  values
    ('אוראו דרים', 'עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל.', 'A7404929', 1),
    ('אמסטרדם', 'עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן.', 'A7404918', 2),
    ('קונפטי וניל', 'עוגיית וניל חגיגית עם סוכריות קונפטי צבעוניות, שוקולד לבן וקרם וניל מפנק.', 'A7404912', 3),
    ('שוקוצ׳יפס', 'עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד.', 'A7404900', 4),
    ('וניל קלאסי', 'עוגיית וניל קלאסית, רכה ומפנקת, עם שוקולד לבן ונגיעה עדינה של קרם וניל.', 'A9708282', 5),
    ('בראוניז שוקולד', 'בראוניז שוקולד עשירים במיוחד עם מרקם פאדג׳י וטעם קקאו עמוק.', 'A7405042', 6),
    ('מגש וניל חגיגי', 'מגש עוגיות וניל חגיגי ומעוצב, מושלם לאירוח, מתנה או שולחן מתוקים.', 'A7405027', 7),
    ('אוראו קראנץ׳', 'עוגיית אוראו קראנצ׳ית עם שברי אוראו, שוקולד לבן ומילוי קרמי עשיר.', 'A7404927', 8),
    ('אוראו לבן', 'עוגיית אוראו לבן עם שוקולד לבן, קרם אוראו עדין ושברי עוגיות מעל.', 'A7404925', 9),
    ('מגולגלת קינדר', 'עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל.', 'A7404964', 10),
    ('כריות נוגט', 'עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן.', 'A7404958', 11),
    ('קורנפלקס שוקולד חלב', 'עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי.', 'A7404956', 12),
    ('שוקולד פנינים', 'עוגיית שוקולד עשירה עם פניני שוקולד, קרם קקאו ושכבות מתוקות של קראנץ׳.', 'A7404955', 13),
    ('פניני שוקולד לבן', 'עוגייה מתוקה עם פניני שוקולד לבן, קרם וניל ושוקולד לבן במרקם מפנק.', 'A7404952', 14),
    ('קינדר', 'עוגיית קינדר מפנקת עם שוקולד חלב, קרם קינדר ושברי קינדר מעל.', 'A7404950', 15),
    ('ס׳מורשמלו', 'עוגיית ס׳מורס עם מרשמלו רך, שוקולד עשיר וקראנץ׳ ביסקוויטים מתוק.', 'A7404945', 16),
    ('קורנפלקס שוקולד לבן', 'עוגייה קראנצ׳ית עם קורנפלקס, שוקולד לבן וקרם וניל עשיר.', 'A7404939', 17),
    ('שוקוצ׳יפס קלאסי', 'עוגיית שוקוצ׳יפס קלאסית עם בצק וניל עשיר ושפע מטבעות שוקולד.', 'A7404936', 18),
    ('מארז וניל חגיגי', 'מארז וניל חגיגי ומעוצב עם עוגיות מפנקות שמתאימות למתנה מתוקה.', 'A7405026', 19),
    ('במבה רד', 'עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה.', 'A7405005', 20),
    ('קוקילוטוס', 'עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל.', 'A7404990', 21),
    ('שוקולד דובאי', 'עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף.', 'A7404987', 22),
    ('פיסטצ׳יו', 'עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס.', 'A7404980', 23),
    ('קונפטי פאן', 'עוגיית קונפטי צבעונית ושמחה עם שוקולד לבן, קרם וניל וסוכריות צבעוניות.', 'A7404978', 24),
    ('חצי־חצי וניל שוקולד', 'עוגיית חצי־חצי עם בצק וניל ובצק שוקולד, שוקולדים מפנקים ושני מרקמים בביס אחד.', 'A7404973', 25),
    ('חצי־חצי', 'חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים.', 'A7404971', 26),
    ('ברוקי בייגלה', 'עוגיית ברוקי עשירה עם שוקולד, בייגלה מלוח וקראנץ׳ מתוק־מלוח ממכר.', 'A7404968', 27)
)
insert into public.products (name, description, price, image_url, card_image_url, is_active, display_order, product_series)
select fp.name,
       fp.description,
       null,
       'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/full/' || fp.filename || '.jpg',
       'https://osehkbkeydhpesjlisuk.supabase.co/storage/v1/object/public/site-images/products/cards/' || fp.filename || '.jpg',
       true,
       fp.display_order,
       case
         when fp.display_order between 1 and 9 then 'series_1'
         when fp.display_order between 10 and 18 then 'series_2'
         when fp.display_order between 19 and 27 then 'series_3'
         else 'none'
       end
from final_products fp
where true
on conflict (name) do update
set description = excluded.description,
    price = excluded.price,
    image_url = excluded.image_url,
    card_image_url = excluded.card_image_url,
    is_active = excluded.is_active,
    display_order = excluded.display_order,
    product_series = excluded.product_series;

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

-- ── verification queries ───────────────────────────────────────────────────

select count(*) as active_products
from public.products
where is_active = true;

select name, card_image_url, image_url, display_order, is_active
from public.products
where is_active = true
order by display_order;

select name, count(*)
from public.products
group by name
having count(*) > 1
order by name;
