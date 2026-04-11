export interface Machine {
  id: string;
  name: string;
  description?: string;
  labId?: string;
   status: string;
  Dernier_entretien?: string | null;

}