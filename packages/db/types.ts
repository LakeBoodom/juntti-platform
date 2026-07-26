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
            referencedRelation: "duel_entities"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "duel_entities"
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
            referencedRelation: "duel_entities"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "duel_entities"
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
          kind: string
          max_domain_distance: number
          max_gap: number | null
          mid_gap: number | null
          min_gap: number | null
          question_text: string
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
          kind: string
          max_domain_distance?: number
          max_gap?: number | null
          mid_gap?: number | null
          min_gap?: number | null
          question_text: string
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
          kind?: string
          max_domain_distance?: number
          max_gap?: number | null
          mid_gap?: number | null
          min_gap?: number | null
          question_text?: string
          subject_label?: string
          theme?: string
          unit_label?: string | null
          winner?: string
        }
        Relationships: []
      }
      fact_attributes: {
        Row: {
          attr_key: string
          display_value: string | null
          entity_id: string
          next_review_at: string | null
          num_value: number | null
          source: string | null
          text_value: string | null
          verified_at: string | null
          volatility: string
        }
        Insert: {
          attr_key: string
          display_value?: string | null
          entity_id: string
          next_review_at?: string | null
          num_value?: number | null
          source?: string | null
          text_value?: string | null
          verified_at?: string | null
          volatility?: string
        }
        Update: {
          attr_key?: string
          display_value?: string | null
          entity_id?: string
          next_review_at?: string | null
          num_value?: number | null
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
            referencedRelation: "duel_entities"
            referencedColumns: ["id"]
          },
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
          role_label: string | null
          show_role: boolean
          status: string
          updated_at: string | null
          wiki_url: string | null
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
          role_label?: string | null
          show_role?: boolean
          status?: string
          updated_at?: string | null
          wiki_url?: string | null
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
          role_label?: string | null
          show_role?: boolean
          status?: string
          updated_at?: string | null
          wiki_url?: string | null
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
          sort_order: number
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
          sort_order?: number
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
          sort_order?: number
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
          custom_slug: string | null
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
          custom_slug?: string | null
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
          custom_slug?: string | null
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
      duel_attribute_defs: {
        Row: {
          attr_key: string | null
          compare_mode: string | null
          easy_gap: number | null
          enabled: boolean | null
          fact_template: string | null
          flag_difficulty: string | null
          kind: string | null
          max_domain_distance: number | null
          max_gap: number | null
          mid_gap: number | null
          min_gap: number | null
          question_text: string | null
          subject_label: string | null
          theme: string | null
          unit_label: string | null
          winner: string | null
        }
        Insert: {
          attr_key?: string | null
          compare_mode?: string | null
          easy_gap?: number | null
          enabled?: boolean | null
          fact_template?: string | null
          flag_difficulty?: string | null
          kind?: string | null
          max_domain_distance?: number | null
          max_gap?: number | null
          mid_gap?: number | null
          min_gap?: number | null
          question_text?: string | null
          subject_label?: string | null
          theme?: string | null
          unit_label?: string | null
          winner?: string | null
        }
        Update: {
          attr_key?: string | null
          compare_mode?: string | null
          easy_gap?: number | null
          enabled?: boolean | null
          fact_template?: string | null
          flag_difficulty?: string | null
          kind?: string | null
          max_domain_distance?: number | null
          max_gap?: number | null
          mid_gap?: number | null
          min_gap?: number | null
          question_text?: string | null
          subject_label?: string | null
          theme?: string | null
          unit_label?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      duel_attributes: {
        Row: {
          attr_key: string | null
          display_value: string | null
          entity_id: string | null
          next_review_at: string | null
          num_value: number | null
          source: string | null
          text_value: string | null
          verified_at: string | null
          volatility: string | null
        }
        Insert: {
          attr_key?: string | null
          display_value?: string | null
          entity_id?: string | null
          next_review_at?: string | null
          num_value?: number | null
          source?: string | null
          text_value?: string | null
          verified_at?: string | null
          volatility?: string | null
        }
        Update: {
          attr_key?: string | null
          display_value?: string | null
          entity_id?: string | null
          next_review_at?: string | null
          num_value?: number | null
          source?: string | null
          text_value?: string | null
          verified_at?: string | null
          volatility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_attributes_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "duel_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_attributes_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "fact_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_entities: {
        Row: {
          celebrity_id: string | null
          created_at: string | null
          domain: string | null
          id: string | null
          image_credit: string | null
          image_url: string | null
          kind: string | null
          lat: number | null
          lon: number | null
          name: string | null
          name_partitive: string | null
          role_label: string | null
          show_role: boolean | null
          status: string | null
          updated_at: string | null
          wiki_url: string | null
        }
        Insert: {
          celebrity_id?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string | null
          image_credit?: string | null
          image_url?: string | null
          kind?: string | null
          lat?: number | null
          lon?: number | null
          name?: string | null
          name_partitive?: string | null
          role_label?: string | null
          show_role?: boolean | null
          status?: string | null
          updated_at?: string | null
          wiki_url?: string | null
        }
        Update: {
          celebrity_id?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string | null
          image_credit?: string | null
          image_url?: string | null
          kind?: string | null
          lat?: number | null
          lon?: number | null
          name?: string | null
          name_partitive?: string | null
          role_label?: string | null
          show_role?: boolean | null
          status?: string | null
          updated_at?: string | null
          wiki_url?: string | null
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
