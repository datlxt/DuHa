export type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  store_name: string | null;
  phone: string | null;
  created_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  need: string | null;
  budget: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Tile = {
  id: string;
  user_id: string;
  tile_code: string;
  tile_name: string;
  size: string | null;
  surface: string | null;
  main_color: string | null;
  price_per_m2: number | null;
  stock_m2: number | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  customer_id: string | null;
  tile_id: string | null;
  project_name: string;
  room_type: string | null;
  style: string | null;
  room_image_url: string | null;
  tile_image_url: string | null;
  result_image_url: string | null;
  advice_text: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export type Quotation = {
  id: string;
  user_id: string;
  customer_id: string | null;
  project_id: string | null;
  tile_id: string | null;
  area_m2: number | null;
  price_per_m2: number | null;
  total_price: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCustomerInput = Omit<Customer, "id" | "user_id" | "created_at" | "updated_at">;
export type CreateTileInput = Omit<Tile, "id" | "user_id" | "created_at" | "updated_at">;
export type CreateProjectInput = Omit<Project, "id" | "user_id" | "created_at" | "updated_at">;
export type CreateQuotationInput = Omit<Quotation, "id" | "user_id" | "created_at" | "updated_at">;
