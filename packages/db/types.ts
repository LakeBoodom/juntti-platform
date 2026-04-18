// Auto-generated from Supabase schema. Do not edit manually.
// Regenerate via Supabase MCP or `supabase gen types typescript`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      celebrities: {
        Row: {
          bio_short: string | null
          birth_date: string
          created_at: string | null
          death_date: string | null
          id: string
          image_url: string | null
          name: string
          platform: string | null
          role: string
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_short?: string | null
          birth_date: string
          created_at?: string | null
          death_date?: string | null
          id?: string
          image_url?: string | null
          name: string
          platform?: string | null
          role: string
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_short?: string | null
          birth_date?: string
          created_at?: string | null
          death_date?: string | null
          id?: string
          image_url?: string | null
          name?: string
          platform?: string | null
          role?: string
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "celebrities_trivia_quiz_id_fkey"
            columns: ["trivia_quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      countdowns: {
        Row: {
          day: number
          id: string
          month: number
          name: string
          object_type: string
          platform: string | null
          slug: string
          trivia_quiz_id: string | null
        }
        Insert: {
          day: number
          id?: string
          month: number
          name: string
          object_type: string
          platform?: string | null
          slug: string
          trivia_quiz_id?: string | null
        }
        Update: {
          day?: number
          id?: string
          month?: number
          name?: string
          object_type?: string
          platform?: string | null
          slug?: string
          trivia_quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "countdowns_trivia_quiz_id_fkey"
            columns: ["trivia_quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_schedule: {
        Row: {
          date: string
          id: string
          platform: string
          quiz_id: string | null
        }
        Insert: {
          date: string
          id?: string
          platform: string
          quiz_id?: string | null
        }
        Update: {
          date?: string
          id?: string
          platform?: string
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_schedule_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      murresanat: {
        Row: {
          created_at: string | null
          definition: string
          display_date: string | null
          example: string | null
          id: string
          platform: string | null
          region: string
          word: string
        }
        Insert: {
          created_at?: string | null
          definition: string
          display_date?: string | null
          example?: string | null
          id?: string
          platform?: string | null
          region: string
          word: string
        }
        Update: {
          created_at?: string | null
          definition?: string
          display_date?: string | null
          example?: string | null
          id?: string
          platform?: string | null
          region?: string
          word?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answers: Json
          created_at: string | null
          explanation: string | null
          id: string
          question_text: string
          quiz_id: string | null
          sort_order: number
        }
        Insert: {
          answers: Json
          created_at?: string | null
          explanation?: string | null
          id?: string
          question_text: string
          quiz_id?: string | null
          sort_order?: number
        }
        Update: {
          answers?: Json
          created_at?: string | null
          explanation?: string | null
          id?: string
          question_text?: string
          quiz_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_plays: {
        Row: {
          id: string
          platform: string
          played_at: string | null
          quiz_id: string | null
          score: number | null
          session_id: string | null
          shared: boolean | null
          total: number | null
        }
        Insert: {
          id?: string
          platform: string
          played_at?: string | null
          quiz_id?: string | null
          score?: number | null
          session_id?: string | null
          shared?: boolean | null
          total?: number | null
        }
        Update: {
          id?: string
          platform?: string
          played_at?: string | null
          quiz_id?: string | null
          score?: number | null
          session_id?: string | null
          shared?: boolean | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_plays_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string
          emoji_hint: string | null
          id: string
          image_url: string | null
          is_daily: boolean | null
          platform: string
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          slug: string
          status: string
          target_age: string | null
          title: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: string
          emoji_hint?: string | null
          id?: string
          image_url?: string | null
          is_daily?: boolean | null
          platform: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          slug: string
          status?: string
          target_age?: string | null
          title: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          emoji_hint?: string | null
          id?: string
          image_url?: string | null
          is_daily?: boolean | null
          platform?: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          slug?: string
          status?: string
          target_age?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
