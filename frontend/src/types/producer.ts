import { Farm } from "./farm";

export type Producer = {
  id: string;
  document: string;
  name: string;
  farms: Farm[];
};
