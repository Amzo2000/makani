-- Seed SQL generated from constants.ts (frontend PROJECTS)
-- Paste into Supabase SQL Editor and run.
-- Optional cleanup first:
-- delete from public.projects;

insert into public.projects (
  slug,
  category,
  year,
  area,
  cover_image,
  images,
  published,
  title,
  category_label,
  location,
  status,
  description,
  concept
)
values
(
  'kyoto-residence',
  'Residential',
  '2023',
  '450 m²',
  'https://picsum.photos/id/122/1600/1200',
  ARRAY['https://picsum.photos/id/122/1600/900', 'https://picsum.photos/id/129/1200/1600', 'https://picsum.photos/id/132/1600/1200', 'https://picsum.photos/id/141/1600/900']::text[],
  true,
  '{"en":"Kyoto Residence","fr":"Résidence Kyoto","ar":"إقامة كيوتو"}'::jsonb,
  '{"en":"Residential","fr":"Résidentiel","ar":"سكني"}'::jsonb,
  '{"en":"Kyoto, Japan","fr":"Kyoto, Japon","ar":"كيوتو، اليابان"}'::jsonb,
  '{"en":"Completed","fr":"Terminé","ar":"مكتمل"}'::jsonb,
  '{"en":"A modern interpretation of the traditional Japanese machiya. The design focuses on internal courtyards and light filtration through timber slats, creating a private sanctuary within the dense urban fabric.","fr":"Une interprétation moderne du machiya japonais traditionnel. La conception se concentre sur les cours intérieures et la filtration de la lumière à travers des lattes de bois.","ar":"تفسير حديث لبيت الماتشيا الياباني التقليدي. يركز التصميم على الساحات الداخلية وترشيح الضوء من خلال الشرائح الخشبية، مما يخلق ملاذاً خاصاً داخل النسيج الحضري الكثيف."}'::jsonb,
  '{"en":"The core concept revolves around \"Ma\" (negative space). By hollowing out the center of the volume, we introduced a light well that connects all three floors, allowing nature to penetrate the living spaces.","fr":"Le concept central tourne autour du \"Ma\" (espace négatif). En creusant le centre du volume, nous avons introduit un puits de lumière qui relie les trois étages.","ar":"يدور المفهوم الأساسي حول \"ما\" (الفراغ السلبي). من خلال تجويف مركز الحجم، أدخلنا بئر ضوء يربط الطوابق الثلاثة، مما يسمح للطبيعة باختراق مساحات المعيشة."}'::jsonb
),
(
  'nordic-light-museum',
  'Cultural',
  '2022',
  '2,800 m²',
  'https://picsum.photos/id/15/1600/1200',
  ARRAY['https://picsum.photos/id/15/1600/900', 'https://picsum.photos/id/16/1200/1600', 'https://picsum.photos/id/19/1600/1200']::text[],
  true,
  '{"en":"Nordic Light Museum","fr":"Musée de la Lumière Nordique","ar":"متحف الضوء الشمالي"}'::jsonb,
  '{"en":"Cultural","fr":"Culturel","ar":"ثقافي"}'::jsonb,
  '{"en":"Oslo, Norway","fr":"Oslo, Norvège","ar":"أوسلو، النرويج"}'::jsonb,
  '{"en":"Completed","fr":"Terminé","ar":"مكتمل"}'::jsonb,
  '{"en":"Located on the waterfront, this museum is dedicated to the history of light in Nordic art. The monolithic concrete structure is punctuated by large glass openings that frame the harbor views.","fr":"Situé sur le front de mer, ce musée est dédié à l''histoire de la lumière dans l''art nordique. La structure monolithique en béton est ponctuée de grandes ouvertures vitrées.","ar":"يقع هذا المتحف على الواجهة البحرية، وهو مخصص لتاريخ الضوء في الفن الشمالي. الهيكل الخرساني الأحادي تتخلله فتحات زجاجية كبيرة تؤطر مناظر الميناء."}'::jsonb,
  '{"en":"Sculpting with light. The building form is designed to capture the low winter sun while filtering the harsh summer glare. The interior circulation follows a spiral path of increasing luminosity.","fr":"Sculpter avec la lumière. La forme du bâtiment est conçue pour capter le soleil bas d''hiver tout en filtrant l''éblouissement estival.","ar":"النحت بالضوء. تم تصميم شكل المبنى لالتقاط شمس الشتاء المنخفضة مع ترشيح وهج الصيف القاسي. تتبع الحركة الداخلية مساراً حلزونياً بزيادة السطوع."}'::jsonb
),
(
  'mitte-loft-conversion',
  'Interior',
  '2024',
  '180 m²',
  'https://picsum.photos/id/24/1600/1200',
  ARRAY['https://picsum.photos/id/24/1600/900', 'https://picsum.photos/id/42/1200/1600', 'https://picsum.photos/id/56/1600/1200']::text[],
  true,
  '{"en":"Mitte Loft Conversion","fr":"Conversion Loft Mitte","ar":"تحويل دور علوي في ميتي"}'::jsonb,
  '{"en":"Interior","fr":"Intérieur","ar":"داخلي"}'::jsonb,
  '{"en":"Berlin, Germany","fr":"Berlin, Allemagne","ar":"برلين، ألمانيا"}'::jsonb,
  '{"en":"In Progress","fr":"En Cours","ar":"قيد التنفيذ"}'::jsonb,
  '{"en":"Transformation of a former industrial warehouse into a luxury minimalist apartment. Exposed brick and steel beams contrast with soft, warm oak joinery and polished concrete floors.","fr":"Transformation d''un ancien entrepôt industriel en appartement minimaliste de luxe. La brique apparente et les poutres en acier contrastent avec la menuiserie en chêne.","ar":"تحويل مستودع صناعي سابق إلى شقة فاخرة بسيطة. يتباين الطوب المكشوف والعوارض الفولاذية مع نجارة البلوط الدافئة الناعمة والأرضيات الخرسانية المصقولة."}'::jsonb,
  '{"en":"Adaptive reuse with minimal intervention. We preserved the raw industrial shell and inserted independent \"living boxes\" that house private functions like bathrooms and storage.","fr":"Réutilisation adaptative avec une intervention minimale. Nous avons préservé la coque industrielle brute et inséré des \"boîtes de vie\" indépendantes.","ar":"إعادة الاستخدام التكيفي مع الحد الأدنى من التدخل. حافظنا على الهيكل الصناعي الخام وأدخلنا \"صناديق معيشة\" مستقلة تضم وظائف خاصة مثل الحمامات والتخزين."}'::jsonb
),
(
  'vineyard-pavilion',
  'Commercial',
  '2021',
  '120 m²',
  'https://picsum.photos/id/59/1600/1200',
  ARRAY['https://picsum.photos/id/59/1600/900', 'https://picsum.photos/id/60/1200/1600', 'https://picsum.photos/id/84/1600/1200']::text[],
  true,
  '{"en":"Vineyard Pavilion","fr":"Pavillon du Vignoble","ar":"جناح الكرم"}'::jsonb,
  '{"en":"Commercial","fr":"Commercial","ar":"تجاري"}'::jsonb,
  '{"en":"Tuscany, Italy","fr":"Toscane, Italie","ar":"توسكانا، إيطاليا"}'::jsonb,
  '{"en":"Completed","fr":"Terminé","ar":"مكتمل"}'::jsonb,
  '{"en":"A tasting room and observation deck for a historic vineyard. The structure cantilevers over the hillside, offering panoramic views of the rolling landscape.","fr":"Une salle de dégustation et une terrasse d''observation pour un vignoble historique. La structure est en porte-à-faux sur le flanc de la colline.","ar":"غرفة تذوق ومنصة مراقبة لكرم تاريخي. يمتد الهيكل فوق التل، مما يوفر إطلالات بانورامية على المناظر الطبيعية المتدحرجة."}'::jsonb,
  '{"en":"Harmonious integration. The material palette—corten steel and local stone—was chosen to weather and blend into the autumnal colors of the vineyards over time.","fr":"Intégration harmonieuse. La palette de matériaux a été choisie pour s''intégrer aux couleurs automnales des vignobles au fil du temps.","ar":"تكامل متناغم. تم اختيار لوحة المواد - فولاذ الكورتن والحجر المحلي - لتمتزج مع الألوان الخريفية لكروم العنب بمرور الوقت."}'::jsonb
),
(
  'helix-tower',
  'Concept',
  '2025',
  '45,000 m²',
  'https://picsum.photos/id/234/1600/1200',
  ARRAY['https://picsum.photos/id/234/1600/900', 'https://picsum.photos/id/238/1200/1600']::text[],
  true,
  '{"en":"Helix Tower","fr":"Tour Hélix","ar":"برج الحلزون"}'::jsonb,
  '{"en":"Concept","fr":"Concept","ar":"مفهوم"}'::jsonb,
  '{"en":"Dubai, UAE","fr":"Dubaï, EAU","ar":"دبي، الإمارات"}'::jsonb,
  '{"en":"Competition Entry","fr":"Entrée au concours","ar":"مشاركة في مسابقة"}'::jsonb,
  '{"en":"A mixed-use skyscraper proposing a new sustainable model for desert high-rises. The facade features a dynamic shading system inspired by traditional Mashrabiya patterns.","fr":"Un gratte-ciel à usage mixte proposant un nouveau modèle durable. La façade présente un système d''ombrage dynamique inspiré des motifs traditionnels de Mashrabiya.","ar":"ناطحة سحاب متعددة الاستخدامات تقترح نموذجاً مستداماً جديداً للمباني الشاهقة الصحراوية. تتميز الواجهة بنظام تظليل ديناميكي مستوحى من أنماط المشربية التقليدية."}'::jsonb,
  '{"en":"Vertical oasis. The tower is designed as a series of stacked vertical gardens, providing natural cooling and improving air quality for residents.","fr":"Oasis verticale. La tour est conçue comme une série de jardins verticaux empilés, assurant un refroidissement naturel.","ar":"واحة عمودية. تم تصميم البرج كسلسلة من الحدائق العمودية المكدسة، مما يوفر تبريداً طبيعياً ويحسن جودة الهواء للسكان."}'::jsonb
)
;

-- Optional: assign admin role to an existing auth user by email.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'you@example.com';
