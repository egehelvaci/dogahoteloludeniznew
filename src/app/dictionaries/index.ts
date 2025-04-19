import enTranslations from './en.json';
import trTranslations from './tr.json';

export type Dictionary = {
  gallery: {
    galleryTitle: string;
    gallerySubtitle: string;
    viewImage: string;
    previous: string;
    next: string;
    close: string;
    watchVideo: string;
    loadingVideo: string;
    videoDescription: string;
    videoTitle: string;
  }
}

const dictionaries: Record<string, Dictionary> = {
  en: enTranslations as Dictionary,
  tr: trTranslations as Dictionary,
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  return dictionaries[locale] || dictionaries.tr;
} 