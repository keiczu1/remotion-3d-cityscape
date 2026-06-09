export interface LeaderSalaryEntry {
  rank: number;
  leader_id: string;
  display_name: string;
  leader_name_ru: string;
  leader_name_en: string;
  country_ru: string;
  country_en: string;
  iso3: string;
  salary_usd_monthly_equivalent: number;
  salary_usd_monthly_display: string;
  salary_usd_annual_approx: number | null;
  salary_confidence: string;
  population: number | null;
  population_display: string;
  populationScale: number;
  image_file: string;
  video_label: string;
  video_subtitle: string;
  relHeight: number;
}
