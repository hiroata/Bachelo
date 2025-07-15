export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      board_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      board_posts: {
        Row: {
          id: string
          category_id: string
          author_name: string
          author_email: string | null
          title: string
          content: string
          reply_count: number
          created_at: string
          updated_at: string
          ip_hash: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          category_id: string
          author_name: string
          author_email?: string | null
          title: string
          content: string
          reply_count?: number
          created_at?: string
          updated_at?: string
          ip_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          author_name?: string
          author_email?: string | null
          title?: string
          content?: string
          reply_count?: number
          created_at?: string
          updated_at?: string
          ip_hash?: string | null
          user_agent?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      voice_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          description: string | null
          audio_url: string | null
          duration_seconds: number | null
          play_count: number | null
          is_public: boolean | null
          tags: string[] | null
          likes_count: number | null
          comments_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          description?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          play_count?: number | null
          is_public?: boolean | null
          tags?: string[] | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          description?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          play_count?: number | null
          is_public?: boolean | null
          tags?: string[] | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: string | null
          tags: string[] | null
          price_per_10sec?: number | null
          average_delivery_hours?: number | null
          sample_voice_url?: string | null
          is_accepting_orders?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: string | null
          tags?: string[] | null
          price_per_10sec?: number | null
          average_delivery_hours?: number | null
          sample_voice_url?: string | null
          is_accepting_orders?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: string | null
          tags?: string[] | null
          price_per_10sec?: number | null
          average_delivery_hours?: number | null
          sample_voice_url?: string | null
          is_accepting_orders?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          amount: number
          platform_fee: number
          creator_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          amount: number
          platform_fee?: number
          creator_amount?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          amount?: number
          platform_fee?: number
          creator_amount?: number
          status?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          creator_id: string
          title: string
          content: string
          script?: string
          notes?: string
          audio_url?: string
          status: string
          amount: number
          price?: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          creator_id: string
          title: string
          content: string
          script?: string
          notes?: string
          audio_url?: string
          status?: string
          amount: number
          price?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          creator_id?: string
          title?: string
          content?: string
          script?: string
          notes?: string
          audio_url?: string
          status?: string
          amount?: number
          price?: number
          created_at?: string
        }
      }
      board_replies: {
        Row: {
          id: string
          post_id: string
          parent_reply_id: string | null
          author_name: string
          author_email: string | null
          content: string
          created_at: string
          ip_hash: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          post_id: string
          parent_reply_id?: string | null
          author_name: string
          author_email?: string | null
          content: string
          created_at?: string
          ip_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          parent_reply_id?: string | null
          author_name?: string
          author_email?: string | null
          content?: string
          created_at?: string
          ip_hash?: string | null
          user_agent?: string | null
        }
      }
      post_votes: {
        Row: {
          id: string
          post_id: string
          ip_hash: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          ip_hash: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          ip_hash?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      reply_votes: {
        Row: {
          id: string
          reply_id: string
          ip_hash: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          reply_id: string
          ip_hash: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          reply_id?: string
          ip_hash?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      anonymous_voice_posts: {
        Row: {
          id: string
          audio_url: string
          created_at: string
          ip_address: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          audio_url: string
          created_at?: string
          ip_address?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          audio_url?: string
          created_at?: string
          ip_address?: string | null
          tags?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}