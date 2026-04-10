import { Machine } from "./Machine";

export interface Lab {
  id: string;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  availableSpots: number;
  imageUrl?: string;
  schedule?: string;
  available: boolean;
  machines: Machine[];
}