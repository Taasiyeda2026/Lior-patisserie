-- Lior's Pâtisserie — Handmade page content settings
-- Run this in the Supabase SQL Editor for existing projects that already have
-- public.site_settings. It adds the editable personal/general content keys
-- without overwriting existing admin-edited values.

insert into public.site_settings (key, value, updated_at) values
  ('handmade_content_mode', 'personal', now()),
  ('handmade_personal_label', 'כמה מילים ממני', now()),
  ('handmade_personal_title', 'אני כאן כדי להמתיק לכם את היום', now()),
  ('handmade_personal_paragraph_1', 'תמיד אהבתי לקחת רגע פשוט ולהפוך אותו למשהו קטן, מתוק ומרגש. בשבילי קינוח הוא לא רק טעם — הוא דרך לשמח, לרגש ולהשאיר זיכרון טוב.', now()),
  ('handmade_personal_paragraph_2', 'כל עוגייה, מארז וקינוח נוצרים מתוך אהבה לפרטים הקטנים, לאסתטיקה ולטעם מדויק.', now()),
  ('handmade_personal_cta', 'מוכנים לבחור את הרגע המתוק שלכם?', now()),
  ('handmade_general_bullet_1', 'רגעים יפים מתחילים בפרטים הקטנים.', now()),
  ('handmade_general_bullet_2', 'כל קינוח משלב טעם, יופי והמון מחשבה.', now()),
  ('handmade_general_bullet_3', 'התוצאה היא חוויה מתוקה שנשארת בלב.', now()),
  ('handmade_button_text', 'לצפייה במוצרים', now()),
  ('handmade_button_anchor', '#products', now())
on conflict (key) do nothing;
