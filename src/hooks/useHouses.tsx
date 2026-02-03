import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface House {
  id: string;
  name: string;
  house_number: number;
  description: string | null;
  family_id: string | null;
  family?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export function useHouses() {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHouses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('houses')
        .select(`
          *,
          family:families(id, name)
        `)
        .order('house_number', { ascending: true });

      if (error) throw error;
      setHouses(data || []);
    } catch (error) {
      console.error('Error fetching houses:', error);
      toast.error('Erreur lors du chargement des maisons');
    } finally {
      setIsLoading(false);
    }
  };

  const createHouse = async (houseData: {
    name: string;
    house_number: number;
    description?: string;
    family_id: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .insert([houseData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Maison créée avec succès');
      fetchHouses();
      return data;
    } catch (error) {
      console.error('Error creating house:', error);
      toast.error('Erreur lors de la création de la maison');
      throw error;
    }
  };

  const updateHouse = async (id: string, houseData: Partial<House>) => {
    try {
      const { error } = await supabase
        .from('houses')
        .update(houseData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Maison modifiée avec succès');
      fetchHouses();
    } catch (error) {
      console.error('Error updating house:', error);
      toast.error('Erreur lors de la modification de la maison');
      throw error;
    }
  };

  const deleteHouse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('houses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Maison supprimée avec succès');
      fetchHouses();
    } catch (error) {
      console.error('Error deleting house:', error);
      toast.error('Erreur lors de la suppression de la maison');
      throw error;
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  return {
    houses,
    isLoading,
    fetchHouses,
    createHouse,
    updateHouse,
    deleteHouse,
  };
}
