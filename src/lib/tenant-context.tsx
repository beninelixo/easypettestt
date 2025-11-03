import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import type { UserHierarchy } from '@/types/multi-tenant';

interface TenantContextType {
  tenantId: string | null;
  franchiseId: string | null;
  unitId: string | null;
  userRole: string | null;
  permissions: string[];
  user: User | null;
  loading: boolean;
  switchContext: (tenantId?: string, franchiseId?: string, unitId?: string) => void;
  can: (permission: string) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserContext(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserContext(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserContext = async (userId: string) => {
    try {
      // Load user hierarchy
      const { data: hierarchy, error: hierarchyError } = await supabase
        .from('user_hierarchy' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (hierarchyError) {
        console.error('Error fetching hierarchy:', hierarchyError);
      }

      if (hierarchy) {
        const h = hierarchy as unknown as UserHierarchy;
        setTenantId(h.tenant_id);
        setFranchiseId(h.franchise_id);
        setUnitId(h.unit_id);
        setUserRole(h.role);
        setPermissions(h.permissions || []);
      } else {
        // Check if user owns a pet shop
        const { data: petShop, error: petShopError } = await supabase
          .from('pet_shops')
          .select('id')
          .eq('owner_id', userId)
          .limit(1)
          .maybeSingle();

        if (petShopError) {
          console.error('Error fetching pet shop:', petShopError);
        }

        if (petShop) {
          setUnitId(petShop.id);
          setUserRole('unit_manager');
        }
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchContext = (newTenantId?: string, newFranchiseId?: string, newUnitId?: string) => {
    if (newTenantId) setTenantId(newTenantId);
    if (newFranchiseId) setFranchiseId(newFranchiseId);
    if (newUnitId) setUnitId(newUnitId);
    
    // Save to localStorage
    localStorage.setItem('current_context', JSON.stringify({
      tenantId: newTenantId || tenantId,
      franchiseId: newFranchiseId || franchiseId,
      unitId: newUnitId || unitId,
    }));
  };

  const can = (permission: string): boolean => {
    // Admin has all permissions
    if (userRole === 'admin' || userRole === 'tenant_admin') return true;
    
    // Check specific permissions
    return permissions.includes(permission);
  };

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        franchiseId,
        unitId,
        userRole,
        permissions,
        user,
        loading,
        switchContext,
        can,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
