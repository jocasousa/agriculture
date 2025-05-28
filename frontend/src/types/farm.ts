import { Cultivation } from "./cultivation";

export type Farm = {
  id: string;
  name: string;
  city: string;
  state: string;
  totalArea: number;
  arableArea: number;
  vegetationArea: number;
  cultivations: Cultivation[];
};
