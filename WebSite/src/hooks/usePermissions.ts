import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const usePermissions = (requiredPermissions: string[]) => {
  const [hasPermissions, setHasPermissions] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await apiService.checkPermissions(requiredPermissions);
        setHasPermissions(permissions);
      } catch (error) {
        console.error('Error checking permissions:', error);
        
        const defaultPermissions: { [key: string]: boolean } = {};
        requiredPermissions.forEach(perm => {
          defaultPermissions[perm] = false;
        });
        setHasPermissions(defaultPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    if (requiredPermissions.length > 0) {
      checkPermissions();
    } else {
      setIsLoading(false);
    }
  }, [requiredPermissions]);

  return { hasPermissions, isLoading };
};