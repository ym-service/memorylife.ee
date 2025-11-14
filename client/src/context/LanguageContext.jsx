import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'memorylife-language';

const translations = {
  en: {
    heroTag: 'Memorylife',
    heroTitle: 'Legacy Reimagined',
    heroLead:
      'More than a name. A story. This plaque unlocks a beautiful personal page for their photos, videos, and stories.',
    form: {
      titleLabel: 'Title',
      titlePlaceholder: 'Family legacy of the Petrovs',
      storyLabel: 'Story',
      storyPlaceholder: 'Share key milestones, memories, facts...',
      photoLabel: 'Memorial photo',
      photoHint: 'Optional. Attach an image to display on the public page.',
      photoButton: 'Select image',
      photoSelected: 'Selected photo',
    },
    buttons: {
      create: 'Create Memorylife page',
      order: 'Order a Memorylife plaque',
      orderLocked: 'Generate a Memorylife page to unlock plaque ordering.',
    },
    previewCard: {
      title: 'Your page is live',
      body: 'Share the link with loved ones. The QR code opens the Memorylife story instantly.',
      slug: 'Slug',
      url: 'URL',
    },
    errors: {
      previewPending: 'Preview is still rendering. Please try again in a moment.',
    },
    modal: {
      badge: 'Memorylife tab',
      title: 'Order a Memorylife plaque',
      intro:
        'This form sends your request directly to {email} through StaticForms.',
      name: 'Name',
      email: 'Email',
      phone: 'Phone (optional)',
      message: 'Message',
      messagePlaceholder: 'Tell us how many plaques you need, preferred material, etc.',
      attachmentLabel: 'Attach artwork or reference (optional)',
      attachmentHint: 'Upload logos, sketches, or measurements to help us manufacture the plaque.',
      redirectHint:
        'After submission StaticForms will redirect you to {url}. Check your inbox (and spam) for their confirmation email.',
      cancel: 'Cancel',
      submit: 'Send order email',
      success: 'Order sent! We will reach out to the email you provided.',
      shapes: {
        rectangle: 'Rectangle',
        ellipse: 'Ellipse',
        star5: 'Five-point star',
        star4: 'Star of David',
      },
    },
    plate: {
      brand: 'Memorylife',
      preview: '3D QR plaque preview',
      material: 'Material',
      materials: {
        steel: 'Steel',
        copper: 'Copper',
        matte: 'Matte steel',
      },
      shape: 'Plate shape',
      width: 'Width (cm)',
      height: 'Height (cm)',
      thickness: 'Thickness (mm)',
      radius: 'Corner radius (mm)',
      border: 'Engraved border',
      liveUrl: 'Live QR URL',
      slug: 'Slug',
    },
    legacyPage: {
      loading: 'Loading Memorylife page...',
      notFound: 'Memorylife page not found',
      notFoundDesc: 'This tribute is unavailable.',
      createNew: 'Create a new Memorylife page',
      back: 'Back to Memorylife',
      share: 'Share link',
      shareHint: 'Recreate the legacy entry to update details and regenerate a QR plaque.',
      localInfo: 'Memorylife keeps this page locally so you can print the QR plaque or share the safe link below.',
      photoHighlight: 'Photo highlight',
      photoText:
        'Images help the story feel tangible. Replace this link anytime by editing the legacy entry locally.',
    },
  },
  ee: {
    heroTag: 'Memorylife',
    heroTitle: 'Mälestused uuel kujul',
    heroLead:
      'See ei ole vaid nimi. See on lugu. QR-plaastri kaudu avaneb isiklik leht fotode, videote ja lugudega.',
    form: {
      titleLabel: 'Pealkiri',
      titlePlaceholder: 'Näiteks, Perekond Petrovite lugu',
      storyLabel: 'Lugu',
      storyPlaceholder: 'Jaga olulisi hetki, mälestusi, fakte...',
      photoLabel: 'Mälestusfoto',
      photoHint: 'Valikuline. Lisa pilt, mida näidata avalikul lehel.',
      photoButton: 'Vali pilt',
      photoSelected: 'Valitud foto',
    },
    buttons: {
      create: 'Loo Memorylife leht',
      order: 'Telli Memorylife plaaster',
      orderLocked: 'Looge esmalt leht, et avada tellimisvõimalus.',
    },
    previewCard: {
      title: 'Teie leht on valmis',
      body: 'Jagage linki lähedastega. QR-kood avab loo koheselt.',
      slug: 'Slug',
      url: 'URL',
    },
    errors: {
      previewPending: 'Eelvaade renderdub veel. Palun proovige hetke pärast uuesti.',
    },
    modal: {
      badge: 'Memorylife tab',
      title: 'Telli Memorylife plaaster',
      intro: 'See vorm saadab teie soovi aadressile {email} läbi StaticFormsi.',
      name: 'Nimi',
      email: 'E-post',
      phone: 'Telefon (valikuline)',
      message: 'Sõnum',
      messagePlaceholder: 'Kirjeldage kogust, materjali eelistust jms.',
      attachmentLabel: 'Lisa fail (valikuline)',
      attachmentHint: 'Laadige üles logod, visandid või mõõdud, et tootmine oleks täpsem.',
      redirectHint:
        'Pärast saatmist suunab StaticForms teid aadressile {url}. Kontrollige ka spämmi kausta.',
      cancel: 'Tühista',
      submit: 'Saada tellimus',
      success: 'Tellimus saadetud! Vastame märgitud e-postile.',
      shapes: {
        rectangle: 'Ristkülik',
        ellipse: 'Ellips',
        star5: 'Viieharuline täht',
        star4: 'Taaveti täht',
      },
    },
    plate: {
      brand: 'Memorylife',
      preview: '3D QR plaaster',
      material: 'Materjal',
      materials: {
        steel: 'Teras',
        copper: 'Vask',
        matte: 'Matt teras',
      },
      shape: 'Plaastri kuju',
      width: 'Laius (cm)',
      height: 'Kõrgus (cm)',
      thickness: 'Paksus (mm)',
      radius: 'Nurga raadius (mm)',
      border: 'Graveeritud äär',
      liveUrl: 'QR URL',
      slug: 'Slug',
    },
    legacyPage: {
      loading: 'Laadin Memorylife lehte...',
      notFound: 'Memorylife leht ei leitud',
      notFoundDesc: 'See mälestus pole saadaval.',
      createNew: 'Loo uus Memorylife leht',
      back: 'Tagasi Memorylife’i',
      share: 'Jaga linki',
      shareHint: 'Uuenda infot uue kirje loomisega ja QR koodi taastekitamisega.',
      localInfo: 'Memorylife hoiab seda lehte lokaalselt, et saaksite QR-plaastri printida või lingi turvaliselt jagada.',
      photoHighlight: 'Foto esiletõst',
      photoText:
        'Fotod annavad loole elavuse. Saate linki igal ajal muuta, muutes kirjet lokaalselt.',
    },
  },
  ua: {
    heroTag: 'Memorylife',
    heroTitle: 'Спадок по-новому',
    heroLead:
      'Це більше, ніж ім’я. Це історія. QR-плашка відкриває красиву особисту сторінку з фото, відео та спогадами.',
    form: {
      titleLabel: 'Заголовок',
      titlePlaceholder: 'Наприклад, Історія родини Петрових',
      storyLabel: 'Текст',
      storyPlaceholder: 'Поділіться важливими подіями, спогадами, фактами...',
      photoLabel: 'Фото пам’яті',
      photoHint: 'Необов’язково. Додайте зображення для публічної сторінки.',
      photoButton: 'Обрати фото',
      photoSelected: 'Вибране фото',
    },
    buttons: {
      create: 'Створити сторінку Memorylife',
      order: 'Замовити плашку Memorylife',
      orderLocked: 'Спочатку створіть сторінку, щоб відкрити замовлення плашки.',
    },
    previewCard: {
      title: 'Сторінка готова',
      body: 'Поділіться посиланням. QR-код відкриє історію миттєво.',
      slug: 'Slug',
      url: 'URL',
    },
    errors: {
      previewPending: 'Попередній перегляд ще генерується. Спробуйте трохи згодом.',
    },
    modal: {
      badge: 'Memorylife tab',
      title: 'Замовити плашку Memorylife',
      intro: 'Ця форма надсилає запит на {email} через StaticForms.',
      name: "Ім'я",
      email: 'Email',
      phone: 'Телефон (необов’язково)',
      message: 'Повідомлення',
      messagePlaceholder: 'Вкажіть кількість плашок, матеріал тощо.',
      attachmentLabel: 'Прикріпіть файл (необов’язково)',
      attachmentHint: 'Завантажте логотипи, ескізи або розміри для виготовлення.',
      redirectHint:
        'Після відправки StaticForms перенаправить вас на {url}. Перевірте пошту та спам для підтвердження.',
      cancel: 'Скасувати',
      submit: 'Надіслати замовлення',
      success: 'Замовлення надіслано! Ми зв’яжемося з вами на вказаний email.',
      shapes: {
        rectangle: 'Прямокутник',
        ellipse: 'Елліпс',
        star5: 'Зірка (5 променів)',
        star4: 'Зірка Давида',
      },
    },
    plate: {
      brand: 'Memorylife',
      preview: '3D попередній перегляд',
      material: 'Матеріал',
      materials: {
        steel: 'Сталь',
        copper: 'Мідь',
        matte: 'Матова сталь',
      },
      shape: 'Форма плашки',
      width: 'Ширина (см)',
      height: 'Висота (см)',
      thickness: 'Товщина (мм)',
      radius: 'Радіус кутів (мм)',
      border: 'Гравірована рамка',
      liveUrl: 'QR URL',
      slug: 'Slug',
    },
    legacyPage: {
      loading: 'Завантаження сторінки Memorylife...',
      notFound: 'Сторінку не знайдено',
      notFoundDesc: 'На жаль, цей запис недоступний.',
      createNew: 'Створити нову сторінку Memorylife',
      back: 'Назад до Memorylife',
      share: 'Поділитися посиланням',
      shareHint: 'Щоб оновити сторінку, створіть новий запис та QR-код.',
      localInfo: 'Memorylife зберігає сторінку локально, щоб ви могли надрукувати QR-плашку або поділитися безпечним посиланням.',
      photoHighlight: 'Фотографія',
      photoText:
        'Зображення оживляє історію. Ви можете змінити посилання будь-коли локально.',
    },
  },
  ru: {
    heroTag: 'Memorylife',
    heroTitle: 'Наследие по-новому',
    heroLead:
      'Это больше, чем имя. Это история. Табличка открывает персональную страницу с фото, видео и воспоминаниями.',
    form: {
      titleLabel: 'Заголовок',
      titlePlaceholder: 'Например, История семьи Петровых',
      storyLabel: 'Текст',
      storyPlaceholder: 'Поделитесь важными моментами, воспоминаниями, фактами...',
      photoLabel: 'Памятное фото',
      photoHint: 'Необязательно. Прикрепите изображение для публичной страницы.',
      photoButton: 'Выбрать фото',
      photoSelected: 'Выбранное фото',
    },
    buttons: {
      create: 'Создать страницу Memorylife',
      order: 'Заказать табличку Memorylife',
      orderLocked: 'Сначала создайте страницу, чтобы открыть заказ таблички.',
    },
    previewCard: {
      title: 'Страница готова',
      body: 'Поделитесь ссылкой с близкими. QR-код откроет историю сразу.',
      slug: 'Slug',
      url: 'URL',
    },
    errors: {
      previewPending: 'Превью ещё формируется. Пожалуйста, повторите попытку позже.',
    },
    modal: {
      badge: 'Memorylife tab',
      title: 'Заказать табличку Memorylife',
      intro: 'Эта форма отправляет запрос на {email} через StaticForms.',
      name: 'Имя',
      email: 'Email',
      phone: 'Телефон (необязательно)',
      message: 'Сообщение',
      messagePlaceholder: 'Опишите количество табличек, материал и др.',
      attachmentLabel: 'Прикрепите файл (опционально)',
      attachmentHint: 'Загрузите логотипы, эскизы или размеры для производства.',
      redirectHint:
        'После отправки StaticForms перенаправит вас на {url}. Проверьте почту и папку спам для подтверждения.',
      cancel: 'Отменить',
      submit: 'Отправить заказ',
      success: 'Заявка отправлена! Мы ответим на указанный email.',
      shapes: {
        rectangle: 'Прямоугольник',
        ellipse: 'Эллипс',
        star5: 'Пятиконечная звезда',
        star4: 'Звезда Давида',
      },
    },
    plate: {
      brand: 'Memorylife',
      preview: '3D превью таблички',
      material: 'Материал',
      materials: {
        steel: 'Сталь',
        copper: 'Медь',
        matte: 'Матовая сталь',
      },
      shape: 'Форма таблички',
      width: 'Ширина (см)',
      height: 'Высота (см)',
      thickness: 'Толщина (мм)',
      radius: 'Радиус углов (мм)',
      border: 'Гравированная рамка',
      liveUrl: 'QR ссылка',
      slug: 'Slug',
    },
    legacyPage: {
      loading: 'Загрузка страницы Memorylife...',
      notFound: 'Страница не найдена',
      notFoundDesc: 'К сожалению, запись недоступна.',
      createNew: 'Создать новую страницу Memorylife',
      back: 'Назад к Memorylife',
      share: 'Поделиться ссылкой',
      shareHint: 'Чтобы обновить страницу, создайте новую запись и QR-код.',
      localInfo: 'Memorylife хранит эту страницу локально, чтобы вы могли напечатать QR-табличку или поделиться ссылкой.',
      photoHighlight: 'Фотография',
      photoText:
        'Изображения делают историю живой. Вы можете менять ссылку локально в любой момент.',
    },
  },
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

const resolveKey = (lang, key) => {
  const parts = key.split('.');
  let current = translations[lang] || translations.en;
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      current = null;
      break;
    }
  }
  if (current === null || current === undefined) {
    if (lang === 'en') return key;
    return resolveKey('en', key);
  }
  return current;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => resolveKey(lang, key),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
