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
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: string | null
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
          status: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          creator_id: string
          title: string
          content: string
          status?: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          creator_id?: string
          title?: string
          content?: string
          status?: string
          amount?: number
          created_at?: string
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