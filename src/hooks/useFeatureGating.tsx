import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Feature {
  feature_key: string;
  feature_value: any;
  description: string;
}

export const useFeatureGating = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFeatures();
    }
  }, [user]);

  const loadFeatures = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_features', { _user_id: user?.id });

      if (error) throw error;

      // Convert array to object for easy access
      const featuresMap: Record<string, any> = {};
      data?.forEach((f: Feature) => {
        // Parse JSON values
        try {
          featuresMap[f.feature_key] = JSON.parse(f.feature_value);
        } catch {
          featuresMap[f.feature_key] = f.feature_value;
        }
      });

      setFeatures(featuresMap);
    } catch (error) {
      console.error("Error loading features:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    const value = features[featureKey];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return !!value;
  };

  const getFeatureValue = (featureKey: string, defaultValue: any = null): any => {
    return features[featureKey] ?? defaultValue;
  };

  const getFeatureLimit = (featureKey: string): number => {
    const value = features[featureKey];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10) || 0;
    return 0;
  };

  return {
    features,
    loading,
    hasFeature,
    getFeatureValue,
    getFeatureLimit,
  };
};
