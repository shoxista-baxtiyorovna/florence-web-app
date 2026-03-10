"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "uz" | "ru";

interface Translations {
  [key: string]: {
    en: string;
    uz: string;
    ru: string;
  };
}

const translations: Translations = {
  welcome: { en: "flower delivery Capital City", uz: "Poytaxtda gul yetkazib berish", ru: "доставка цветов Capital City" },
  shop_now: { en: "SELECT A BOUQUET", uz: "GULDASTA TANLASH", ru: "ВЫБРАТЬ БУКЕТ" },
  cart: { en: "Cart", uz: "Savat", ru: "Корзина" },
  products: { en: "Products", uz: "Mahsulotlar", ru: "Товары" },
  hero_subtitle: { en: "7-day freshness guarantee for your bouquet !", uz: "Guldastangiz uchun 7 kunlik yashovchanlik kafolati !", ru: "Гарантия свежести вашего букета на 7 дней !" },
  add_to_cart: { en: "Add to Cart", uz: "Savatga Qo'shish", ru: "В Корзину" },
  total: { en: "Total", uz: "Jami", ru: "Итого" },
  checkout: { en: "Checkout", uz: "Rasmiylashtirish", ru: "Оформить" },

  // New Navbar & Redesign Keys
  delivery_info_1: { en: "Delivery of flowers, balloons", uz: "Gullar, sharlar", ru: "Доставка цветов, шаров" },
  delivery_info_2: { en: "and gifts in", uz: "va sovg'alar yetkazib berish", ru: "и подарков в" },
  capital_city: { en: "Capital City", uz: "Poytaxtda", ru: "Столице" },
  delivering_in: { en: "Flower delivery in", uz: "Gullar yetkazib berish", ru: "Доставка цветов в" },
  change_city: { en: "CHANGE CITY", uz: "SHAHARNI O'ZGARTIRISH", ru: "ИЗМЕНИТЬ ГОРОД" },
  menu: { en: "MENU", uz: "MENYU", ru: "МЕНЮ" },
  catalog: { en: "Catalog", uz: "Katalog", ru: "Каталог" },
  roses: { en: "Roses", uz: "Atirgullar", ru: "Розы" },
  peonies: { en: "Peonies", uz: "Pionlar", ru: "Пионы" },
  in_the_box: { en: "In The Box", uz: "Qutida", ru: "В Коробке" },
  edible: { en: "Edible", uz: "Yeyiladigan", ru: "Съедобные" },
  promotions: { en: "Promotions", uz: "Aksiyalar", ru: "Акции" },
  admin: { en: "ADMIN", uz: "ADMIN", ru: "АДМИН" },
  empty_cart: { en: "Your cart is empty", uz: "Savatingiz bo'sh", ru: "Ваша корзина пуста" },
  business_profile: { en: "Business Profile", uz: "Biznes Profil", ru: "Бизнес Профиль" },
  branches: { en: "Branches", uz: "Filiallar", ru: "Филиалы" },
  analytics: { en: "Analytics", uz: "Tahlillar", ru: "Аналитика" },
  save_profile: { en: "Save Profile", uz: "Profilni Saqlash", ru: "Сохранить Профиль" },
  add_branch: { en: "+ Add Branch", uz: "+ Filial Qo'shish", ru: "+ Добавить Филиал" },
  delivery_estimate: { en: "Delivery Estimate", uz: "Yetkazib Berish Taxmini", ru: "Оценка Доставки" },
  view_live_map: { en: "View Live Map", uz: "Jonli Xaritani Ko'rish", ru: "Посмотреть Живую Карту" },
  payment_method: { en: "Payment Method", uz: "To'lov Usuli", ru: "Способ Оплаты" },
  profile: { en: "Profile", uz: "Profil", ru: "Профиль" },
  bloom_dashboard: { en: "Bloom Dashboard", uz: "Bloom Boshqaruvi", ru: "Панель Bloom" },
  manage_business: { en: "Manage your floral business.", uz: "Gullar biznesingizni boshqaring.", ru: "Управляйте своим цветочным бизнесом." },
  growth_status: { en: "Growth Status:", uz: "O'sish Holati:", ru: "Статус Роста:" },
  uzb_ecommerce_reg: { en: "Uzbekistan E-Commerce Registration", uz: "O'zbekiston E-Tijorat Ro'yxati", ru: "Регистрация Э-Коммерции Узбекистана" },
  reg_business_name: { en: "Registered Business Name (LLC/IE)", uz: "Ro'yxatdan O'tgan Biznes Nomi (MCHJ/YTT)", ru: "Зарегистрированное Имя Бизнеса (ООО/ИП)" },
  reg_number: { en: "Registration Number (STIR / INN)", uz: "Ro'yxatdan O'tish Raqami (STIR / INN)", ru: "Регистрационный Номер (ИНН)" },
  your_branches: { en: "Your Branches", uz: "Sizning Filiallaringiz", ru: "Ваши Филиалы" },
  no_branches: { en: "No branches added yet.", uz: "Hali filiallar qo'shilmagan.", ru: "Филиалы еще не добавлены." },
  complete_profile_analytics: { en: "Complete your shop profile to unlock Analytics.", uz: "Profilni to'ldiring.", ru: "Заполните профиль." },
  distance: { en: "Distance", uz: "Masofa", ru: "Расстояние" },
  time_to_deliver: { en: "Time to Deliver", uz: "Yetkazib Berish Vaqti", ru: "Время Доставки" },
  items_subtotal: { en: "Items Subtotal", uz: "Mahsulotlar Summasi", ru: "Сумма Товаров" },
  dynamic_fee: { en: "Dynamic Delivery Fee", uz: "Dinamik Yetkazib Berish To'lovi", ru: "Плавающая Стоимость Доставки" },
  processing: { en: "Processing...", uz: "Jarayonda...", ru: "Обработка..." },
  checkout_success: { en: "Order Placed Successfully!", uz: "Buyurtma Muvaffaqiyatli Qabul Qilindi!", ru: "Заказ Успешно Оформлен!" },
  saved: { en: "Saved!", uz: "Saqlandi!", ru: "Сохранено!" },
  branch_added: { en: "Branch Added!", uz: "Filial Qo'shildi!", ru: "Филиал Добавлен!" },
  gifting_suite: { en: "Gifting Suite", uz: "Sovg'a Sozlamalari", ru: "Опции Подарка" },
  recipient_name: { en: "Recipient Name", uz: "Qabul Qiluvchi Ismi", ru: "Имя Получателя" },
  recipient_phone: { en: "Recipient Phone", uz: "Qabul Qiluvchi Raqami", ru: "Телефон Получателя" },
  deliver_anonymously: { en: "Deliver Anonymously", uz: "Yashirincha Yetkazish", ru: "Доставить Анонимно" },
  gift_message: { en: "Gift Message", uz: "Sovg'a Xabari", ru: "Сообщение Подарка" },
  delivery_time_slot: { en: "Delivery Time Slot", uz: "Yetkazib Berish Vaqti", ru: "Время Доставки" },
  morning: { en: "Morning (09:00 - 12:00)", uz: "Ertalab (09:00 - 12:00)", ru: "Утро (09:00 - 12:00)" },
  afternoon: { en: "Afternoon (13:00 - 17:00)", uz: "Tushdan Keyin (13:00 - 17:00)", ru: "День (13:00 - 17:00)" },
  evening: { en: "Evening (18:00 - 21:00)", uz: "Kechqurun (18:00 - 21:00)", ru: "Вечер (18:00 - 21:00)" },
  welcome_back: { en: "Welcome Back", uz: "Xush Kelibsiz", ru: "С Возвращением" },
  create_account: { en: "Create Account", uz: "Hisob Yaratish", ru: "Создать Аккаунт" },
  select_role: { en: "Select Your Role To Continue", uz: "Davom Etish Uchun Rolingizni Tanlang", ru: "Выберите Роль Для Продолжения" },
  buy: { en: "Buy", uz: "Xarid Qilish", ru: "Купить" },
  sell: { en: "Sell", uz: "Sotish", ru: "Продать" },
  admin_role: { en: "Admin", uz: "Admin", ru: "Админ" },
  login_telegram: { en: "Log in securely with Telegram", uz: "Telegram orqali xavfsiz kiring", ru: "Войти через Telegram" },
  no_passwords: { en: "No passwords required.", uz: "Parol talab qilinmaydi.", ru: "Пароли не нужны." },
  secure_auth: { en: "Seamless & Secure authentication.", uz: "Tez va xavfsiz avtorizatsiya.", ru: "Быстрая и безопасная аутентификация." },
  login_failed: { en: "Login Failed", uz: "Kirishda xatolik yuz berdi", ru: "Ошибка Входа" },
  log_in: { en: "Log In", uz: "Kirish", ru: "Войти" },
  log_out: { en: "Log Out", uz: "Chiqish", ru: "Выйти" },
  my_profile: { en: "My Profile", uz: "Mening Profilim", ru: "Мой Профиль" },
  details: { en: "Details", uz: "Tafsilotlar", ru: "Детали" },
  orders: { en: "Orders", uz: "Buyurtmalar", ru: "Заказы" },
  address_book: { en: "Address Book", uz: "Manzillar", ru: "Адресная Книга" },
  followed_shops: { en: "Followed Shops", uz: "Kuzatilgan Do'konlar", ru: "Избранные Магазины" },
  my_reviews: { en: "My Reviews", uz: "Mening Sharhlarim", ru: "Мои Отзывы" },
  account_details: { en: "Account Details", uz: "Hisob Tafsilotlari", ru: "Детали Аккаунта" },
  display_name: { en: "Display Name", uz: "Ko'rinadigan Ism", ru: "Отображаемое Имя" },
  save_profile_changes: { en: "Save Profile Changes", uz: "Ozgarishlarni Saqlash", ru: "Сохранить Изменения" },
  saving: { en: "Saving...", uz: "Saqlanmoqda...", ru: "Сохранение..." },
  no_orders: { en: "You haven't placed any orders yet.", uz: "Siz hali hech qanday buyurtma bermadingiz.", ru: "Вы еще не сделали ни одного заказа." },
  cancel_order: { en: "Cancel Order", uz: "Buyurtmani Bekor Qilish", ru: "Отменить Заказ" },
  phone_verification: { en: "Phone Verification", uz: "Telefonni Tasdiqlash", ru: "Верификация Телефона" },
  phone_verified: { en: "Phone number securely verified.", uz: "Telefon raqami xavfsiz tasdiqlandi.", ru: "Номер телефона надежно подтвержден." },
  phone_req: { en: "Required for seamless delivery updates.", uz: "Yetkazib berish yangilanishlari uchun talab qilinadi.", ru: "Необходим для уведомлений о доставке." },
  send_sms: { en: "Send SMS", uz: "SMS Yuborish", ru: "Отправить SMS" },
  enter_code: { en: "Enter the 4-digit code sent to your phone (Use 1234 to test):", uz: "Telefoningizga yuborilgan 4 raqamli kodni kiriting:", ru: "Введите 4-значный код, отправленный на ваш телефон:" },
  confirm: { en: "Confirm", uz: "Tasdiqlash", ru: "Подтвердить" },
  order_history: { en: "Order History", uz: "Buyurtmalar Tarixi", ru: "История Заказов" },
  date: { en: "Date", uz: "Sana", ru: "Дата" },
  amount: { en: "Amount", uz: "Summa", ru: "Сумма" },
  no_addresses: { en: "No saved addresses. Add Home or Office to speed up checkout.", uz: "Saqlangan manzillar yo'q. Uyni yoki Ofisni qo'shing.", ru: "Нет сохраненных адресов. Добавьте Дом или Офис." },
  no_favorites: { en: "You currently don't follow any shops.", uz: "Siz hozircha hech qanday do'konni kuzatmaysiz.", ru: "В настоящее время вы не подписаны ни на какие магазины." },
  my_reviews_title: { en: "My Reviews (Append-Only)", uz: "Mening Sharhlarim (Faqat Qo'shish)", ru: "Мои Отзывы (Только Добавление)" },
  reviews_desc: { en: "In accordance with 2026 E-commerce regulations, all floral reviews are append-only. Experiences can be followed up on, but not erased.", uz: "E-tijorat qoidalariga muvofiq, barcha sharhlar faqat qo'shiladi.", ru: "В соответствии с правилами Э-коммерции 2026 года, все отзывы о цветах только дополняются." },
  no_reviews: { en: "You haven't left any reviews yet.", uz: "Siz hali hech qanday sharh qoldirmagansiz.", ru: "Вы еще не оставили ни одного отзыва." },

  // Product Page & Filters
  our_collection_in: { en: "Our Collection in", uz: "Bizning To'plam", ru: "Наша Коллекция в" },
  all_flowers: { en: "All Flowers", uz: "Barcha Gullar", ru: "Все Цветы" },
  daisies: { en: "Daisies", uz: "Moychechak", ru: "Ромашки" },
  tulips: { en: "Tulips", uz: "Lolalar", ru: "Тюльпаны" },
  sunflowers: { en: "Sunflowers", uz: "Kungaboqar", ru: "Подсолнухи" },
  orchids: { en: "Orchids", uz: "Orxideyalar", ru: "Орхидеи" },
  any_format: { en: "Any Format", uz: "Har Qanday Format", ru: "Любой Формат" },
  format_bouquet: { en: "Bouquet", uz: "Guldasta", ru: "Букет" },
  format_basket: { en: "Basket", uz: "Savat", ru: "Корзина" },
  any_size: { en: "Any Size", uz: "Har Qanday O'lcham", ru: "Любой Размер" },
  size_small: { en: "Small", uz: "Kichik", ru: "Маленький" },
  size_average: { en: "Average", uz: "O'rtacha", ru: "Средний" },
  size_big: { en: "Big / Premium", uz: "Katta / Premium", ru: "Большой / Премиум" },
  trendy_only: { en: "Trendy Only", uz: "Faqat Trenddagi", ru: "Только Трендовые" },
  sort_by: { en: "Sort By", uz: "Saralash", ru: "Сортировать По" },
  featured: { en: "Featured", uz: "Tavsiya Etilgan", ru: "Рекомендуемые" },
  highest_rated: { en: "Highest Rated", uz: "Yaxshi Baholangan", ru: "С Лучшим Рейтингом" },
  price_low_high: { en: "Price: Low to High", uz: "Narx: Arzondan Qimmatga", ru: "Цена: По Возрастанию" },
  price_high_low: { en: "Price: High to Low", uz: "Narx: Qimmatdan Arzonga", ru: "Цена: По Убыванию" },
  curating_collection: { en: "Curating our collection...", uz: "To'plamimizni tayyorlayapmiz...", ru: "Подготавливаем нашу коллекцию..." },
  all_rights_reserved: { en: "Premium Flora. All rights reserved.", uz: "Barcha huquqlar himoyalangan.", ru: "Все права защищены." },
  coming_soon: { en: "Coming Soon", uz: "Tez Orada", ru: "Скоро" },

  // Wishlist Feature
  wishlist: { en: "My Wishlist", uz: "Istaklarim", ru: "Мои Желания" },
  empty_wishlist: { en: "You haven't liked any items yet", uz: "Siz hali hech narsa yoqtirmadingiz", ru: "Вы еще не добавили ни одного товара" },
  discover_flowers: { en: "Discover Flowers", uz: "Gullarni Kashf Etish", ru: "Открыть Для Себя Цветы" },
  added_to_wishlist: { en: "Added to Wishlist", uz: "Istaklaringizga qo'shildi", ru: "Добавлено в желаемое" },
  view: { en: "VIEW", uz: "KO'RISH", ru: "СМОТРЕТЬ" },
  no_results: { en: "No results found", uz: "Hech narsa topilmadi", ru: "Ничего не найдено" },
  clear_search: { en: "Clear search", uz: "Qidiruvni tozalash", ru: "Очистить поиск" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("uz");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
