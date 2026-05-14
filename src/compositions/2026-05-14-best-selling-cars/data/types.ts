export interface CarEntry {
  rank: number;
  model_id: string;
  display_name: string;
  sales_value: number; // e.g. 50000000
  types: string[]; // e.g. ["Japan", "Toyota"] or something else
  image_file: string; // just the filename, like "001-toyota-corolla.png"
  video_label: string; // "#1 Toyota Corolla"
  video_subtitle: string; // "50 млн. | Japan"
  relHeight: number;
}
