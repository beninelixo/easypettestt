-- Migration: Add geolocation support to pet_shops table
-- This enables proximity-based search for appointment scheduling

-- Add latitude and longitude columns to pet_shops
ALTER TABLE pet_shops
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geolocation queries (improves performance)
CREATE INDEX IF NOT EXISTS idx_pet_shops_location 
ON pet_shops(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create function to calculate distance using Haversine formula
-- Returns distance in kilometers between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  radius DECIMAL := 6371; -- Earth's radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to find nearby pet shops
-- Returns pet shops within specified radius (default 50km)
CREATE OR REPLACE FUNCTION find_nearby_pet_shops(
  client_lat DECIMAL,
  client_lng DECIMAL,
  radius_km DECIMAL DEFAULT 50,
  limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL,
  phone TEXT,
  email TEXT,
  logo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.address,
    ps.city,
    ps.state,
    ps.latitude,
    ps.longitude,
    calculate_distance(client_lat, client_lng, ps.latitude, ps.longitude) as distance_km,
    ps.phone,
    ps.email,
    ps.logo_url
  FROM pet_shops ps
  WHERE 
    ps.latitude IS NOT NULL 
    AND ps.longitude IS NOT NULL
    AND ps.deleted_at IS NULL
    AND calculate_distance(client_lat, client_lng, ps.latitude, ps.longitude) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_nearby_pet_shops TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;

-- Comment on columns
COMMENT ON COLUMN pet_shops.latitude IS 'Latitude do estabelecimento (formato decimal, ex: -23.5505)';
COMMENT ON COLUMN pet_shops.longitude IS 'Longitude do estabelecimento (formato decimal, ex: -46.6333)';