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
      _a2_kysymysvaihto_backup_2026_09_16: {
        Row: {
          answers: Json | null
          explanation: string | null
          id: string | null
          question_text: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          explanation?: string | null
          id?: string | null
          question_text?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          explanation?: string | null
          id?: string | null
          question_text?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _cheek_vainelamaa_backup_2026_09_24: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _derby_satakunta_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _derby_satakunta_quiz_backup_20261001: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _difficulty_backup_20260918: {
        Row: {
          correct_option: string | null
          difficulty: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          correct_option?: string | null
          difficulty?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          correct_option?: string | null
          difficulty?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      _difficulty_backup_20260918b: {
        Row: {
          correct_option: string | null
          difficulty: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          correct_option?: string | null
          difficulty?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          correct_option?: string | null
          difficulty?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      _e1_cel_backup_20260927: {
        Row: {
          bio_short: string | null
          birth_date: string | null
          created_at: string | null
          death_date: string | null
          id: string | null
          ig_tilit: string[] | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string | null
          platform: string | null
          priority: number | null
          role: string | null
          ryhma: string | null
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      _e1_q_backup_20260927: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _e1_quiz_backup_20260927: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _e2_cel_backup_20260927: {
        Row: {
          bio_short: string | null
          birth_date: string | null
          created_at: string | null
          death_date: string | null
          id: string | null
          ig_tilit: string[] | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string | null
          platform: string | null
          priority: number | null
          role: string | null
          ryhma: string | null
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      _e2_q_backup_20260927: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _e2_quiz_backup_20260927: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _e3_cel_backup_20260927: {
        Row: {
          bio_short: string | null
          birth_date: string | null
          created_at: string | null
          death_date: string | null
          id: string | null
          ig_tilit: string[] | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string | null
          platform: string | null
          priority: number | null
          role: string | null
          ryhma: string | null
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      _e3_q_backup_20260927: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _e3_quiz_backup_20260927: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _el_q_backup_20260926: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _el_quiz_backup_20260926: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _fact_backup_20260917: {
        Row: {
          fact: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          fact?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          fact?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _faq_page_content_backup_2026_09_16: {
        Row: {
          learn: Json | null
          slug: string | null
        }
        Insert: {
          learn?: Json | null
          slug?: string | null
        }
        Update: {
          learn?: Json | null
          slug?: string | null
        }
        Relationships: []
      }
      _fix_q_backup_20260925: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _fix_quiz_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _henk_q_backup_20260919: {
        Row: {
          answers: Json | null
          backed_up_at: string | null
          explanation: string | null
          id: string | null
          question_text: string | null
        }
        Insert: {
          answers?: Json | null
          backed_up_at?: string | null
          explanation?: string | null
          id?: string | null
          question_text?: string | null
        }
        Update: {
          answers?: Json | null
          backed_up_at?: string | null
          explanation?: string | null
          id?: string | null
          question_text?: string | null
        }
        Relationships: []
      }
      _henk_q5_backup2_20260919: {
        Row: {
          answers: Json | null
          backed_up_at: string | null
          explanation: string | null
          id: string | null
          question_text: string | null
        }
        Insert: {
          answers?: Json | null
          backed_up_at?: string | null
          explanation?: string | null
          id?: string | null
          question_text?: string | null
        }
        Update: {
          answers?: Json | null
          backed_up_at?: string | null
          explanation?: string | null
          id?: string | null
          question_text?: string | null
        }
        Relationships: []
      }
      _henk_z_backup_20260919: {
        Row: {
          backed_up_at: string | null
          description: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          backed_up_at?: string | null
          description?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          backed_up_at?: string | null
          description?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _henkilo_jan_backup_20260921: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _henkilo_jan_backup_20260921_v2: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _henkilo_jan_kielihuolto_backup_20260921: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _henkilo_jan_q_backup_20260921: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _henkilo_jan_q_backup_20260921_v2: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _historia_q_backup_20260924: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _historia_quiz_backup_20260924: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _hj_cel_backup_20260927: {
        Row: {
          bio_short: string | null
          birth_date: string | null
          created_at: string | null
          death_date: string | null
          id: string | null
          ig_tilit: string[] | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string | null
          platform: string | null
          priority: number | null
          role: string | null
          ryhma: string | null
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      _hj_q_backup_20260927: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _hj_quiz_backup_20260927: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _hk_cel_backup_20260924: {
        Row: {
          bio_short: string | null
          birth_date: string | null
          created_at: string | null
          death_date: string | null
          id: string | null
          ig_tilit: string[] | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string | null
          platform: string | null
          priority: number | null
          role: string | null
          ryhma: string | null
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_short?: string | null
          birth_date?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string | null
          platform?: string | null
          priority?: number | null
          role?: string | null
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      _hk_q_backup_20260924: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _hk_quiz_backup_20260924: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _hw_q_backup_20260929: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _jk_q_backup_20260925: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _jk_quiz_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _jp_plays_backup_20260926: {
        Row: {
          feedback: number | null
          id: string | null
          platform: string | null
          played_at: string | null
          quiz_id: string | null
          score: number | null
          session_id: string | null
          shared: boolean | null
          total: number | null
        }
        Insert: {
          feedback?: number | null
          id?: string | null
          platform?: string | null
          played_at?: string | null
          quiz_id?: string | null
          score?: number | null
          session_id?: string | null
          shared?: boolean | null
          total?: number | null
        }
        Update: {
          feedback?: number | null
          id?: string | null
          platform?: string | null
          played_at?: string | null
          quiz_id?: string | null
          score?: number | null
          session_id?: string | null
          shared?: boolean | null
          total?: number | null
        }
        Relationships: []
      }
      _jp_q_backup_20260925: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _jp_q_backup_20260926: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _jp_quiz_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _jp_quiz_backup_20260926: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _jp3_q_backup_20260927: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _jp3_quiz_backup_20260927: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _juhlat_collection_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _ka_q_backup_20260926: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _ka_quiz_backup_20260926: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _kaupungit_q_backup_20260923: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _kaupungit_quiz_backup_20260923: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _kh_elokuvat_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_historia_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_jaakiekko_q_backup_20260929: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_jalkapallo_q_backup_20260930: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_juhlat_q_backup_20260929: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_juhlat_quiz_backup_20260929: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _kh_juntti_q_backup_20261003: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_kaupungit_q_backup_20260929: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_kulttuuri_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_luonto_q_backup_20260929: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_matkakohteet_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_musiikki_q_backup_20260930: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_raikkonen_q_backup_20261002: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_tiede_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_tunnetut_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_tv_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _kh_urheilu_q_backup_20261001: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _krista_tags_backup_20260919: {
        Row: {
          backed_up_at: string | null
          id: string | null
          slug: string | null
          tags: string[] | null
        }
        Insert: {
          backed_up_at?: string | null
          id?: string | null
          slug?: string | null
          tags?: string[] | null
        }
        Update: {
          backed_up_at?: string | null
          id?: string | null
          slug?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      _ku_q_backup_20260924: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _ku_quiz_backup_20260924: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _leipoo_backup_20260919: {
        Row: {
          answers: Json | null
          explanation: string | null
          f1: string | null
          f2: string | null
          kind: string | null
          ref: string | null
        }
        Insert: {
          answers?: Json | null
          explanation?: string | null
          f1?: string | null
          f2?: string | null
          kind?: string | null
          ref?: string | null
        }
        Update: {
          answers?: Json | null
          explanation?: string | null
          f1?: string | null
          f2?: string | null
          kind?: string | null
          ref?: string | null
        }
        Relationships: []
      }
      _lu_q_backup_20260926: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _lu_quiz_backup_20260926: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _luonto_learn_backup_20260924: {
        Row: {
          id: string | null
          learn: Json | null
          title: string | null
        }
        Insert: {
          id?: string | null
          learn?: Json | null
          title?: string | null
        }
        Update: {
          id?: string | null
          learn?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      _luonto_q_backup_20260923: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _luonto_quiz_backup_20260923: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _masked_backup_20260919: {
        Row: {
          answers: Json | null
          explanation: string | null
          f1: string | null
          f2: string | null
          kind: string | null
          ref: string | null
          so: number | null
        }
        Insert: {
          answers?: Json | null
          explanation?: string | null
          f1?: string | null
          f2?: string | null
          kind?: string | null
          ref?: string | null
          so?: number | null
        }
        Update: {
          answers?: Json | null
          explanation?: string | null
          f1?: string | null
          f2?: string | null
          kind?: string | null
          ref?: string | null
          so?: number | null
        }
        Relationships: []
      }
      _mt_q_backup_20260924: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _mt_quiz_backup_20260924: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _mu1_q_backup_20260925: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _mu1_quiz_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _mu2_q_backup_20260925: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _mu2_quiz_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _nylonbeat_backup_20260919: {
        Row: {
          answers: Json | null
          explanation: string | null
          f1: string | null
          f2: string | null
          kind: string | null
          ref: string | null
        }
        Insert: {
          answers?: Json | null
          explanation?: string | null
          f1?: string | null
          f2?: string | null
          kind?: string | null
          ref?: string | null
        }
        Update: {
          answers?: Json | null
          explanation?: string | null
          f1?: string | null
          f2?: string | null
          kind?: string | null
          ref?: string | null
        }
        Relationships: []
      }
      _otsikko_a3_muutlajit_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_b_kaupungit_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_b_megat_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_c1_luonto_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_c2_kulttuuri_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_c3_elokuvat_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_c4_historia_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_d_henkilot_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _otsikko_e_maantieto_backup_2026_09_16: {
        Row: {
          display_title: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          display_title?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _oulu_visa_q_backup_20261004: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _oulu_visa_quiz_backup_20261004: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _pol_visat_q_backup_20261006: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _pol_visat_quiz_backup_20261006: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _pos_backup_20260924: {
        Row: {
          answers: Json | null
          category: string | null
          id: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          category?: string | null
          id?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          category?: string | null
          id?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _ti_q_backup_20260926: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
        }
        Relationships: []
      }
      _ti_quiz_backup_20260926: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _tiede_otsikot_backup_20260919: {
        Row: {
          backed_up_at: string | null
          emoji_hint: string | null
          id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          backed_up_at?: string | null
          emoji_hint?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          backed_up_at?: string | null
          emoji_hint?: string | null
          id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      _tiede_teknologia_image_url_backup_20260919: {
        Row: {
          backed_up_at: string | null
          id: string | null
          image_url: string | null
          slug: string | null
        }
        Insert: {
          backed_up_at?: string | null
          id?: string | null
          image_url?: string | null
          slug?: string | null
        }
        Update: {
          backed_up_at?: string | null
          id?: string | null
          image_url?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      _ttk_backup_20260919: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _ttk_quiz_backup_20260919: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _tv_q_backup_20260924: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _tv_quiz_backup_20260924: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _ur_q_backup_20260925: {
        Row: {
          answers: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          question_text: string | null
          quiz_id: string | null
          sort_order: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          question_text?: string | null
          quiz_id?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      _ur_quiz_backup_20260925: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean | null
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string | null
          ig_tilit: string[] | null
          image_url: string | null
          is_daily: boolean | null
          learn: Json | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string | null
          status: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean | null
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string | null
          ig_tilit?: string[] | null
          image_url?: string | null
          is_daily?: boolean | null
          learn?: Json | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string | null
          status?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      aanivisa_viikot: {
        Row: {
          aani_idt: string[]
          created_at: string
          id: string
          iso_viikko: number
          iso_vuosi: number
          ryhma: string
          site_id: string
        }
        Insert: {
          aani_idt: string[]
          created_at?: string
          id?: string
          iso_viikko: number
          iso_vuosi: number
          ryhma: string
          site_id: string
        }
        Update: {
          aani_idt?: string[]
          created_at?: string
          id?: string
          iso_viikko?: number
          iso_vuosi?: number
          ryhma?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aanivisa_viikot_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      aanivisat: {
        Row: {
          aani_havainto_url: string | null
          aani_lahde_url: string
          aani_lisenssi: string
          aani_maa: string | null
          aani_tekija: string
          aaniryhma: string | null
          aanityyppi: string | null
          active: boolean
          alt_answers: string[]
          audio_url: string
          created_at: string
          distractor_pool: Json
          fakta: string | null
          id: string
          jakso_s: number
          kesto_s: number | null
          kuva_lahde_url: string | null
          kuva_lisenssi: string | null
          kuva_tekija: string | null
          kuva_url: string | null
          laji: string
          ryhma: string
          similarity_group: string | null
          site_id: string
          sono_ticks: Json
          sono_url: string
          tauko_s: number
          tieteellinen: string | null
          tunniste: string
          updated_at: string
          vaikeus: string
        }
        Insert: {
          aani_havainto_url?: string | null
          aani_lahde_url: string
          aani_lisenssi: string
          aani_maa?: string | null
          aani_tekija: string
          aaniryhma?: string | null
          aanityyppi?: string | null
          active?: boolean
          alt_answers?: string[]
          audio_url: string
          created_at?: string
          distractor_pool?: Json
          fakta?: string | null
          id?: string
          jakso_s: number
          kesto_s?: number | null
          kuva_lahde_url?: string | null
          kuva_lisenssi?: string | null
          kuva_tekija?: string | null
          kuva_url?: string | null
          laji: string
          ryhma: string
          similarity_group?: string | null
          site_id: string
          sono_ticks?: Json
          sono_url: string
          tauko_s?: number
          tieteellinen?: string | null
          tunniste: string
          updated_at?: string
          vaikeus: string
        }
        Update: {
          aani_havainto_url?: string | null
          aani_lahde_url?: string
          aani_lisenssi?: string
          aani_maa?: string | null
          aani_tekija?: string
          aaniryhma?: string | null
          aanityyppi?: string | null
          active?: boolean
          alt_answers?: string[]
          audio_url?: string
          created_at?: string
          distractor_pool?: Json
          fakta?: string | null
          id?: string
          jakso_s?: number
          kesto_s?: number | null
          kuva_lahde_url?: string | null
          kuva_lisenssi?: string | null
          kuva_tekija?: string | null
          kuva_url?: string | null
          laji?: string
          ryhma?: string
          similarity_group?: string | null
          site_id?: string
          sono_ticks?: Json
          sono_url?: string
          tauko_s?: number
          tieteellinen?: string | null
          tunniste?: string
          updated_at?: string
          vaikeus?: string
        }
        Relationships: [
          {
            foreignKeyName: "aanivisat_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      celebrities: {
        Row: {
          bio_intro: string | null
          bio_short: string | null
          birth_date: string
          birth_place: string | null
          created_at: string | null
          death_date: string | null
          death_place: string | null
          facts: Json | null
          facts_reviewed_at: string | null
          id: string
          ig_tilit: string[]
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string
          nickname: string | null
          nimi_elatiivi: string | null
          paivan_sankari: boolean
          platform: string | null
          politiikka_roolit: string[] | null
          priority: number | null
          role: string
          ryhma: string | null
          site_id: string | null
          slug: string | null
          trivia_quiz_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          bio_intro?: string | null
          bio_short?: string | null
          birth_date: string
          birth_place?: string | null
          created_at?: string | null
          death_date?: string | null
          death_place?: string | null
          facts?: Json | null
          facts_reviewed_at?: string | null
          id?: string
          ig_tilit?: string[]
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name: string
          nickname?: string | null
          nimi_elatiivi?: string | null
          paivan_sankari?: boolean
          platform?: string | null
          politiikka_roolit?: string[] | null
          priority?: number | null
          role: string
          ryhma?: string | null
          site_id?: string | null
          slug?: string | null
          trivia_quiz_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          bio_intro?: string | null
          bio_short?: string | null
          birth_date?: string
          birth_place?: string | null
          created_at?: string | null
          death_date?: string | null
          death_place?: string | null
          facts?: Json | null
          facts_reviewed_at?: string | null
          id?: string
          ig_tilit?: string[]
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_url?: string | null
          intro_text?: string | null
          is_hero?: boolean | null
          laji?: string | null
          name?: string
          nickname?: string | null
          nimi_elatiivi?: string | null
          paivan_sankari?: boolean
          platform?: string | null
          politiikka_roolit?: string[] | null
          priority?: number | null
          role?: string
          ryhma?: string | null
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
            referencedRelation: "quiz_cards"
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
      celebrity_related_quizzes: {
        Row: {
          celebrity_id: string
          created_at: string
          quiz_id: string
          reason: string
          score: number
        }
        Insert: {
          celebrity_id: string
          created_at?: string
          quiz_id: string
          reason?: string
          score: number
        }
        Update: {
          celebrity_id?: string
          created_at?: string
          quiz_id?: string
          reason?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "celebrity_related_quizzes_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celebrity_related_quizzes_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celebrity_related_quizzes_quiz_id_fkey"
            columns: ["quiz_id"]
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
            referencedRelation: "quiz_cards"
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
            referencedRelation: "quiz_cards"
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
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_schedule_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_decks: {
        Row: {
          category: string
          created_at: string
          deck_date: string | null
          id: string
          site_id: string
          slug: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          deck_date?: string | null
          id?: string
          site_id: string
          slug: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          deck_date?: string | null
          id?: string
          site_id?: string
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_decks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_knockout_battles: {
        Row: {
          battle_index: number
          created_at: string
          id: string
          knockout_session_id: string
          option_a_id: string
          option_b_id: string
          round: number
          winner_option_id: string
        }
        Insert: {
          battle_index: number
          created_at?: string
          id?: string
          knockout_session_id: string
          option_a_id: string
          option_b_id: string
          round: number
          winner_option_id: string
        }
        Update: {
          battle_index?: number
          created_at?: string
          id?: string
          knockout_session_id?: string
          option_a_id?: string
          option_b_id?: string
          round?: number
          winner_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_knockout_battles_knockout_session_id_fkey"
            columns: ["knockout_session_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_option_a_id_fkey"
            columns: ["option_a_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_option_stats"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_option_a_id_fkey"
            columns: ["option_a_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_option_b_id_fkey"
            columns: ["option_b_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_option_stats"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_option_b_id_fkey"
            columns: ["option_b_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_winner_option_id_fkey"
            columns: ["winner_option_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_option_stats"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_winner_option_id_fkey"
            columns: ["winner_option_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_options"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_knockout_options: {
        Row: {
          accent_color: string
          bg_color: string
          created_at: string
          id: string
          image_url: string | null
          knockout_id: string
          label: string
          label_genitive: string | null
          letter: string
          position: number
        }
        Insert: {
          accent_color: string
          bg_color: string
          created_at?: string
          id?: string
          image_url?: string | null
          knockout_id: string
          label: string
          label_genitive?: string | null
          letter: string
          position: number
        }
        Update: {
          accent_color?: string
          bg_color?: string
          created_at?: string
          id?: string
          image_url?: string | null
          knockout_id?: string
          label?: string
          label_genitive?: string | null
          letter?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_knockout_options_knockout_id_fkey"
            columns: ["knockout_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockouts"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_knockout_sessions: {
        Row: {
          completed_at: string
          id: string
          knockout_id: string
          seed: string
          session_id: string
          winner_option_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          knockout_id: string
          seed: string
          session_id: string
          winner_option_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          knockout_id?: string
          seed?: string
          session_id?: string
          winner_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_knockout_sessions_knockout_id_fkey"
            columns: ["knockout_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diggaa_knockout_sessions_winner_option_id_fkey"
            columns: ["winner_option_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_option_stats"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "diggaa_knockout_sessions_winner_option_id_fkey"
            columns: ["winner_option_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_options"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_knockouts: {
        Row: {
          category: string
          created_at: string
          id: string
          knockout_date: string | null
          question: string
          site_id: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          knockout_date?: string | null
          question: string
          site_id: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          knockout_date?: string | null
          question?: string
          site_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_knockouts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_polls: {
        Row: {
          category: string
          closes_at: string | null
          created_at: string
          id: string
          option_a: string
          option_b: string
          poll_date: string | null
          question: string
          site_id: string
        }
        Insert: {
          category: string
          closes_at?: string | null
          created_at?: string
          id?: string
          option_a: string
          option_b: string
          poll_date?: string | null
          question: string
          site_id: string
        }
        Update: {
          category?: string
          closes_at?: string | null
          created_at?: string
          id?: string
          option_a?: string
          option_b?: string
          poll_date?: string | null
          question?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_polls_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_publications: {
        Row: {
          closes_at: string
          content_id: string
          content_type: string
          created_at: string
          duration_preset: string
          featured: boolean
          id: string
          opens_at: string
          site_id: string
          status: string
          title: string
        }
        Insert: {
          closes_at: string
          content_id: string
          content_type: string
          created_at?: string
          duration_preset?: string
          featured?: boolean
          id?: string
          opens_at: string
          site_id: string
          status?: string
          title: string
        }
        Update: {
          closes_at?: string
          content_id?: string
          content_type?: string
          created_at?: string
          duration_preset?: string
          featured?: boolean
          id?: string
          opens_at?: string
          site_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_publications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_swipe_cards: {
        Row: {
          card_type: string
          created_at: string
          deck_id: string
          emblem: string | null
          id: string
          image_url: string | null
          kicker: string | null
          position: number
          subtitle: string | null
          title: string
        }
        Insert: {
          card_type?: string
          created_at?: string
          deck_id: string
          emblem?: string | null
          id?: string
          image_url?: string | null
          kicker?: string | null
          position: number
          subtitle?: string | null
          title: string
        }
        Update: {
          card_type?: string
          created_at?: string
          deck_id?: string
          emblem?: string | null
          id?: string
          image_url?: string | null
          kicker?: string | null
          position?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_swipe_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "diggaa_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_swipe_votes: {
        Row: {
          card_id: string
          choice: string
          id: string
          session_id: string
          voted_at: string
        }
        Insert: {
          card_id: string
          choice: string
          id?: string
          session_id: string
          voted_at?: string
        }
        Update: {
          card_id?: string
          choice?: string
          id?: string
          session_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_swipe_votes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "diggaa_swipe_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_votes: {
        Row: {
          choice: string
          id: string
          poll_id: string
          session_id: string
          voted_at: string
        }
        Insert: {
          choice: string
          id?: string
          poll_id: string
          session_id: string
          voted_at?: string
        }
        Update: {
          choice?: string
          id?: string
          poll_id?: string
          session_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "diggaa_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_pair_blocks: {
        Row: {
          attr_key: string
          created_at: string | null
          entity_a: string
          entity_b: string
          reason: string | null
        }
        Insert: {
          attr_key: string
          created_at?: string | null
          entity_a: string
          entity_b: string
          reason?: string | null
        }
        Update: {
          attr_key?: string
          created_at?: string | null
          entity_a?: string
          entity_b?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_pair_blocks_entity_a_fkey"
            columns: ["entity_a"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_pair_blocks_entity_b_fkey"
            columns: ["entity_b"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_pair_stats: {
        Row: {
          attr_key: string
          correct: number
          entity_a: string
          entity_b: string
          shown: number
          updated_at: string | null
        }
        Insert: {
          attr_key: string
          correct?: number
          entity_a: string
          entity_b: string
          shown?: number
          updated_at?: string | null
        }
        Update: {
          attr_key?: string
          correct?: number
          entity_a?: string
          entity_b?: string
          shown?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_pair_stats_entity_a_fkey"
            columns: ["entity_a"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_pair_stats_entity_b_fkey"
            columns: ["entity_b"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_attribute_defs: {
        Row: {
          attr_key: string
          compare_mode: string
          easy_gap: number | null
          enabled: boolean
          fact_template: string | null
          flag_difficulty: string
          gap_divisor: number
          gap_mode: string
          jarjesta_title: string | null
          kind: string
          max_domain_distance: number
          max_gap: number | null
          mid_gap: number | null
          min_gap: number | null
          question_text: string
          rank_label: string | null
          rank_label_rev: string | null
          subject_label: string
          theme: string
          unit_label: string | null
          winner: string
        }
        Insert: {
          attr_key: string
          compare_mode?: string
          easy_gap?: number | null
          enabled?: boolean
          fact_template?: string | null
          flag_difficulty?: string
          gap_divisor?: number
          gap_mode?: string
          jarjesta_title?: string | null
          kind: string
          max_domain_distance?: number
          max_gap?: number | null
          mid_gap?: number | null
          min_gap?: number | null
          question_text: string
          rank_label?: string | null
          rank_label_rev?: string | null
          subject_label?: string
          theme?: string
          unit_label?: string | null
          winner: string
        }
        Update: {
          attr_key?: string
          compare_mode?: string
          easy_gap?: number | null
          enabled?: boolean
          fact_template?: string | null
          flag_difficulty?: string
          gap_divisor?: number
          gap_mode?: string
          jarjesta_title?: string | null
          kind?: string
          max_domain_distance?: number
          max_gap?: number | null
          mid_gap?: number | null
          min_gap?: number | null
          question_text?: string
          rank_label?: string | null
          rank_label_rev?: string | null
          subject_label?: string
          theme?: string
          unit_label?: string | null
          winner?: string
        }
        Relationships: []
      }
      fact_attributes: {
        Row: {
          as_of: string | null
          attr_key: string
          display_value: string | null
          entity_id: string
          next_review_at: string | null
          num_value: number | null
          scope: string
          source: string | null
          text_value: string | null
          verified_at: string | null
          volatility: string
        }
        Insert: {
          as_of?: string | null
          attr_key: string
          display_value?: string | null
          entity_id: string
          next_review_at?: string | null
          num_value?: number | null
          scope?: string
          source?: string | null
          text_value?: string | null
          verified_at?: string | null
          volatility?: string
        }
        Update: {
          as_of?: string | null
          attr_key?: string
          display_value?: string | null
          entity_id?: string
          next_review_at?: string | null
          num_value?: number | null
          scope?: string
          source?: string | null
          text_value?: string | null
          verified_at?: string | null
          volatility?: string
        }
        Relationships: [
          {
            foreignKeyName: "duel_attributes_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_entities: {
        Row: {
          celebrity_id: string | null
          created_at: string | null
          domain: string | null
          id: string
          image_credit: string | null
          image_url: string | null
          kind: string
          lat: number | null
          lon: number | null
          name: string
          name_partitive: string | null
          prominence: number | null
          role_label: string | null
          show_role: boolean
          status: string
          updated_at: string | null
          wiki_url: string | null
          wikidata_id: string | null
        }
        Insert: {
          celebrity_id?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          image_credit?: string | null
          image_url?: string | null
          kind: string
          lat?: number | null
          lon?: number | null
          name: string
          name_partitive?: string | null
          prominence?: number | null
          role_label?: string | null
          show_role?: boolean
          status?: string
          updated_at?: string | null
          wiki_url?: string | null
          wikidata_id?: string | null
        }
        Update: {
          celebrity_id?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          image_credit?: string | null
          image_url?: string | null
          kind?: string
          lat?: number | null
          lon?: number | null
          name?: string
          name_partitive?: string | null
          prominence?: number | null
          role_label?: string | null
          show_role?: boolean
          status?: string
          updated_at?: string | null
          wiki_url?: string | null
          wikidata_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_entities_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_relationships: {
        Row: {
          created_at: string | null
          detail: string | null
          from_entity: string
          id: string
          rel_type: string
          season_from: string | null
          season_to: string | null
          source: string | null
          to_entity: string
          verified_at: string | null
          volatility: string
        }
        Insert: {
          created_at?: string | null
          detail?: string | null
          from_entity: string
          id?: string
          rel_type: string
          season_from?: string | null
          season_to?: string | null
          source?: string | null
          to_entity: string
          verified_at?: string | null
          volatility?: string
        }
        Update: {
          created_at?: string | null
          detail?: string | null
          from_entity?: string
          id?: string
          rel_type?: string
          season_from?: string | null
          season_to?: string | null
          source?: string | null
          to_entity?: string
          verified_at?: string | null
          volatility?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_relationships_from_entity_fkey"
            columns: ["from_entity"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_relationships_to_entity_fkey"
            columns: ["to_entity"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          collection: string
          genre_key: string
          label: string
          sort_order: number | null
        }
        Insert: {
          collection: string
          genre_key: string
          label: string
          sort_order?: number | null
        }
        Update: {
          collection?: string
          genre_key?: string
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      ig_ajastin: {
        Row: {
          avain: string
          id: number
        }
        Insert: {
          avain?: string
          id?: number
        }
        Update: {
          avain?: string
          id?: number
        }
        Relationships: []
      }
      ig_asetukset: {
        Row: {
          automaattinen: boolean
          omat_klo: string
          site_id: string
          synttarit_klo: string
          synttarit_paalla: boolean
          updated_at: string
          visa_klo: string
          visa_paalla: boolean
        }
        Insert: {
          automaattinen?: boolean
          omat_klo?: string
          site_id: string
          synttarit_klo?: string
          synttarit_paalla?: boolean
          updated_at?: string
          visa_klo?: string
          visa_paalla?: boolean
        }
        Update: {
          automaattinen?: boolean
          omat_klo?: string
          site_id?: string
          synttarit_klo?: string
          synttarit_paalla?: boolean
          updated_at?: string
          visa_klo?: string
          visa_paalla?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ig_asetukset_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_julkaisut: {
        Row: {
          celebrity_id: string | null
          created_at: string
          id: string
          ig_media_id: string | null
          ig_permalink: string | null
          ig_tilastot: Json | null
          julkaistu_at: string | null
          kampanja: string | null
          kentat: Json
          kokoelma: string | null
          kuva_urls: string[] | null
          kuvateksti: string | null
          muoto: string
          on_kuva: boolean
          paiva: string
          pohja: string
          pohja_valittu_kasin: boolean
          pohja_vari: string | null
          quiz_id: string | null
          site_id: string
          slotti: string
          tila: string
          tilastot_at: string | null
          updated_at: string
          virhe: string | null
        }
        Insert: {
          celebrity_id?: string | null
          created_at?: string
          id?: string
          ig_media_id?: string | null
          ig_permalink?: string | null
          ig_tilastot?: Json | null
          julkaistu_at?: string | null
          kampanja?: string | null
          kentat?: Json
          kokoelma?: string | null
          kuva_urls?: string[] | null
          kuvateksti?: string | null
          muoto?: string
          on_kuva?: boolean
          paiva: string
          pohja: string
          pohja_valittu_kasin?: boolean
          pohja_vari?: string | null
          quiz_id?: string | null
          site_id: string
          slotti: string
          tila?: string
          tilastot_at?: string | null
          updated_at?: string
          virhe?: string | null
        }
        Update: {
          celebrity_id?: string | null
          created_at?: string
          id?: string
          ig_media_id?: string | null
          ig_permalink?: string | null
          ig_tilastot?: Json | null
          julkaistu_at?: string | null
          kampanja?: string | null
          kentat?: Json
          kokoelma?: string | null
          kuva_urls?: string[] | null
          kuvateksti?: string | null
          muoto?: string
          on_kuva?: boolean
          paiva?: string
          pohja?: string
          pohja_valittu_kasin?: boolean
          pohja_vari?: string | null
          quiz_id?: string | null
          site_id?: string
          slotti?: string
          tila?: string
          tilastot_at?: string | null
          updated_at?: string
          virhe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ig_julkaisut_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ig_julkaisut_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ig_julkaisut_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ig_julkaisut_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_juontajakuvat: {
        Row: {
          aktiivinen: boolean
          asento: string
          created_at: string
          id: string
          korkeus: number | null
          kuka: string
          kuvaus: string | null
          leveys: number | null
          tausta: string
          url: string
        }
        Insert: {
          aktiivinen?: boolean
          asento: string
          created_at?: string
          id?: string
          korkeus?: number | null
          kuka: string
          kuvaus?: string | null
          leveys?: number | null
          tausta?: string
          url: string
        }
        Update: {
          aktiivinen?: boolean
          asento?: string
          created_at?: string
          id?: string
          korkeus?: number | null
          kuka?: string
          kuvaus?: string | null
          leveys?: number | null
          tausta?: string
          url?: string
        }
        Relationships: []
      }
      ig_mittaus: {
        Row: {
          julkaisu: string
          maara: number
          paiva: string
          tapahtuma: string
        }
        Insert: {
          julkaisu: string
          maara?: number
          paiva: string
          tapahtuma: string
        }
        Update: {
          julkaisu?: string
          maara?: number
          paiva?: string
          tapahtuma?: string
        }
        Relationships: []
      }
      ig_yhteys: {
        Row: {
          access_token: string
          ig_user_id: string
          kayttajanimi: string | null
          oikeudet: string | null
          paivitetty_at: string
          site_id: string
          token_vanhenee: string
          yhdistetty_at: string
        }
        Insert: {
          access_token: string
          ig_user_id: string
          kayttajanimi?: string | null
          oikeudet?: string | null
          paivitetty_at?: string
          site_id: string
          token_vanhenee: string
          yhdistetty_at?: string
        }
        Update: {
          access_token?: string
          ig_user_id?: string
          kayttajanimi?: string | null
          oikeudet?: string | null
          paivitetty_at?: string
          site_id?: string
          token_vanhenee?: string
          yhdistetty_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_yhteys_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      kunnat: {
        Row: {
          code: string
          created_at: string
          freshwarea_km2: number | null
          geom: unknown
          landarea_km2: number | null
          maakunta: string
          name_fi: string
          name_sv: string | null
          seawarea_km2: number | null
          source: string | null
          totalarea_km2: number | null
          vaakuna_license: string | null
          vaakuna_source: string | null
          vaakuna_url: string | null
        }
        Insert: {
          code: string
          created_at?: string
          freshwarea_km2?: number | null
          geom: unknown
          landarea_km2?: number | null
          maakunta: string
          name_fi: string
          name_sv?: string | null
          seawarea_km2?: number | null
          source?: string | null
          totalarea_km2?: number | null
          vaakuna_license?: string | null
          vaakuna_source?: string | null
          vaakuna_url?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          freshwarea_km2?: number | null
          geom?: unknown
          landarea_km2?: number | null
          maakunta?: string
          name_fi?: string
          name_sv?: string | null
          seawarea_km2?: number | null
          source?: string | null
          totalarea_km2?: number | null
          vaakuna_license?: string | null
          vaakuna_source?: string | null
          vaakuna_url?: string | null
        }
        Relationships: []
      }
      kuntaliitos_pelit: {
        Row: {
          id: string
          kunnat: string[]
          maakunta: string | null
          oikein: number
          paivan_reitti: boolean
          played_at: string
          session_id: string | null
          siemen: string
          yritys: number
        }
        Insert: {
          id?: string
          kunnat: string[]
          maakunta?: string | null
          oikein: number
          paivan_reitti?: boolean
          played_at?: string
          session_id?: string | null
          siemen: string
          yritys: number
        }
        Update: {
          id?: string
          kunnat?: string[]
          maakunta?: string | null
          oikein?: number
          paivan_reitti?: boolean
          played_at?: string
          session_id?: string | null
          siemen?: string
          yritys?: number
        }
        Relationships: []
      }
      kuntien_rajat: {
        Row: {
          accepted: boolean
          border_type: string
          created_at: string
          id: string
          kunta_a: string
          kunta_b: string
          note: string | null
          reviewed_at: string | null
          source: string | null
        }
        Insert: {
          accepted?: boolean
          border_type?: string
          created_at?: string
          id?: string
          kunta_a: string
          kunta_b: string
          note?: string | null
          reviewed_at?: string | null
          source?: string | null
        }
        Update: {
          accepted?: boolean
          border_type?: string
          created_at?: string
          id?: string
          kunta_a?: string
          kunta_b?: string
          note?: string | null
          reviewed_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kuntien_rajat_kunta_a_fkey"
            columns: ["kunta_a"]
            isOneToOne: false
            referencedRelation: "kunnat"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "kuntien_rajat_kunta_b_fkey"
            columns: ["kunta_b"]
            isOneToOne: false
            referencedRelation: "kunnat"
            referencedColumns: ["code"]
          },
        ]
      }
      kuvavisa_haasteet: {
        Row: {
          created_at: string
          haastajan_oikein: number
          haastajan_pisteet: number
          koodi: string
          kuva_idt: string[]
          kuvavisa: string
          kysymyksia: number
          maanosa: string | null
          site_id: string
          taso: string | null
        }
        Insert: {
          created_at?: string
          haastajan_oikein: number
          haastajan_pisteet?: number
          koodi: string
          kuva_idt: string[]
          kuvavisa: string
          kysymyksia: number
          maanosa?: string | null
          site_id: string
          taso?: string | null
        }
        Update: {
          created_at?: string
          haastajan_oikein?: number
          haastajan_pisteet?: number
          koodi?: string
          kuva_idt?: string[]
          kuvavisa?: string
          kysymyksia?: number
          maanosa?: string | null
          site_id?: string
          taso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kuvavisa_haasteet_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      kuvavisa_viikot: {
        Row: {
          created_at: string
          id: string
          iso_viikko: number
          iso_vuosi: number
          kuva_idt: string[]
          site_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          iso_viikko: number
          iso_vuosi: number
          kuva_idt: string[]
          site_id: string
        }
        Update: {
          created_at?: string
          id?: string
          iso_viikko?: number
          iso_vuosi?: number
          kuva_idt?: string[]
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuvavisa_viikot_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      kuvavisas: {
        Row: {
          active: boolean
          alt_answers: string[] | null
          correct_option: string
          created_at: string
          difficulty: string | null
          distractor_pool: Json | null
          fact: string | null
          hint: string | null
          id: string
          image_url: string
          license_note: string | null
          options: Json
          question: string
          reviewed_at: string | null
          similarity_group: string | null
          site_id: string
          sort_order: number
          source_credit: string | null
          tag: string | null
          tags: string[] | null
          type: string
          updated_at: string
          variant: string | null
          weight: number
        }
        Insert: {
          active?: boolean
          alt_answers?: string[] | null
          correct_option: string
          created_at?: string
          difficulty?: string | null
          distractor_pool?: Json | null
          fact?: string | null
          hint?: string | null
          id?: string
          image_url: string
          license_note?: string | null
          options: Json
          question: string
          reviewed_at?: string | null
          similarity_group?: string | null
          site_id: string
          sort_order?: number
          source_credit?: string | null
          tag?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string
          variant?: string | null
          weight?: number
        }
        Update: {
          active?: boolean
          alt_answers?: string[] | null
          correct_option?: string
          created_at?: string
          difficulty?: string | null
          distractor_pool?: Json | null
          fact?: string | null
          hint?: string | null
          id?: string
          image_url?: string
          license_note?: string | null
          options?: Json
          question?: string
          reviewed_at?: string | null
          similarity_group?: string | null
          site_id?: string
          sort_order?: number
          source_credit?: string | null
          tag?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          variant?: string | null
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
      maat: {
        Row: {
          code: string
          continent: string
          created_at: string
          land_border_count: number
          name_fi: string
          source: string | null
        }
        Insert: {
          code: string
          continent: string
          created_at?: string
          land_border_count?: number
          name_fi: string
          source?: string | null
        }
        Update: {
          code?: string
          continent?: string
          created_at?: string
          land_border_count?: number
          name_fi?: string
          source?: string | null
        }
        Relationships: []
      }
      maiden_rajat: {
        Row: {
          accepted: boolean
          border_type: string
          country_a: string
          country_b: string
          created_at: string
          id: string
          note: string | null
          reviewed_at: string | null
          source: string | null
        }
        Insert: {
          accepted?: boolean
          border_type?: string
          country_a: string
          country_b: string
          created_at?: string
          id?: string
          note?: string | null
          reviewed_at?: string | null
          source?: string | null
        }
        Update: {
          accepted?: boolean
          border_type?: string
          country_a?: string
          country_b?: string
          created_at?: string
          id?: string
          note?: string | null
          reviewed_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maiden_rajat_country_a_fkey"
            columns: ["country_a"]
            isOneToOne: false
            referencedRelation: "maat"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "maiden_rajat_country_b_fkey"
            columns: ["country_b"]
            isOneToOne: false
            referencedRelation: "maat"
            referencedColumns: ["code"]
          },
        ]
      }
      mega_questions: {
        Row: {
          id: string
          kuvavisa_id: string | null
          mega_quiz_id: string
          question_id: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          kuvavisa_id?: string | null
          mega_quiz_id: string
          question_id?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          kuvavisa_id?: string | null
          mega_quiz_id?: string
          question_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "mega_questions_kuvavisa_id_fkey"
            columns: ["kuvavisa_id"]
            isOneToOne: false
            referencedRelation: "kuvavisas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mega_questions_mega_quiz_id_fkey"
            columns: ["mega_quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mega_questions_mega_quiz_id_fkey"
            columns: ["mega_quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mega_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
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
      page_content: {
        Row: {
          kind: string
          learn: Json | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          timeline: Json | null
          updated_at: string
        }
        Insert: {
          kind: string
          learn?: Json | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          timeline?: Json | null
          updated_at?: string
        }
        Update: {
          kind?: string
          learn?: Json | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          timeline?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      paivan_nosto_tilasto: {
        Row: {
          intro_tila: string | null
          kategoria: string | null
          klikkaukset: number
          naytot: number
          paiva: string
          quiz_id: string
          slotti: string
        }
        Insert: {
          intro_tila?: string | null
          kategoria?: string | null
          klikkaukset?: number
          naytot?: number
          paiva: string
          quiz_id: string
          slotti: string
        }
        Update: {
          intro_tila?: string | null
          kategoria?: string | null
          klikkaukset?: number
          naytot?: number
          paiva?: string
          quiz_id?: string
          slotti?: string
        }
        Relationships: [
          {
            foreignKeyName: "paivan_nosto_tilasto_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paivan_nosto_tilasto_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          animal_sound: Json | null
          answers: Json
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string
          question_type: string
          quiz_id: string | null
          sort_order: number
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers: Json
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text: string
          question_type?: string
          quiz_id?: string | null
          sort_order?: number
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string
          question_type?: string
          quiz_id?: string | null
          sort_order?: number
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
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
          feedback: number | null
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
          feedback?: number | null
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
          feedback?: number | null
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
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
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
          collection: string | null
          created_at: string | null
          created_by: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string
          display_title: string | null
          emoji_hint: string | null
          era: string | null
          fanitasot: Json | null
          featured_in_category: boolean
          game_mode: string | null
          genre: string | null
          hero_alt: string | null
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          hero_side: string | null
          id: string
          ig_tilit: string[]
          image_url: string | null
          is_daily: boolean | null
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string | null
          slug: string
          status: string
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty: string
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string
          ig_tilit?: string[]
          image_url?: string | null
          is_daily?: boolean | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug: string
          status?: string
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          collection?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string
          display_title?: string | null
          emoji_hint?: string | null
          era?: string | null
          fanitasot?: Json | null
          featured_in_category?: boolean
          game_mode?: string | null
          genre?: string | null
          hero_alt?: string | null
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          hero_side?: string | null
          id?: string
          ig_tilit?: string[]
          image_url?: string | null
          is_daily?: boolean | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string | null
          slug?: string
          status?: string
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
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
      rajanaapurit_pelit: {
        Row: {
          id: string
          maanosa: string | null
          maat: string[]
          oikein: number
          paivan_reitti: boolean
          played_at: string
          session_id: string | null
          siemen: string
          yritys: number
        }
        Insert: {
          id?: string
          maanosa?: string | null
          maat: string[]
          oikein: number
          paivan_reitti?: boolean
          played_at?: string
          session_id?: string | null
          siemen: string
          yritys: number
        }
        Update: {
          id?: string
          maanosa?: string | null
          maat?: string[]
          oikein?: number
          paivan_reitti?: boolean
          played_at?: string
          session_id?: string | null
          siemen?: string
          yritys?: number
        }
        Relationships: []
      }
      schedule_rules: {
        Row: {
          active: boolean
          auto_filled: boolean
          content_id: string
          content_type: string
          created_at: string
          editorial_note: string | null
          id: string
          intro_headline: string | null
          intro_source_url: string | null
          intro_text: string | null
          scheduled_date: string | null
          site_id: string
          strategy: string
          tag: string | null
          weight: number
        }
        Insert: {
          active?: boolean
          auto_filled?: boolean
          content_id: string
          content_type: string
          created_at?: string
          editorial_note?: string | null
          id?: string
          intro_headline?: string | null
          intro_source_url?: string | null
          intro_text?: string | null
          scheduled_date?: string | null
          site_id: string
          strategy: string
          tag?: string | null
          weight?: number
        }
        Update: {
          active?: boolean
          auto_filled?: boolean
          content_id?: string
          content_type?: string
          created_at?: string
          editorial_note?: string | null
          id?: string
          intro_headline?: string | null
          intro_source_url?: string | null
          intro_text?: string | null
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
      social_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          external_account_id: string | null
          external_account_name: string | null
          id: string
          last_error: string | null
          platform: string
          site_id: string
          status: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_error?: string | null
          platform: string
          site_id: string
          status?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_error?: string | null
          platform?: string
          site_id?: string
          status?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          copy_text: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          external_post_id: string | null
          id: string
          image_url: string | null
          platform: string
          posted_at: string | null
          scheduled_at: string | null
          site_id: string
          source_id: string | null
          source_type: string
          status: string
          target_date: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          copy_text?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          image_url?: string | null
          platform: string
          posted_at?: string | null
          scheduled_at?: string | null
          site_id: string
          source_id?: string | null
          source_type: string
          status?: string
          target_date?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          copy_text?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          image_url?: string | null
          platform?: string
          posted_at?: string | null
          scheduled_at?: string | null
          site_id?: string
          source_id?: string | null
          source_type?: string
          status?: string
          target_date?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "social_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      social_templates: {
        Row: {
          active: boolean
          aspect_ratio: string
          content_scope: string
          created_at: string
          id: string
          image_url: string
          name: string
          site_id: string
          sort_order: number
          theme_key: string
        }
        Insert: {
          active?: boolean
          aspect_ratio?: string
          content_scope?: string
          created_at?: string
          id?: string
          image_url: string
          name: string
          site_id: string
          sort_order?: number
          theme_key?: string
        }
        Update: {
          active?: boolean
          aspect_ratio?: string
          content_scope?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          site_id?: string
          sort_order?: number
          theme_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_templates_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tmp_kuvavisat_2026_aktivointi: {
        Row: {
          id: string | null
          otettu: string | null
          type: string | null
        }
        Insert: {
          id?: string | null
          otettu?: string | null
          type?: string | null
        }
        Update: {
          id?: string | null
          otettu?: string | null
          type?: string | null
        }
        Relationships: []
      }
      tupla_pelit: {
        Row: {
          id: string
          kysymykset: string[]
          oikein: number
          paivan_sarja: boolean
          played_at: string
          saalis: number
          session_id: string | null
          siemen: string
          syy: string
          teema: string
        }
        Insert: {
          id?: string
          kysymykset?: string[]
          oikein: number
          paivan_sarja?: boolean
          played_at?: string
          saalis: number
          session_id?: string | null
          siemen: string
          syy: string
          teema: string
        }
        Update: {
          id?: string
          kysymykset?: string[]
          oikein?: number
          paivan_sarja?: boolean
          played_at?: string
          saalis?: number
          session_id?: string | null
          siemen?: string
          syy?: string
          teema?: string
        }
        Relationships: []
      }
      vaalipiirien_rajat: {
        Row: {
          accepted: boolean
          border_type: string
          created_at: string | null
          id: string
          note: string | null
          source: string | null
          vaalipiiri_a: string
          vaalipiiri_b: string
        }
        Insert: {
          accepted?: boolean
          border_type: string
          created_at?: string | null
          id?: string
          note?: string | null
          source?: string | null
          vaalipiiri_a: string
          vaalipiiri_b: string
        }
        Update: {
          accepted?: boolean
          border_type?: string
          created_at?: string | null
          id?: string
          note?: string | null
          source?: string | null
          vaalipiiri_a?: string
          vaalipiiri_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaalipiirien_rajat_vaalipiiri_a_fkey"
            columns: ["vaalipiiri_a"]
            isOneToOne: false
            referencedRelation: "vaalipiirit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaalipiirien_rajat_vaalipiiri_b_fkey"
            columns: ["vaalipiiri_b"]
            isOneToOne: false
            referencedRelation: "vaalipiirit"
            referencedColumns: ["id"]
          },
        ]
      }
      vaalipiiriketju_pelit: {
        Row: {
          edustajat: string[]
          id: string
          oikein: number
          paivan_reitti: boolean
          played_at: string
          session_id: string | null
          siemen: string
          yritys: number
        }
        Insert: {
          edustajat: string[]
          id?: string
          oikein: number
          paivan_reitti?: boolean
          played_at?: string
          session_id?: string | null
          siemen: string
          yritys: number
        }
        Update: {
          edustajat?: string[]
          id?: string
          oikein?: number
          paivan_reitti?: boolean
          played_at?: string
          session_id?: string | null
          siemen?: string
          yritys?: number
        }
        Relationships: []
      }
      vaalipiirit: {
        Row: {
          created_at: string | null
          id: string
          maakunnat: string[]
          name: string
          seats_2023: number
          short_name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          maakunnat: string[]
          name: string
          seats_2023: number
          short_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          maakunnat?: string[]
          name?: string
          seats_2023?: number
          short_name?: string
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
      diggaa_knockout_option_stats: {
        Row: {
          appearances: number | null
          knockout_id: string | null
          option_id: string | null
          tournament_wins: number | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_knockout_options_knockout_id_fkey"
            columns: ["knockout_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockouts"
            referencedColumns: ["id"]
          },
        ]
      }
      diggaa_knockout_pair_stats: {
        Row: {
          knockout_id: string | null
          opt_hi: string | null
          opt_lo: string | null
          winner_option_id: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diggaa_knockout_battles_winner_option_id_fkey"
            columns: ["winner_option_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_option_stats"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "diggaa_knockout_battles_winner_option_id_fkey"
            columns: ["winner_option_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockout_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diggaa_knockout_sessions_knockout_id_fkey"
            columns: ["knockout_id"]
            isOneToOne: false
            referencedRelation: "diggaa_knockouts"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      quiz_cards: {
        Row: {
          badge: string | null
          category: string | null
          collection: string | null
          custom_slug: string | null
          description: string | null
          difficulty: string | null
          display_title: string | null
          game_mode: string | null
          genre: string | null
          id: string | null
          play_count: number | null
          published_at: string | null
          question_count: number | null
          site_id: string | null
          slug: string | null
          subcollection: string | null
          tags: string[] | null
          target_age: string | null
          teaser: string | null
          title: string | null
        }
        Insert: {
          badge?: never
          category?: string | null
          collection?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          game_mode?: string | null
          genre?: string | null
          id?: string | null
          play_count?: number | null
          published_at?: string | null
          question_count?: never
          site_id?: string | null
          slug?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
        }
        Update: {
          badge?: never
          category?: string | null
          collection?: string | null
          custom_slug?: string | null
          description?: string | null
          difficulty?: string | null
          display_title?: string | null
          game_mode?: string | null
          genre?: string | null
          id?: string | null
          play_count?: number | null
          published_at?: string | null
          question_count?: never
          site_id?: string | null
          slug?: string | null
          subcollection?: string | null
          tags?: string[] | null
          target_age?: string | null
          teaser?: string | null
          title?: string | null
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
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      aanivisa_arvo_setti: {
        Args: {
          p_edelliset: string[]
          p_ryhma: string
          p_siemen: string
          p_site_id: string
          p_vain_aktiiviset?: boolean
        }
        Returns: string[]
      }
      aanivisa_viikon_aanet: {
        Args: {
          p_ryhma: string
          p_site_id: string
          p_vain_aktiiviset?: boolean
        }
        Returns: {
          idt: string[]
          viikko: number
          vuosi: number
        }[]
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      admin_visa_tilastot: {
        Args: { p_site: string }
        Returns: {
          pelit: number
          pelit_30pv: number
          peukku_alas: number
          peukku_ylos: number
          quiz_id: string
        }[]
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      helsinki_tanaan: { Args: never; Returns: string }
      ig_bio: {
        Args: { p_site: string }
        Returns: {
          julkaistu_at: string
          julkaisu_id: string
          kampanja: string
          kokoelma: string
          kuva: string
          otsikko: string
          paiva: string
          quiz_id: string
          slotti: string
        }[]
      }
      kirjaa_ig: {
        Args: { p_julkaisu?: string; p_tapahtuma: string }
        Returns: undefined
      }
      kirjaa_nosto: {
        Args: {
          p_intro?: string
          p_kategoria?: string
          p_quiz: string
          p_slotti: string
          p_tapahtuma: string
        }
        Returns: undefined
      }
      kuvavisa_haaste_luo: {
        Args: {
          p_kuva_idt: string[]
          p_kuvavisa: string
          p_kysymyksia: number
          p_maanosa?: string
          p_oikein: number
          p_pisteet: number
          p_site_id: string
          p_taso?: string
        }
        Returns: string
      }
      kuvavisa_viikon_kuvat: {
        Args: { p_site_id: string }
        Returns: {
          idt: string[]
          viikko: number
          vuosi: number
        }[]
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      paivan_sankari: {
        Args: { p_date: string; p_site: string }
        Returns: {
          birth_date: string
          celebrity_id: string
          custom_slug: string
          death_date: string
          ika: number
          image_focal_x: number
          image_focal_y: number
          image_url: string
          intro_text: string
          name: string
          quiz_id: string
          quiz_slug: string
          quiz_title: string
          role: string
          slug: string
        }[]
      }
      paivan_sankarit: {
        Args: { p_from: string; p_site: string; p_to: string }
        Returns: {
          death_date: string
          ika: number
          name: string
          paiva: string
          quiz_id: string
        }[]
      }
      paivan_visa_ehdokas: {
        Args: { p_date: string; p_site: string }
        Returns: string
      }
      paivan_visa_tanaan: {
        Args: { p_site: string }
        Returns: {
          auto_filled: boolean
          intro_headline: string
          intro_text: string
          paiva: string
          quiz_id: string
          rule_id: string
          vaihdettu: boolean
        }[]
      }
      paivan_visa_varmista: {
        Args: { p_date: string; p_site: string }
        Returns: string
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      slugify_name: { Args: { src: string }; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      todays_celebrities: {
        Args: { p_site_id: string }
        Returns: {
          bio_intro: string | null
          bio_short: string | null
          birth_date: string
          birth_place: string | null
          created_at: string | null
          death_date: string | null
          death_place: string | null
          facts: Json | null
          facts_reviewed_at: string | null
          id: string
          ig_tilit: string[]
          image_focal_x: number | null
          image_focal_y: number | null
          image_url: string | null
          intro_text: string | null
          is_hero: boolean | null
          laji: string | null
          name: string
          nickname: string | null
          nimi_elatiivi: string | null
          paivan_sankari: boolean
          platform: string | null
          politiikka_roolit: string[] | null
          priority: number | null
          role: string
          ryhma: string | null
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
      unique_celebrity_slug: {
        Args: { self_id: string; src: string }
        Returns: string
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
