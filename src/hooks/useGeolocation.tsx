/**
 * useGeolocation Hook
 * Handles client geolocation for proximity-based searches
 * Supports both browser geolocation API and CEP-based fallback
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

export interface UseGeolocationReturn extends GeolocationState {
  getCurrentLocation: () => Promise<Coordinates | null>;
  getLocationFromCEP: (cep: string) => Promise<Coordinates | null>;
  clearLocation: () => void;
}

/**
 * Hook para obter localização do cliente
 */
export function useGeolocation(): UseGeolocationReturn {
  const { toast } = useToast();
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permission: null,
  });

  // Check geolocation permission on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permission: result.state }));
      });
    }
  }, []);

  /**
   * Get current location using browser geolocation API
   */
  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (!('geolocation' in navigator)) {
      const error = 'Geolocalização não suportada neste navegador';
      setState(prev => ({ ...prev, error }));
      toast({
        title: "Localização Indisponível",
        description: error,
        variant: "destructive",
      });
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setState({
            coordinates,
            loading: false,
            error: null,
            permission: 'granted',
          });
          
          resolve(coordinates);
        },
        (error) => {
          let errorMessage = 'Não foi possível obter sua localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Por favor, habilite nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização';
              break;
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            permission: 'denied',
          }));
          
          toast({
            title: "Erro de Localização",
            description: errorMessage,
            variant: "destructive",
          });
          
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }, [toast]);

  /**
   * Get location from CEP using ViaCEP + Nominatim APIs
   */
  const getLocationFromCEP = useCallback(async (cep: string): Promise<Coordinates | null> => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      toast({
        title: "CEP Inválido",
        description: "Por favor, insira um CEP válido com 8 dígitos",
        variant: "destructive",
      });
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Step 1: Get address from ViaCEP
      const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const cepData = await cepResponse.json();

      if (cepData.erro) {
        throw new Error('CEP não encontrado');
      }

      // Step 2: Geocode address using Nominatim
      const address = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}, Brasil`;
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'EasyPet-App/1.0',
          },
        }
      );
      
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.length === 0) {
        throw new Error('Não foi possível geocodificar o endereço');
      }

      const coordinates: Coordinates = {
        latitude: parseFloat(geocodeData[0].lat),
        longitude: parseFloat(geocodeData[0].lon),
      };

      setState({
        coordinates,
        loading: false,
        error: null,
        permission: null,
      });

      return coordinates;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao buscar localização pelo CEP';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      toast({
        title: "Erro ao Buscar CEP",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  }, [toast]);

  /**
   * Clear stored location
   */
  const clearLocation = useCallback(() => {
    setState({
      coordinates: null,
      loading: false,
      error: null,
      permission: state.permission,
    });
  }, [state.permission]);

  return {
    ...state,
    getCurrentLocation,
    getLocationFromCEP,
    clearLocation,
  };
}
