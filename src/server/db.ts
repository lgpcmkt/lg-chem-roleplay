import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing from .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  userId: string;
  track: 'hospital' | 'local';
  scenarioId: string;
  grade: 'S' | 'A' | 'B' | 'C';
  timestamp?: string;
}

export const dbService = {
  // Login / Create User
  loginUser: async (id: string, name: string): Promise<User> => {
    // upsert will insert or update the user based on the id primary key
    const { data, error } = await supabase
      .from('users')
      .upsert({ id, name }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
    
    return data as User;
  },

  // Save a roleplay session
  saveSession: async (session: Session) => {
    const { error } = await supabase
      .from('sessions')
      .insert({
        id: session.id,
        user_id: session.userId,
        track: session.track,
        scenario_id: session.scenarioId,
        grade: session.grade
      });

    if (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  // Get user progress (count of A or S grades per track, and total plays)
  getUserProgress: async (userId: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('track, scenario_id')
      .eq('user_id', userId)
      .in('grade', ['S', 'A']);

    if (error) {
      console.error('Error getting progress:', error);
      throw error;
    }

    const { count: totalPlays, error: countError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error getting total plays:', countError);
    }

    const progress = {
      hospital: 0,
      local: 0,
      totalPlays: totalPlays || 0
    };

    if (data) {
      const hospitalScenarios = new Set();
      const localScenarios = new Set();

      data.forEach((row: any) => {
        if (row.track === 'hospital') {
          hospitalScenarios.add(row.scenario_id);
        } else if (row.track === 'local') {
          localScenarios.add(row.scenario_id);
        }
      });

      progress.hospital = hospitalScenarios.size;
      progress.local = localScenarios.size;
    }
    
    return progress;
  }
};
