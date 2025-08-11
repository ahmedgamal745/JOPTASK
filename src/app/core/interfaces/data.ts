export interface Job {
  id: string;
  jobable_id: string;
  cover: string;
  minimum_years_of_experience: number;
  title: string;
  description: string | null;
  basic_salary_to: number;
  basic_salary_from: number;
  salary_to: number;
  salary_from: number;
  number_of_vacancies: number;
  incremental_id: number;
  type: string;
  priority: string;
  duration_end: string | null;
  duration_start: string | null;
  job_duration_end: string | null;
  job_duration_start: string | null;
  date_closed: string | null;
  date_rejected: string | null;
  date_published: string | null;
  preferred_applicant_countries_sources: any[];
  job_locations: any[];
  industries: any[];
  skills: string | null;
  tags: string[];
  work_space_meta_data: string;
  created_at: string;
  updated_at: string;
  apply: Apply[];
  location: Location | null;
  attachments: any[];
  page: Page;
  saved_job: any | null;
  job_alert: any | null;
  applications: Application[];
  saved: boolean;
  has_job_alert: boolean;
  applied: boolean;
  companyName?: string;
}

export interface Apply {
  id: string;
  status: string;
  cv_url: string | null;
  applyable_type: string;
  applyable_id: string;
  job_id: string;
  created_at: string;
  updated_at: string;
}
export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface Location {
  id: string;
  city_id: string;
  country_id: string;
  address_line_one: string;
  address_line_two: string;
  created_at: string;
  updated_at: string;
  country: Country;
  city: City;
  industry: Industry;
  coordinates: Coordinates;
  country_and_city: string;
}

export interface Country {
  id: string;
  flag: string;
  name: string;
  language: Language;
  alpha2_code: string;
  calling_code: string;
  work_space_meta_data: WorkSpaceMetaData;
}

export interface Language {
  iso639_1: string;
  iso639_2: string;
  name: string;
  nativeName: string;
}

export interface WorkSpaceMetaData {
  id: string | number;
  code?: string;
  name: string;
  phone_code?: string;
}

export interface City {
  id: string;
  state_id: string | null;
  country_id: string;
  region: string | null;
  name: string;
  latitude: number;
  longitude: number;
  work_space_meta_data: CityWorkSpaceMetaData;
  created_at: string;
  updated_at: string;
}

export interface CityWorkSpaceMetaData {
  country_id: string | number;
  id: string | number;
  name: string;
  geo_location: GeoLocation;
}

export interface GeoLocation {
  lat: string;
  lon: string;
}

export interface Industry {
  id: string;
  name: string;
  work_space_meta_data: WorkSpaceMetaData;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  employer_id: string | null;
  name: string;
  telephone: string;
  alias: string;
  about: string | null;
  services: string | null;
  company_size: string;
  page_type: string;
  work_space_meta_data: PageWorkSpaceMetaData;
  created_at: string;
  updated_at: string;
  status: string;
  location: Location;
  information: Information;
}

export interface PageWorkSpaceMetaData {
  id: string;
  incremental_id?: number;
  page_name: string;
  alias?: string;
  account_status?: string;
  page_avatar?: string;
  page_cover?: string;
  company_email?: string;
  country_id?: number;
  industry_id?: number;
  is_verified?: number;
  is_verified_documents?: number;
  date_created?: string;
  date_updated?: string;
}

export interface Information {
  id: string;
  cover: string;
  avatar: string;
  last_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  gender: string | null;
  civil_status: string | null;
  industry_id: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
  full_name_reversed: string | null;
  full_name: string | null;
}

export interface Application {
  id: string;
  status: string;
  cv_url: string | null;
  applyable_type: string;
  applyable_id: string;
  job_id: string;
  created_at: string;
  updated_at: string;
}
export type JobData =
  | Job
  | Apply
  | Coordinates
  | Location
  | Country
  | Language
  | WorkSpaceMetaData
  | City
  | CityWorkSpaceMetaData
  | GeoLocation
  | Industry
  | Page
  | PageWorkSpaceMetaData
  | Information
  | Application;

export const allData: JobData[] = [];
