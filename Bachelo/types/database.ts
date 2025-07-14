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
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          role: 'creator' | 'client'
          price_per_10sec: number | null
          sample_voice_url: string | null
          tags: string[] | null
          is_accepting_orders: boolean
          average_delivery_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          role: 'creator' | 'client'
          price_per_10sec?: number | null
          sample_voice_url?: string | null
          tags?: string[] | null
          is_accepting_orders?: boolean
          average_delivery_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          role?: 'creator' | 'client'
          price_per_10sec?: number | null
          sample_voice_url?: string | null
          tags?: string[] | null
          is_accepting_orders?: boolean
          average_delivery_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          creator_id: string
          script: string
          notes: string | null
          price: number
          status: 'pending' | 'accepted' | 'recording' | 'delivered' | 'completed' | 'cancelled'
          audio_url: string | null
          delivered_at: string | null
          deadline: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          creator_id: string
          script: string
          notes?: string | null
          price: number
          status?: 'pending' | 'accepted' | 'recording' | 'delivered' | 'completed' | 'cancelled'
          audio_url?: string | null
          delivered_at?: string | null
          deadline?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          creator_id?: string
          script?: string
          notes?: string | null
          price?: number
          status?: 'pending' | 'accepted' | 'recording' | 'delivered' | 'completed' | 'cancelled'
          audio_url?: string | null
          delivered_at?: string | null
          deadline?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          order_id: string
          amount: number
          platform_fee: number
          creator_amount: number
          payment_provider: string
          payment_id: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          platform_fee: number
          creator_amount: number
          payment_provider: string
          payment_id: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          platform_fee?: number
          creator_amount?: number
          payment_provider?: string
          payment_id?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at?: string
        }
      }
      voice_posts: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          audio_url: string
          duration_seconds: number
          tags: string[] | null
          play_count: number
          like_count: number
          is_sample: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          audio_url: string
          duration_seconds: number
          tags?: string[] | null
          play_count?: number
          like_count?: number
          is_sample?: boolean
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          audio_url?: string
          duration_seconds?: number
          tags?: string[] | null
          play_count?: number
          like_count?: number
          is_sample?: boolean
          expires_at?: string
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      anonymous_voice_posts: {
        Row: {
          id: string
          nickname: string
          category: 'female' | 'male' | 'couple'
          message: string
          avatar_emoji: string
          avatar_color: string
          audio_url: string
          duration_seconds: number
          file_size_bytes: number
          mime_type: string
          likes_count: number
          comments_count: number
          play_count: number
          is_active: boolean
          ip_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nickname: string
          category: 'female' | 'male' | 'couple'
          message: string
          avatar_emoji: string
          avatar_color: string
          audio_url: string
          duration_seconds: number
          file_size_bytes: number
          mime_type: string
          likes_count?: number
          comments_count?: number
          play_count?: number
          is_active?: boolean
          ip_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          category?: 'female' | 'male' | 'couple'
          message?: string
          avatar_emoji?: string
          avatar_color?: string
          audio_url?: string
          duration_seconds?: number
          file_size_bytes?: number
          mime_type?: string
          likes_count?: number
          comments_count?: number
          play_count?: number
          is_active?: boolean
          ip_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      anonymous_post_comments: {
        Row: {
          id: string
          post_id: string
          nickname: string
          content: string
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          nickname: string
          content: string
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          nickname?: string
          content?: string
          ip_hash?: string | null
          created_at?: string
        }
      }
      anonymous_post_likes: {
        Row: {
          post_id: string
          ip_hash: string
          created_at: string
        }
        Insert: {
          post_id: string
          ip_hash: string
          created_at?: string
        }
        Update: {
          post_id?: string
          ip_hash?: string
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