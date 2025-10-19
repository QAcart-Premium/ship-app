// Arabic translations for the shipping application

export const translations = {
  // Common
  common: {
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    required: 'مطلوب',
  },

  // Navigation
  nav: {
    createShipment: 'إنشاء شحنة',
    myShipments: 'شحناتي',
    logout: 'تسجيل الخروج',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    registerTitle: 'إنشاء حساب جديد',
    loginTitle: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    country: 'الدولة',
    city: 'المدينة',
    street: 'الشارع',
    postalCode: 'الرمز البريدي',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    loginHere: 'سجل دخولك هنا',
    registerHere: 'سجل هنا',
  },

  // Shipment Form
  form: {
    // Card titles
    senderInformation: 'معلومات المرسل',
    receiverInformation: 'معلومات المستلم',
    packageDetails: 'تفاصيل الطرد',
    serviceSelection: 'اختيار الخدمة',
    additionalOptions: 'خيارات إضافية',
    rate: 'التكلفة',

    // Common fields
    name: 'الاسم',
    phone: 'رقم الهاتف',
    country: 'الدولة',
    city: 'المدينة',
    street: 'الشارع',
    postalCode: 'الرمز البريدي',

    // Sender fields
    senderName: 'اسم المرسل',
    senderPhone: 'هاتف المرسل',
    senderCountry: 'دولة المرسل',
    senderCity: 'مدينة المرسل',
    senderStreet: 'شارع المرسل',
    senderPostalCode: 'الرمز البريدي للمرسل',

    // Receiver fields
    receiverName: 'اسم المستلم',
    receiverPhone: 'هاتف المستلم',
    receiverCountry: 'دولة المستلم',
    receiverCity: 'مدينة المستلم',
    receiverStreet: 'شارع المستلم',
    receiverPostalCode: 'الرمز البريدي للمستلم',

    // Package fields
    weight: 'الوزن (كجم)',
    length: 'الطول (سم)',
    width: 'العرض (سم)',
    height: 'الارتفاع (سم)',
    itemDescription: 'وصف المحتويات',

    // Service options
    signatureRequired: 'التوقيع مطلوب',
    containsLiquid: 'يحتوي على سوائل',
    insurance: 'التأمين',
    packaging: 'التغليف الاحترافي',
    pickupMethod: 'طريقة الاستلام',
    homePickup: 'استلام من المنزل',
    dropOff: 'التسليم في المكتب البريدي',

    // Buttons
    saveDraft: 'حفظ كمسودة',
    finalizeShipment: 'إتمام الشحنة',
    saving: 'جاري الحفظ...',
    finalizing: 'جاري الإتمام...',

    // Messages
    completePreviousSection: 'أكمل القسم السابق لفتح هذه البطاقة',
    loadingCard: 'جاري تحميل البطاقة...',
    loadingServices: 'جاري تحميل الخدمات...',
    loadingOptions: 'جاري تحميل الخيارات...',
    selectServiceToSeePricing: 'اختر خدمة لرؤية السعر',
  },

  // Shipment Types
  shipmentTypes: {
    Domestic: 'محلي',
    IntraGulf: 'خليجي',
    International: 'دولي',
  },

  // Rate Card
  rate: {
    totalPrice: 'السعر الإجمالي',
    baseShippingCost: 'تكلفة الشحن الأساسية',
    signatureRequired: 'التوقيع مطلوب',
    insurance: 'التأمين',
    packaging: 'التغليف الاحترافي',
    liquidHandling: 'معالجة السوائل',
    day: 'يوم',
    days: 'أيام',
    base: 'الأساس',
  },

  // Shipments Table
  table: {
    title: 'شحناتي',
    trackingNumber: 'رقم التتبع',
    from: 'من',
    to: 'إلى',
    service: 'الخدمة',
    status: 'الحالة',
    totalPrice: 'السعر',
    actions: 'الإجراءات',
    noShipments: 'لا توجد شحنات',
    createFirstShipment: 'أنشئ أول شحنة لك!',
    createShipment: 'إنشاء شحنة',
    repeat: 'تكرار',
    viewDetails: 'عرض التفاصيل',
  },

  // Shipment Status
  status: {
    Draft: 'مسودة',
    Pending: 'قيد الانتظار',
    Processing: 'قيد المعالجة',
    InTransit: 'في الطريق',
    Delivered: 'تم التسليم',
    Cancelled: 'ملغي',
  },

  // Shipment Details
  details: {
    title: 'تفاصيل الشحنة',
    trackingNumber: 'رقم التتبع',
    status: 'الحالة',
    createdAt: 'تاريخ الإنشاء',
    sender: 'المرسل',
    receiver: 'المستلم',
    package: 'الطرد',
    service: 'الخدمة',
    options: 'الخيارات',
    pricing: 'التسعير',
    weight: 'الوزن',
    dimensions: 'الأبعاد',
    description: 'الوصف',
    serviceType: 'نوع الخدمة',
    pickupMethod: 'طريقة الاستلام',
    shipmentType: 'نوع الشحنة',
  },

  // Error Messages
  errors: {
    general: 'حدث خطأ ما',
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'البريد الإلكتروني غير صالح',
    invalidPhone: 'رقم الهاتف غير صالح',
    minLength: 'الحد الأدنى {min} أحرف',
    maxLength: 'الحد الأقصى {max} أحرف',
    invalidFormat: 'التنسيق غير صالح',
    validNumber: 'الرجاء إدخال رقم صالح',
    minValue: 'القيمة يجب أن تكون على الأقل {min}',
    maxValue: 'القيمة لا يمكن أن تتجاوز {max}',
    selectService: 'الرجاء اختيار خدمة',
    loginFailed: 'فشل تسجيل الدخول',
    registerFailed: 'فشل التسجيل',
    emailAlreadyExists: 'البريد الإلكتروني موجود بالفعل',
    invalidCredentials: 'بيانات الدخول غير صحيحة',
    shipmentNotFound: 'الشحنة غير موجودة',
    failedToLoadShipment: 'فشل تحميل الشحنة',
    failedToCreateShipment: 'فشل إنشاء الشحنة',
    failedToUpdateShipment: 'فشل تحديث الشحنة',
    gulfToIraqNotAllowed: 'الشحن من دول الخليج إلى العراق غير ممكن حالياً',
  },

  // Placeholders
  placeholders: {
    selectCountry: 'اختر الدولة',
    enterName: 'أدخل الاسم',
    enterPhone: 'أدخل رقم الهاتف',
    enterCity: 'أدخل المدينة',
    enterStreet: 'أدخل الشارع',
    enterPostalCode: 'أدخل الرمز البريدي',
    enterWeight: 'أدخل الوزن',
    enterLength: 'أدخل الطول',
    enterWidth: 'أدخل العرض',
    enterHeight: 'أدخل الارتفاع',
    enterDescription: 'أدخل الوصف',
    enterEmail: 'أدخل البريد الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
  },
}

// Helper function to get nested translations
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: any = translations

  for (const k of keys) {
    value = value?.[k]
  }

  if (typeof value !== 'string') {
    console.warn(`Translation missing for key: ${key}`)
    return key
  }

  // Replace parameters like {min}, {max}
  if (params) {
    Object.keys(params).forEach((param) => {
      value = value.replace(`{${param}}`, String(params[param]))
    })
  }

  return value
}
