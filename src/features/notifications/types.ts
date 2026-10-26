export type NewLeadNotification = {
  id: string;
  name: string;
  businessName: string | null;
  whatsapp: string | null;
  cityRegion: string | null;
  segment: string | null;
  needs: string[];
  budget: string | null;
  timeline: string | null;
  score: number;
  temperature: string | null;
  source: string;
  campaign: string | null;
  panelUrl: string;
};

/**
 * Ponto de extensão: cada canal implementa esta interface.
 * Para adicionar um novo canal (WhatsApp Cloud API, Z-API, Slack…),
 * crie um arquivo em ./channels e registre em ./index.ts.
 */
export interface NotificationChannel {
  name: string;
  isEnabled(): boolean;
  send(lead: NewLeadNotification): Promise<void>;
}
