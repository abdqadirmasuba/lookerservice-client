export interface Service {
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
  services: Service[];
}
