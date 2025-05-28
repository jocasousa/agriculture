export type Cultivation = {
  id: string;
  crop: string;
  season?: { id: string; year: number };
};
