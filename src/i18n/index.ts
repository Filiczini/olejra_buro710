import { uk } from './locales/uk';
import { en } from './locales/en';

/**
 * Locale type representing supported languages
 */
export type Locale = 'uk' | 'en';

/**
 * Translation structure matching the locale file shape
 */
export interface Translations {
  header: {
    admin: string;
    logout: string;
  };
  home: {
    featuredProjects: string;
    viewAll: string;
    about: string;
    contact: string;
    loading: string;
    error: string;
    noProjects: string;
  };
  contact: {
    title: string;
    subtitle: string;
    writeToUs: string;
    contactButton: string;
    contactInfo: string;
    contactInfoDesc: string;
    email: string;
    emailPlaceholder: string;
    emailAddress: string;
    phone: string;
    phonePlaceholder: string;
    phoneNumber: string;
    address: string;
    addressValue: string;
    workingHours: string;
    workingHoursValue: string;
    socialMedia: string;
    socialMediaDesc: string;
    formTitle: string;
    formDesc: string;
    name: string;
    namePlaceholder: string;
    yourName: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    sendMessage: string;
    findUs: string;
    findUsDesc: string;
    metro: string;
    metroStation: string;
    interactiveMap: string;
  };
  project: {
    loading: string;
    notFound: string;
    architects: string;
    area: string;
    location: string;
    year: string;
    photoCredits: string;
    nextProject: string;
    noMoreProjects: string;
    designConcept: string;
  };
  navigation: {
    projects: string;
    createProject: string;
    siteSettings: string;
    settings: string;
    activityLog: string;
    previewSite: string;
    logout: string;
  };
  topBar: {
    welcome: string;
    logout: string;
  };
  dashboard: {
    title: string;
    totalProjects: string;
    addProject: string;
    filters: string;
    search: string;
    searchPlaceholder: string;
    location: string;
    allLocations: string;
    year: string;
    allYears: string;
    tags: string;
    allTags: string;
    image: string;
    titleLabel: string;
    created: string;
    actions: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    loading: string;
    noProjects: string;
    showing: string;
    of: string;
    previous: string;
    next: string;
    projects: string;
  };
  createProject: {
    title: string;
    backToDashboard: string;
    basicInfo: string;
    titleLabel: string;
    titlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    year: string;
    yearPlaceholder: string;
    area: string;
    areaPlaceholder: string;
    details: string;
    team: string;
    teamPlaceholder: string;
    architects: string;
    architectsPlaceholder: string;
    conceptHeading: string;
    conceptHeadingPlaceholder: string;
    conceptCaption: string;
    conceptCaptionPlaceholder: string;
    conceptQuote: string;
    conceptQuotePlaceholder: string;
    tags: string;
    tagsPlaceholder: string;
    addTag: string;
    image: string;
    uploadImage: string;
    dragDrop: string;
    selectFile: string;
    supportedFormats: string;
    uploading: string;
    remove: string;
    cancel: string;
    create: string;
    creating: string;
    requiredField: string;
    invalidImage: string;
    imageTooLarge: string;
    error: string;
  };
  editProject: {
    title: string;
    backToDashboard: string;
    basicInfo: string;
    titleLabel: string;
    titlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    year: string;
    yearPlaceholder: string;
    area: string;
    areaPlaceholder: string;
    details: string;
    team: string;
    teamPlaceholder: string;
    architects: string;
    architectsPlaceholder: string;
    conceptHeading: string;
    conceptHeadingPlaceholder: string;
    conceptCaption: string;
    conceptCaptionPlaceholder: string;
    conceptQuote: string;
    conceptQuotePlaceholder: string;
    tags: string;
    tagsPlaceholder: string;
    addTag: string;
    image: string;
    uploadImage: string;
    dragDrop: string;
    selectFile: string;
    currentImage: string;
    supportedFormats: string;
    uploading: string;
    remove: string;
    cancel: string;
    save: string;
    saving: string;
    requiredField: string;
    invalidImage: string;
    imageTooLarge: string;
    error: string;
  };
  login: {
    title: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    login: string;
    loggingIn: string;
    loginFailed: string;
    error: string;
  };
  settings: {
    title: string;
    comingSoon: string;
    backToDashboard: string;
  };
  activityLog: {
    title: string;
    comingSoon: string;
    backToDashboard: string;
  };
  siteSettings: {
    title: string;
    loading: string;
    companyName: string;
    companyNamePlaceholder: string;
    companyTagline: string;
    companyTaglinePlaceholder: string;
    companyLocation: string;
    companyLocationPlaceholder: string;
    saved: string;
  };
  footer: {
    copyright: string;
  };
  process: {
    title: string;
    description: string;
    step01: string;
    step02: string;
    step03: string;
    step04: string;
  };
  philosophy: {
    value01Title: string;
    value01Description: string;
    value02Title: string;
    value02Description: string;
    value03Title: string;
    value03Description: string;
    value04Title: string;
    value04Description: string;
  };
  hero: {
    viewProject: string;
    explore: string;
    location: string;
    area: string;
  };
  about: {
    heroLine1: string;
    heroLine2: string;
    heroLine3: string;
    description1: string;
    description2: string;
    ctaButton: string;
    value01Title: string;
    value01Description: string;
    value02Title: string;
    value02Description: string;
    value03Title: string;
    value03Description: string;
    value04Title: string;
    value04Description: string;
    step01Name: string;
    step01Description: string;
    step02Name: string;
    step02Description: string;
    step03Name: string;
    step03Description: string;
    step04Name: string;
    step04Description: string;
    team01Name: string;
    team01Role: string;
    team02Name: string;
    team02Role: string;
    team03Name: string;
    team03Role: string;
    contactUs: string;
    team: string;
    valuesTitle: string;
    valuesDescription: string;
    processTitle: string;
    processDescription: string;
    teamSectionTitle: string;
    teamSectionDescription: string;
    contactCTATitle: string;
    contactCTADescription: string;
  };
}

/**
 * All available translations by locale
 */
export const translations: Record<Locale, Translations> = {
  uk: uk as Translations,
  en: en as Translations,
};

/**
 * Default locale for the application
 */
export const defaultLocale: Locale = 'uk';

/**
 * Pure function to get translations for a specific locale
 * @param locale - The locale to get translations for
 * @returns Translations object for the specified locale
 */
export function getT(locale: Locale): Translations {
  return translations[locale];
}

// Re-export locale objects for direct access
export { uk, en };
