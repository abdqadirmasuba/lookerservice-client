export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon_url: string | null;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url: string | null;
  sort_order: number;
  service_categories: ServiceCategory[];
}
