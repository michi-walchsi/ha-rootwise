declare const __VERSION__: string;

interface CustomCardInfo {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

interface Window {
  customCards?: CustomCardInfo[];
}
