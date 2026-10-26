// Tipos do schema "givance" no formato do `supabase gen types`.
// Regenerar depois de mudar o banco (com o schema exposto na Data API):
//   npm run gen:types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13'
  }
  givance: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          label?: string | null
          created_at?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          id: string
          lead_id: string
          type: string
          content: string
          occurred_at: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          content: string
          occurred_at?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          content?: string
          occurred_at?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'interactions_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          business_name: string | null
          whatsapp: string | null
          instagram: string | null
          city_region: string | null
          website_url: string | null
          preview_url: string | null
          segment: string | null
          segment_other: string | null
          needs: string[]
          has_website: boolean | null
          sells_on_instagram: boolean | null
          orders_via_whatsapp: boolean | null
          budget_range: string | null
          timeline: string | null
          source: string
          campaign_id: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          landing_page: string | null
          referrer: string | null
          device: string | null
          ip_hash: string | null
          consent_at: string | null
          consent_version: string | null
          stage_id: string
          stage_changed_at: string
          furthest_position: number
          lost_reason: string | null
          first_contact_at: string | null
          won_at: string | null
          lost_at: string | null
          estimated_value: number | null
          next_action: string | null
          next_action_at: string | null
          score: number
          temperature: string | null
          owner_id: string | null
          is_sample: boolean
          address: string | null
          google_place_id: string | null
          google_maps_url: string | null
          google_rating: number | null
          google_reviews: number | null
          google_category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          business_name?: string | null
          whatsapp?: string | null
          instagram?: string | null
          city_region?: string | null
          website_url?: string | null
          preview_url?: string | null
          segment?: string | null
          segment_other?: string | null
          needs?: string[]
          has_website?: boolean | null
          sells_on_instagram?: boolean | null
          orders_via_whatsapp?: boolean | null
          budget_range?: string | null
          timeline?: string | null
          source?: string
          campaign_id?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          landing_page?: string | null
          referrer?: string | null
          device?: string | null
          ip_hash?: string | null
          consent_at?: string | null
          consent_version?: string | null
          stage_id?: string
          stage_changed_at?: string
          furthest_position?: number
          lost_reason?: string | null
          first_contact_at?: string | null
          won_at?: string | null
          lost_at?: string | null
          estimated_value?: number | null
          next_action?: string | null
          next_action_at?: string | null
          score?: number
          owner_id?: string | null
          is_sample?: boolean
          address?: string | null
          google_place_id?: string | null
          google_maps_url?: string | null
          google_rating?: number | null
          google_reviews?: number | null
          google_category?: string | null
          temperature?: never
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          business_name?: string | null
          whatsapp?: string | null
          instagram?: string | null
          city_region?: string | null
          website_url?: string | null
          preview_url?: string | null
          segment?: string | null
          segment_other?: string | null
          needs?: string[]
          has_website?: boolean | null
          sells_on_instagram?: boolean | null
          orders_via_whatsapp?: boolean | null
          budget_range?: string | null
          timeline?: string | null
          source?: string
          campaign_id?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          landing_page?: string | null
          referrer?: string | null
          device?: string | null
          ip_hash?: string | null
          consent_at?: string | null
          consent_version?: string | null
          stage_id?: string
          stage_changed_at?: string
          furthest_position?: number
          lost_reason?: string | null
          first_contact_at?: string | null
          won_at?: string | null
          lost_at?: string | null
          estimated_value?: number | null
          next_action?: string | null
          next_action_at?: string | null
          score?: number
          owner_id?: string | null
          is_sample?: boolean
          address?: string | null
          google_place_id?: string | null
          google_maps_url?: string | null
          google_rating?: number | null
          google_reviews?: number | null
          google_category?: string | null
          temperature?: never
        }
        Relationships: [
          {
            foreignKeyName: 'leads_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_stage_id_fkey'
            columns: ['stage_id']
            isOneToOne: false
            referencedRelation: 'pipeline_stages'
            referencedColumns: ['id']
          },
        ]
      }
      message_templates: {
        Row: {
          id: string
          slug: string
          name: string
          body: string
          position: number
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          body: string
          position?: number
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          body?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          id: string
          name: string
          position: number
          kind: string
        }
        Insert: {
          id: string
          name: string
          position: number
          kind?: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          kind?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          key: string
          window_start: string
          count: number
        }
        Insert: {
          key: string
          window_start?: string
          count?: number
        }
        Update: {
          key?: string
          window_start?: string
          count?: number
        }
        Relationships: []
      }
      stage_history: {
        Row: {
          id: number
          lead_id: string
          from_stage: string | null
          to_stage: string
          changed_at: string
          changed_by: string | null
        }
        Insert: {
          id?: number
          lead_id: string
          from_stage?: string | null
          to_stage: string
          changed_at?: string
          changed_by?: string | null
        }
        Update: {
          id?: number
          lead_id?: string
          from_stage?: string | null
          to_stage?: string
          changed_at?: string
          changed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'stage_history_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stage_history_from_stage_fkey'
            columns: ['from_stage']
            isOneToOne: false
            referencedRelation: 'pipeline_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stage_history_to_stage_fkey'
            columns: ['to_stage']
            isOneToOne: false
            referencedRelation: 'pipeline_stages'
            referencedColumns: ['id']
          },
        ]
      }
      team_members: {
        Row: {
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_score: {
        Args: {
          p_budget: string
          p_needs: string[]
          p_orders_via_whatsapp: boolean
          p_sells_on_instagram: boolean
          p_timeline: string
        }
        Returns: number
      }
      dashboard_metrics: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      is_member: { Args: never; Returns: boolean }
      rate_limit_hit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type GivanceSchema = Database['givance']

export type Tables<T extends keyof GivanceSchema['Tables']> = GivanceSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof GivanceSchema['Tables']> = GivanceSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof GivanceSchema['Tables']> = GivanceSchema['Tables'][T]['Update']
