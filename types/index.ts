export type Link = {
  name: string;
  icon?: string;
  to: string;
};

export type LinkGroup = {
  name: string;
  links: Link[];
};


export interface HohData {
  id: number;
  step: string;
  status: boolean;
  process: number;
  created_at: Date;
  updated_at: Date;
}