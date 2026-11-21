export interface LiveChannel {
  id: string;
  name: string;
  altNames?: string[];
  logo?: string;
  streamUrl: string;      // usually .m3u8 (HLS)
  category: string;
  country?: string;
  language?: string;
  languages?: string[];
}
