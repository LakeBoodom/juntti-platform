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
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
          is_hero: boolean | null
          name: string
          platform: string | null
          priority: number | null
          role: string
          site_id: string | null
          slug: string | null
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
          is_hero?: boolean | null
          name: string
          platform?: string | null
          priority?: number | null
          role: string
          site_id?: string | null
          slug?: string | null
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
          is_hero?: boolean | null
          name?: string
          platform?: string | null
          priority?: number | null
          role?: string
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "celebrities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celebrities_trivia_quiz_id_fkey"
            columns: ["trivia_quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      celebrity_votes: {
        Row: {
          celebrity_id: string
          created_at: string | null
          id: string
          question_type: string
          session_id: string
          vote: string
          vote_date: string
        }
        Insert: {
          celebrity_id: string
          created_at?: string | null
          id?: string
          question_type: string
          session_id: string
          vote: string
          vote_date?: string
        }
        Update: {
          celebrity_id?: string
          created_at?: string | null
          id?: string
          question_type?: string
          session_id?: string
          vote?: string
          vote_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "celebrity_votes_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
        ]
      }
      countdown_quizzes: {
        Row: {
          countdown_id: string
          created_at: string
          id: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          countdown_id: string
          created_at?: string
          id?: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          countdown_id?: string
          created_at?: string
          id?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "countdown_quizzes_countdown_id_fkey"
            columns: ["countdown_id"]
            isOneToOne: false
            referencedRelation: "countdowns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "countdown_quizzes_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      countdowns: {
        Row: {
          day: number
          emoji: string | null
          ends_on: string | null
          id: string
          image_url: string | null
          month: number
          name: string
          object_type: string
          platform: string | null
          site_id: string | null
          slug: string
          starts_on: string | null
          tag: string | null
          trivia_quiz_id: string | null
        }
        Insert: {
          day: number
          emoji?: string | null
          ends_on?: string | null
          id?: string
          image_url?: string | null
          month: number
          name: string
          object_type: string
          platform?: string | null
          site_id?: string | null
          slug: string
          starts_on?: string | null
          tag?: string | null
          trivia_quiz_id?: string | null
        }
        Update: {
          day?: number
          emoji?: string | null
          ends_on?: string | null
          id?: string
          image_url?: string | null
          month?: number
          name?: string
          object_type?: string
          platform?: string | null
          site_id?: string | null
          slug?: string
          starts_on?: string | null
          tag?: string | null
          trivia_quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "countdowns_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
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
      kuvavisas: {
        Row: {
          active: boolean
          correct_option: string
          created_at: string
          difficulty: string | null
          fact: string | null
          id: string
          image_url: string
          options: Json
          question: string
          site_id: string
          tag: string | null
          type: string
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          correct_option: string
          created_at?: string
          difficulty?: string | null
          fact?: string | null
          id?: string
          image_url: string
          options: Json
          question: string
          site_id: string
          tag?: string | null
          type: string
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          fact?: string | null
          id?: string
          image_url?: string
          options?: Json
          question?: string
          site_id?: string
          tag?: string | null
          type?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "kuvavisas_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
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
          featured_in_category: boolean
          id: string
          image_url: string | null
          is_daily: boolean | null
          platform: string
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          site_id: string | null
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
          featured_in_category?: boolean
          id?: string
          image_url?: string | null
          is_daily?: boolean | null
          platform: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          site_id?: string | null
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
          featured_in_category?: boolean
          id?: string
          image_url?: string | null
          is_daily?: boolean | null
          platform?: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          site_id?: string | null
          slug?: string
          status?: string
          target_age?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_rules: {
        Row: {
          active: boolean
          content_id: string
          content_type: string
          created_at: string
          id: string
          scheduled_date: string | null
          site_id: string
          strategy: string
          tag: string | null
          weight: number
        }
        Insert: {
          active?: boolean
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          scheduled_date?: string | null
          site_id: string
          strategy: string
          tag?: string | null
          weight?: number
        }
        Update: {
          active?: boolean
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          scheduled_date?: string | null
          site_id?: string
          strategy?: string
          tag?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_rules_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
          theme_token: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
          theme_token?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
          theme_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      celebrity_vote_counts: {
        Row: {
          celebrity_id: string | null
          ei_tunnista_count: number | null
          ei_uppoa_count: number | null
          ihan_ok_count: number | null
          legenda_count: number | null
          question_type: string | null
          rakastan_count: number | null
          total_count: number | null
          tuttu_count: number | null
          vote_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "celebrity_votes_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
        ]
      }
      v_today_picks: {
        Row: {
          content_id: string | null
          content_type: string | null
          rule_id: string | null
          site_id: string | null
          strategy: string | null
          tag: string | null
          weight: number | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          rule_id?: string | null
          site_id?: string | null
          strategy?: string | null
          tag?: string | null
          weight?: number | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          rule_id?: string | null
          site_id?: string | null
          strategy?: string | null
          tag?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_rules_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      todays_celebrities: {
        Args: { p_site_id: string }
        Returns: {
          bio_short: string | null
          birth_date: string
          created_at: string | null
          death_date: string | null
          id: string
          image_url: string | null
          is_hero: boolean | null
          name: string
          platform: string | null
          priority: number | null
          role: string
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "celebrities"
          isOneToOne: false
          isSetofReturn: true
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
