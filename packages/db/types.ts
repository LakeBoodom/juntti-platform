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
      _kat3_q_backup_20261025: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _kat3_quiz_backup_20261025: {
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
          korttinimi: string | null
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
      _kat4_q_backup_20261025: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _kat4_quiz_backup_20261025: {
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
          korttinimi: string | null
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
      _kookoo_q_backup_20261020: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _kookoo_quiz_backup_20261020: {
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
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[] | null
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
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
      _kult_vuodet_backup_20261014: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
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
      _luonto_era1_backup_20261023: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _luonto_era2_backup_20261023: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _luonto_era3_backup_20261023: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
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
      _luonto_mk_sp_backup_20261023: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
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
      _maantieto2_q_backup_20261027: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _maantieto2_quiz_backup_20261027: {
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
          korttinimi: string | null
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
      _majakat_q_backup_20261020: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _majakat_quiz_backup_20261020: {
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
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[] | null
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
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
      _myrsky_q_backup_20261026: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Relationships: []
      }
      _myrsky_quiz_backup_20261026: {
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
          korttinimi: string | null
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string | null
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string | null
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[] | null
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
      _selko_yleistieto_q_backup_20261029: {
        Row: {
          animal_sound: Json | null
          answers: Json | null
          audio: Json | null
          created_at: string | null
          explanation: string | null
          hook: boolean | null
          id: string | null
          image_credit: string | null
          image_license_note: string | null
          image_position: string | null
          image_url: string | null
          question_text: string | null
          question_type: string | null
          quiz_id: string | null
          sort_order: number | null
          taso: number | null
          vihje_laura: string | null
          vihje_mikko: string | null
        }
        Insert: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          hook?: boolean | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
        }
        Update: {
          animal_sound?: Json | null
          answers?: Json | null
          audio?: Json | null
          created_at?: string | null
          explanation?: string | null
          hook?: boolean | null
          id?: string | null
          image_credit?: string | null
          image_license_note?: string | null
          image_position?: string | null
          image_url?: string | null
          question_text?: string | null
          question_type?: string | null
          quiz_id?: string | null
          sort_order?: number | null
          taso?: number | null
          vihje_laura?: string | null
          vihje_mikko?: string | null
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
      areyoou_daily_picks: {
        Row: {
          auto: boolean
          created_at: string
          day: string
          edition: string
          test_id: string
        }
        Insert: {
          auto?: boolean
          created_at?: string
          day: string
          edition: string
          test_id: string
        }
        Update: {
          auto?: boolean
          created_at?: string
          day?: string
          edition?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_daily_picks_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "areyoou_editions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "areyoou_daily_picks_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "areyoou_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_dimensions: {
        Row: {
          id: string
          key: string
          label: string
          sort: number
          test_id: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          sort?: number
          test_id: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          sort?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_dimensions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "areyoou_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_editions: {
        Row: {
          active: boolean
          code: string
          locale: string
          name: string
          path: string
          sort: number
          timezone: string
        }
        Insert: {
          active?: boolean
          code: string
          locale: string
          name: string
          path: string
          sort?: number
          timezone: string
        }
        Update: {
          active?: boolean
          code?: string
          locale?: string
          name?: string
          path?: string
          sort?: number
          timezone?: string
        }
        Relationships: []
      }
      areyoou_options: {
        Row: {
          effects: Json
          id: string
          label: string
          media: Json | null
          position: number
          question_id: string
        }
        Insert: {
          effects?: Json
          id?: string
          label: string
          media?: Json | null
          position: number
          question_id: string
        }
        Update: {
          effects?: Json
          id?: string
          label?: string
          media?: Json | null
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "areyoou_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_profile_stats_daily: {
        Row: {
          count: number
          day: string
          profile_id: string
        }
        Insert: {
          count?: number
          day: string
          profile_id: string
        }
        Update: {
          count?: number
          day?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_profile_stats_daily_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "areyoou_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_profiles: {
        Row: {
          card_line: string | null
          description_md: string
          expression: string
          headline: string
          id: string
          look: Json | null
          name: string
          share_line: string | null
          slug: string
          sort: number
          target_vector: Json
          test_id: string
        }
        Insert: {
          card_line?: string | null
          description_md: string
          expression?: string
          headline: string
          id?: string
          look?: Json | null
          name: string
          share_line?: string | null
          slug: string
          sort?: number
          target_vector: Json
          test_id: string
        }
        Update: {
          card_line?: string | null
          description_md?: string
          expression?: string
          headline?: string
          id?: string
          look?: Json | null
          name?: string
          share_line?: string | null
          slug?: string
          sort?: number
          target_vector?: Json
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_profiles_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "areyoou_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_questions: {
        Row: {
          config: Json
          id: string
          media: Json | null
          position: number
          prompt: string
          test_id: string
          type: string
        }
        Insert: {
          config?: Json
          id?: string
          media?: Json | null
          position: number
          prompt: string
          test_id: string
          type: string
        }
        Update: {
          config?: Json
          id?: string
          media?: Json | null
          position?: number
          prompt?: string
          test_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "areyoou_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_server_keys: {
        Row: {
          created_at: string
          key_hash: string
          note: string | null
        }
        Insert: {
          created_at?: string
          key_hash: string
          note?: string | null
        }
        Update: {
          created_at?: string
          key_hash?: string
          note?: string | null
        }
        Relationships: []
      }
      areyoou_stats_daily: {
        Row: {
          completes: number
          copies: number
          day: string
          retakes: number
          shares_fb: number
          shares_sms: number
          shares_wa: number
          starts: number
          test_id: string
        }
        Insert: {
          completes?: number
          copies?: number
          day: string
          retakes?: number
          shares_fb?: number
          shares_sms?: number
          shares_wa?: number
          starts?: number
          test_id: string
        }
        Update: {
          completes?: number
          copies?: number
          day?: string
          retakes?: number
          shares_fb?: number
          shares_sms?: number
          shares_wa?: number
          starts?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_stats_daily_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "areyoou_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_tests: {
        Row: {
          created_at: string
          created_by: string
          cta_label: string | null
          edition: string
          est_minutes: number
          hero_alt: string | null
          hero_bubble: string | null
          hero_image: string | null
          hero_line: string | null
          hero_scene: Json | null
          id: string
          intro_md: string
          meta_description: string
          pair_key: string | null
          percent_dimension: string | null
          percent_labels: Json | null
          publish_at: string | null
          result_mode: string
          season_end_md: string | null
          season_start_md: string | null
          slug: string
          source_ootko_slug: string | null
          status: string
          theme_id: string
          tier: string
          title_display: string
          title_seo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          cta_label?: string | null
          edition: string
          est_minutes?: number
          hero_alt?: string | null
          hero_bubble?: string | null
          hero_image?: string | null
          hero_line?: string | null
          hero_scene?: Json | null
          id?: string
          intro_md?: string
          meta_description: string
          pair_key?: string | null
          percent_dimension?: string | null
          percent_labels?: Json | null
          publish_at?: string | null
          result_mode?: string
          season_end_md?: string | null
          season_start_md?: string | null
          slug: string
          source_ootko_slug?: string | null
          status?: string
          theme_id: string
          tier?: string
          title_display: string
          title_seo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          cta_label?: string | null
          edition?: string
          est_minutes?: number
          hero_alt?: string | null
          hero_bubble?: string | null
          hero_image?: string | null
          hero_line?: string | null
          hero_scene?: Json | null
          id?: string
          intro_md?: string
          meta_description?: string
          pair_key?: string | null
          percent_dimension?: string | null
          percent_labels?: Json | null
          publish_at?: string | null
          result_mode?: string
          season_end_md?: string | null
          season_start_md?: string | null
          slug?: string
          source_ootko_slug?: string | null
          status?: string
          theme_id?: string
          tier?: string
          title_display?: string
          title_seo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_tests_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "areyoou_editions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "areyoou_tests_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "areyoou_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      areyoou_themes: {
        Row: {
          accessory: string | null
          backdrop: string | null
          color_ground: string
          color_on_secondary: string
          color_primary: string
          color_secondary: string
          created_at: string
          cta_label: string
          edition: string
          id: string
          in_nav: boolean
          name: string
          season_dates: Json
          season_end_md: string | null
          season_start_md: string | null
          slug: string
          sort: number
        }
        Insert: {
          accessory?: string | null
          backdrop?: string | null
          color_ground: string
          color_on_secondary: string
          color_primary: string
          color_secondary: string
          created_at?: string
          cta_label?: string
          edition: string
          id?: string
          in_nav?: boolean
          name: string
          season_dates?: Json
          season_end_md?: string | null
          season_start_md?: string | null
          slug: string
          sort?: number
        }
        Update: {
          accessory?: string | null
          backdrop?: string | null
          color_ground?: string
          color_on_secondary?: string
          color_primary?: string
          color_secondary?: string
          created_at?: string
          cta_label?: string
          edition?: string
          id?: string
          in_nav?: boolean
          name?: string
          season_dates?: Json
          season_end_md?: string | null
          season_start_md?: string | null
          slug?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "areyoou_themes_edition_fkey"
            columns: ["edition"]
            isOneToOne: false
            referencedRelation: "areyoou_editions"
            referencedColumns: ["code"]
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
          image_credit: string | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_license: string | null
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
          tiesitko: string | null
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
          image_credit?: string | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_license?: string | null
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
          tiesitko?: string | null
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
          image_credit?: string | null
          image_focal_x?: number | null
          image_focal_y?: number | null
          image_license?: string | null
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
          tiesitko?: string | null
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
      etusivu_promot: {
        Row: {
          aktiivinen: boolean
          alku: string | null
          created_at: string
          cta: string | null
          href: string
          id: string
          kicker: string | null
          kuva: string | null
          loppu: string | null
          otsikko: string
          paikka: string
          paino: number
        }
        Insert: {
          aktiivinen?: boolean
          alku?: string | null
          created_at?: string
          cta?: string | null
          href: string
          id?: string
          kicker?: string | null
          kuva?: string | null
          loppu?: string | null
          otsikko: string
          paikka: string
          paino?: number
        }
        Update: {
          aktiivinen?: boolean
          alku?: string | null
          created_at?: string
          cta?: string | null
          href?: string
          id?: string
          kicker?: string | null
          kuva?: string | null
          loppu?: string | null
          otsikko?: string
          paikka?: string
          paino?: number
        }
        Relationships: []
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
          geom_geojson: Json | null
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
          geom_geojson?: Json | null
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
          geom_geojson?: Json | null
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
          entry: string | null
          id: string
          kunnat: string[]
          landing_path: string | null
          maakunta: string | null
          oikein: number
          paivan_reitti: boolean
          played_at: string
          referrer_host: string | null
          session_id: string | null
          siemen: string
          yritys: number
        }
        Insert: {
          entry?: string | null
          id?: string
          kunnat: string[]
          landing_path?: string | null
          maakunta?: string | null
          oikein: number
          paivan_reitti?: boolean
          played_at?: string
          referrer_host?: string | null
          session_id?: string | null
          siemen: string
          yritys: number
        }
        Update: {
          entry?: string | null
          id?: string
          kunnat?: string[]
          landing_path?: string | null
          maakunta?: string | null
          oikein?: number
          paivan_reitti?: boolean
          played_at?: string
          referrer_host?: string | null
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
      ootko_daily_picks: {
        Row: {
          auto: boolean
          created_at: string
          day: string
          test_id: string
        }
        Insert: {
          auto?: boolean
          created_at?: string
          day: string
          test_id: string
        }
        Update: {
          auto?: boolean
          created_at?: string
          day?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_daily_picks_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ootko_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_dimensions: {
        Row: {
          id: string
          key: string
          label: string
          sort: number
          test_id: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          sort?: number
          test_id: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          sort?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_dimensions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ootko_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_options: {
        Row: {
          effects: Json
          id: string
          label: string
          media: Json | null
          position: number
          question_id: string
        }
        Insert: {
          effects?: Json
          id?: string
          label: string
          media?: Json | null
          position: number
          question_id: string
        }
        Update: {
          effects?: Json
          id?: string
          label?: string
          media?: Json | null
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "ootko_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_profile_stats_daily: {
        Row: {
          count: number
          day: string
          profile_id: string
        }
        Insert: {
          count?: number
          day?: string
          profile_id: string
        }
        Update: {
          count?: number
          day?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_profile_stats_daily_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ootko_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_profiles: {
        Row: {
          description_md: string
          expression: string
          headline: string
          id: string
          look: Json | null
          name: string
          share_line: string | null
          slug: string
          sort: number
          target_vector: Json
          test_id: string
        }
        Insert: {
          description_md: string
          expression?: string
          headline: string
          id?: string
          look?: Json | null
          name: string
          share_line?: string | null
          slug: string
          sort?: number
          target_vector: Json
          test_id: string
        }
        Update: {
          description_md?: string
          expression?: string
          headline?: string
          id?: string
          look?: Json | null
          name?: string
          share_line?: string | null
          slug?: string
          sort?: number
          target_vector?: Json
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_profiles_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ootko_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_questions: {
        Row: {
          config: Json
          id: string
          media: Json | null
          position: number
          prompt: string
          source_question_id: string | null
          test_id: string
          type: string
        }
        Insert: {
          config?: Json
          id?: string
          media?: Json | null
          position: number
          prompt: string
          source_question_id?: string | null
          test_id: string
          type: string
        }
        Update: {
          config?: Json
          id?: string
          media?: Json | null
          position?: number
          prompt?: string
          source_question_id?: string | null
          test_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ootko_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_server_keys: {
        Row: {
          created_at: string
          key_hash: string
          note: string | null
        }
        Insert: {
          created_at?: string
          key_hash: string
          note?: string | null
        }
        Update: {
          created_at?: string
          key_hash?: string
          note?: string | null
        }
        Relationships: []
      }
      ootko_stats_daily: {
        Row: {
          arrivals_copy: number
          arrivals_facebook: number
          arrivals_native: number
          arrivals_whatsapp: number
          completes: number
          copies: number
          day: string
          retakes: number
          shared_arrivals: number
          shared_completes: number
          shared_starts: number
          shares_fb: number
          shares_sms: number
          shares_wa: number
          starts: number
          test_id: string
          test_shares_copy: number
          test_shares_native: number
          test_shares_whatsapp: number
        }
        Insert: {
          arrivals_copy?: number
          arrivals_facebook?: number
          arrivals_native?: number
          arrivals_whatsapp?: number
          completes?: number
          copies?: number
          day?: string
          retakes?: number
          shared_arrivals?: number
          shared_completes?: number
          shared_starts?: number
          shares_fb?: number
          shares_sms?: number
          shares_wa?: number
          starts?: number
          test_id: string
          test_shares_copy?: number
          test_shares_native?: number
          test_shares_whatsapp?: number
        }
        Update: {
          arrivals_copy?: number
          arrivals_facebook?: number
          arrivals_native?: number
          arrivals_whatsapp?: number
          completes?: number
          copies?: number
          day?: string
          retakes?: number
          shared_arrivals?: number
          shared_completes?: number
          shared_starts?: number
          shares_fb?: number
          shares_sms?: number
          shares_wa?: number
          starts?: number
          test_id?: string
          test_shares_copy?: number
          test_shares_native?: number
          test_shares_whatsapp?: number
        }
        Relationships: [
          {
            foreignKeyName: "ootko_stats_daily_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ootko_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_tests: {
        Row: {
          created_at: string
          cta_label: string | null
          est_minutes: number
          hero_alt: string | null
          hero_bubble: string | null
          hero_image: string | null
          hero_line: string | null
          hero_scene: Json | null
          id: string
          intro_md: string
          meta_description: string
          nosto: number | null
          percent_dimension: string | null
          percent_labels: Json | null
          publish_at: string | null
          result_mode: string
          seo: Json | null
          slug: string
          status: string
          theme_id: string
          title_display: string
          title_seo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          est_minutes?: number
          hero_alt?: string | null
          hero_bubble?: string | null
          hero_image?: string | null
          hero_line?: string | null
          hero_scene?: Json | null
          id?: string
          intro_md?: string
          meta_description: string
          nosto?: number | null
          percent_dimension?: string | null
          percent_labels?: Json | null
          publish_at?: string | null
          result_mode?: string
          seo?: Json | null
          slug: string
          status?: string
          theme_id: string
          title_display: string
          title_seo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          est_minutes?: number
          hero_alt?: string | null
          hero_bubble?: string | null
          hero_image?: string | null
          hero_line?: string | null
          hero_scene?: Json | null
          id?: string
          intro_md?: string
          meta_description?: string
          nosto?: number | null
          percent_dimension?: string | null
          percent_labels?: Json | null
          publish_at?: string | null
          result_mode?: string
          seo?: Json | null
          slug?: string
          status?: string
          theme_id?: string
          title_display?: string
          title_seo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ootko_tests_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "ootko_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      ootko_themes: {
        Row: {
          accessory: string | null
          backdrop: string | null
          color_ground: string
          color_on_secondary: string
          color_primary: string
          color_secondary: string
          created_at: string
          cta_label: string
          id: string
          in_nav: boolean
          name: string
          season_dates: Json
          season_end_md: string | null
          season_start_md: string | null
          slug: string
          sort: number
        }
        Insert: {
          accessory?: string | null
          backdrop?: string | null
          color_ground: string
          color_on_secondary: string
          color_primary: string
          color_secondary: string
          created_at?: string
          cta_label?: string
          id?: string
          in_nav?: boolean
          name: string
          season_dates?: Json
          season_end_md?: string | null
          season_start_md?: string | null
          slug: string
          sort?: number
        }
        Update: {
          accessory?: string | null
          backdrop?: string | null
          color_ground?: string
          color_on_secondary?: string
          color_primary?: string
          color_secondary?: string
          created_at?: string
          cta_label?: string
          id?: string
          in_nav?: boolean
          name?: string
          season_dates?: Json
          season_end_md?: string | null
          season_start_md?: string | null
          slug?: string
          sort?: number
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
          hook: boolean
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
          hook?: boolean
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
          hook?: boolean
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
      quiz_pack_esikatselu: {
        Row: {
          avain: string
          pack_id: string
        }
        Insert: {
          avain?: string
          pack_id: string
        }
        Update: {
          avain?: string
          pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_pack_esikatselu_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: true
            referencedRelation: "quiz_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_pack_events: {
        Row: {
          created_at: string
          id: number
          pack_id: string
          session_id: string | null
          tapahtuma: string
        }
        Insert: {
          created_at?: string
          id?: never
          pack_id: string
          session_id?: string | null
          tapahtuma: string
        }
        Update: {
          created_at?: string
          id?: never
          pack_id?: string
          session_id?: string | null
          tapahtuma?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_pack_events_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "quiz_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_pack_items: {
        Row: {
          question_id: string
          round_id: string
          sort: number
        }
        Insert: {
          question_id: string
          round_id: string
          sort: number
        }
        Update: {
          question_id?: string
          round_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_pack_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_pack_items_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "quiz_pack_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_pack_rounds: {
        Row: {
          id: string
          kohderyhma: string
          nimi: string
          nro: number
          pack_id: string
        }
        Insert: {
          id?: string
          kohderyhma?: string
          nimi: string
          nro: number
          pack_id: string
        }
        Update: {
          id?: string
          kohderyhma?: string
          nimi?: string
          nro?: number
          pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_pack_rounds_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "quiz_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_packs: {
        Row: {
          aksentti: string | null
          created_at: string
          hero_alt: string | null
          hero_image: string | null
          id: string
          jarjestys: number
          kausi_alku: string | null
          kausi_loppu: string | null
          kesto_min: number | null
          kohderyhma: string
          otsikko: string
          painos_nimi: string | null
          published_at: string | null
          sarja: string | null
          seo_description: string | null
          seo_title: string | null
          site_id: string
          slug: string
          status: string
          teema: string | null
          updated_at: string
        }
        Insert: {
          aksentti?: string | null
          created_at?: string
          hero_alt?: string | null
          hero_image?: string | null
          id?: string
          jarjestys?: number
          kausi_alku?: string | null
          kausi_loppu?: string | null
          kesto_min?: number | null
          kohderyhma?: string
          otsikko: string
          painos_nimi?: string | null
          published_at?: string | null
          sarja?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id: string
          slug: string
          status?: string
          teema?: string | null
          updated_at?: string
        }
        Update: {
          aksentti?: string | null
          created_at?: string
          hero_alt?: string | null
          hero_image?: string | null
          id?: string
          jarjestys?: number
          kausi_alku?: string | null
          kausi_loppu?: string | null
          kesto_min?: number | null
          kohderyhma?: string
          otsikko?: string
          painos_nimi?: string | null
          published_at?: string | null
          sarja?: string | null
          seo_description?: string | null
          seo_title?: string | null
          site_id?: string
          slug?: string
          status?: string
          teema?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_packs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_plays: {
        Row: {
          entry: string | null
          feedback: number | null
          id: string
          landing_path: string | null
          platform: string
          played_at: string | null
          quiz_id: string | null
          referrer_host: string | null
          score: number | null
          session_id: string | null
          share_channel: string | null
          shared: boolean | null
          total: number | null
        }
        Insert: {
          entry?: string | null
          feedback?: number | null
          id?: string
          landing_path?: string | null
          platform: string
          played_at?: string | null
          quiz_id?: string | null
          referrer_host?: string | null
          score?: number | null
          session_id?: string | null
          share_channel?: string | null
          shared?: boolean | null
          total?: number | null
        }
        Update: {
          entry?: string | null
          feedback?: number | null
          id?: string
          landing_path?: string | null
          platform?: string
          played_at?: string | null
          quiz_id?: string | null
          referrer_host?: string | null
          score?: number | null
          session_id?: string | null
          share_channel?: string | null
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
          korttinimi: string | null
          lasten_aihe: string | null
          learn: Json | null
          lukija: string | null
          platform: string
          play_count: number | null
          published_at: string | null
          scheduled_for: string | null
          section_tags: string[]
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[]
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
          korttinimi?: string | null
          lasten_aihe?: string | null
          learn?: Json | null
          lukija?: string | null
          platform?: string
          play_count?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          section_tags?: string[]
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
          entry: string | null
          id: string
          landing_path: string | null
          maanosa: string | null
          maat: string[]
          oikein: number
          paivan_reitti: boolean
          played_at: string
          referrer_host: string | null
          session_id: string | null
          siemen: string
          yritys: number
        }
        Insert: {
          entry?: string | null
          id?: string
          landing_path?: string | null
          maanosa?: string | null
          maat: string[]
          oikein: number
          paivan_reitti?: boolean
          played_at?: string
          referrer_host?: string | null
          session_id?: string | null
          siemen: string
          yritys: number
        }
        Update: {
          entry?: string | null
          id?: string
          landing_path?: string | null
          maanosa?: string | null
          maat?: string[]
          oikein?: number
          paivan_reitti?: boolean
          played_at?: string
          referrer_host?: string | null
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
      synttarit_greetings: {
        Row: {
          age: number | null
          created_at: string
          id: string
          recipient: string
          sort: number
          status: string
          text: string
          tone: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          id?: string
          recipient?: string
          sort?: number
          status?: string
          text: string
          tone: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          id?: string
          recipient?: string
          sort?: number
          status?: string
          text?: string
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      synttarit_pages: {
        Row: {
          age: number | null
          body: Json
          created_at: string
          eyebrow: string | null
          hero_image_credit: string | null
          hero_image_url: string | null
          id: string
          ingress: string | null
          meta_chips: string[]
          meta_description: string | null
          published_at: string | null
          related_slugs: string[]
          seo_title: string | null
          slug: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          body?: Json
          created_at?: string
          eyebrow?: string | null
          hero_image_credit?: string | null
          hero_image_url?: string | null
          id?: string
          ingress?: string | null
          meta_chips?: string[]
          meta_description?: string | null
          published_at?: string | null
          related_slugs?: string[]
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          body?: Json
          created_at?: string
          eyebrow?: string | null
          hero_image_credit?: string | null
          hero_image_url?: string | null
          id?: string
          ingress?: string | null
          meta_chips?: string[]
          meta_description?: string | null
          published_at?: string | null
          related_slugs?: string[]
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
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
          entry: string | null
          id: string
          kysymykset: string[]
          landing_path: string | null
          oikein: number
          paivan_sarja: boolean
          played_at: string
          referrer_host: string | null
          saalis: number
          session_id: string | null
          siemen: string
          syy: string
          teema: string
        }
        Insert: {
          entry?: string | null
          id?: string
          kysymykset?: string[]
          landing_path?: string | null
          oikein: number
          paivan_sarja?: boolean
          played_at?: string
          referrer_host?: string | null
          saalis: number
          session_id?: string | null
          siemen: string
          syy: string
          teema: string
        }
        Update: {
          entry?: string | null
          id?: string
          kysymykset?: string[]
          landing_path?: string | null
          oikein?: number
          paivan_sarja?: boolean
          played_at?: string
          referrer_host?: string | null
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
          entry: string | null
          id: string
          landing_path: string | null
          oikein: number
          paivan_reitti: boolean
          played_at: string
          referrer_host: string | null
          session_id: string | null
          siemen: string
          yritys: number
        }
        Insert: {
          edustajat: string[]
          entry?: string | null
          id?: string
          landing_path?: string | null
          oikein: number
          paivan_reitti?: boolean
          played_at?: string
          referrer_host?: string | null
          session_id?: string | null
          siemen: string
          yritys: number
        }
        Update: {
          edustajat?: string[]
          entry?: string | null
          id?: string
          landing_path?: string | null
          oikein?: number
          paivan_reitti?: boolean
          played_at?: string
          referrer_host?: string | null
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
          hero_focal_x: number | null
          hero_focal_y: number | null
          hero_image: string | null
          id: string | null
          play_count: number | null
          published_at: string | null
          question_count: number | null
          section_tags: string[] | null
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
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          id?: string | null
          play_count?: number | null
          published_at?: string | null
          question_count?: never
          section_tags?: string[] | null
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
          hero_focal_x?: number | null
          hero_focal_y?: number | null
          hero_image?: string | null
          id?: string | null
          play_count?: number | null
          published_at?: string | null
          question_count?: never
          section_tags?: string[] | null
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
      v_pelilahteet: {
        Row: {
          entry: string | null
          landing_path: string | null
          paiva: string | null
          pelit: number | null
          referrer_host: string | null
          sessiot: number | null
          taulu: string | null
        }
        Relationships: []
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
      areyoou_daily_test: { Args: { p_edition: string }; Returns: string }
      areyoou_home: {
        Args: { p_edition: string; p_key?: string }
        Returns: Json
      }
      areyoou_is_live: {
        Args: { p_publish_at: string; p_status: string }
        Returns: boolean
      }
      areyoou_key_ok: { Args: { p_key: string }; Returns: boolean }
      areyoou_md_in: {
        Args: { p_day: string; p_end: string; p_start: string }
        Returns: boolean
      }
      areyoou_save_draft: {
        Args: { p_key: string; p_test: Json }
        Returns: string
      }
      areyoou_test_in_season: {
        Args: { p_day: string; p_test: string }
        Returns: boolean
      }
      areyoou_test_preview: {
        Args: { p_edition: string; p_key: string; p_slug: string }
        Returns: Json
      }
      areyoou_today: { Args: { p_edition: string }; Returns: string }
      areyoou_track: {
        Args: {
          p_event: string
          p_key: string
          p_profile?: string
          p_test: string
        }
        Returns: undefined
      }
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
      ootko_etusivu: { Args: { p_key?: string }; Returns: Json }
      ootko_is_live: {
        Args: { p_publish_at: string; p_status: string }
        Returns: boolean
      }
      ootko_key_ok: { Args: { p_key: string }; Returns: boolean }
      ootko_paivan_testi: { Args: never; Returns: string }
      ootko_tallenna_luonnos: {
        Args: { p_key: string; p_test: Json }
        Returns: string
      }
      ootko_testi_esikatselu: {
        Args: { p_key: string; p_slug: string }
        Returns: Json
      }
      ootko_track: {
        Args: {
          p_event: string
          p_key: string
          p_profile?: string
          p_test: string
        }
        Returns: undefined
      }
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
      slugify_name: { Args: { src: string }; Returns: string }
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
          image_credit: string | null
          image_focal_x: number | null
          image_focal_y: number | null
          image_license: string | null
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
          tiesitko: string | null
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
      visapaketti: { Args: { p_avain?: string; p_slug: string }; Returns: Json }
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
