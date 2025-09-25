import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AdminTest = () => {
  const [user, setUser] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(`User error: ${userError.message}`);
          return;
        }
        
        setUser(user);
        
        if (!user) {
          setError('No user logged in');
          return;
        }
        
        // Check admin status
        const { data: adminData, error: adminError } = await supabase
          .rpc('get_current_user_admin_status');
        
        if (adminError) {
          setError(`Admin check error: ${adminError.message}`);
          return;
        }
        
        setAdminStatus(adminData?.[0] || null);
        
      } catch (err) {
        setError(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  const createTestAdmin = async () => {
    try {
      setLoading(true);
      
      // Create test admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test-admin@gudubet.com',
        password: 'test123456',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'Admin'
          }
        }
      });
      
      if (authError) {
        setError(`Auth error: ${authError.message}`);
        return;
      }
      
      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authData.user.id,
            username: 'test-admin',
            email: 'test-admin@gudubet.com',
            first_name: 'Test',
            last_name: 'Admin',
            status: 'active',
            email_verified: true,
            phone_verified: true,
            kyc_status: 'approved'
          });
        
        if (profileError) {
          setError(`Profile error: ${profileError.message}`);
          return;
        }
        
        // Create admin record
        const { error: adminError } = await supabase
          .from('admins')
          .insert({
            id: authData.user.id,
            email: 'test-admin@gudubet.com',
            password_hash: 'test123456',
            role_type: 'admin',
            is_active: true
          });
        
        if (adminError) {
          setError(`Admin record error: ${adminError.message}`);
          return;
        }
        
        setError(null);
        // Refresh the page to check status
        window.location.reload();
      }
      
    } catch (err) {
      setError(`Create admin error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Admin durumu kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Admin Panel Test</h1>
        <Button onClick={() => window.location.reload()}>
          Yenile
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Kullanıcı Durumu
              {user ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user ? (
              <>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>ID:</strong> {user.id}
                </div>
                <div>
                  <strong>Email Verified:</strong> 
                  <Badge variant={user.email_confirmed_at ? "default" : "destructive"} className="ml-2">
                    {user.email_confirmed_at ? "Evet" : "Hayır"}
                  </Badge>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(user.created_at).toLocaleString('tr-TR')}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Kullanıcı giriş yapmamış</p>
            )}
          </CardContent>
        </Card>

        {/* Admin Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Admin Durumu
              {adminStatus?.is_admin ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminStatus ? (
              <>
                <div>
                  <strong>Admin:</strong> 
                  <Badge variant={adminStatus.is_admin ? "default" : "destructive"} className="ml-2">
                    {adminStatus.is_admin ? "Evet" : "Hayır"}
                  </Badge>
                </div>
                <div>
                  <strong>Super Admin:</strong> 
                  <Badge variant={adminStatus.is_super_admin ? "default" : "secondary"} className="ml-2">
                    {adminStatus.is_super_admin ? "Evet" : "Hayır"}
                  </Badge>
                </div>
                <div>
                  <strong>Role Type:</strong> {adminStatus.role_type || "Belirtilmemiş"}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Admin kaydı bulunamadı</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test İşlemleri</CardTitle>
          <CardDescription>
            Admin paneli test etmek için gerekli işlemler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={createTestAdmin}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Test Admin Kullanıcısı Oluştur'
              )}
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/admin'}
              disabled={!adminStatus?.is_admin}
              variant="default"
            >
              Admin Paneline Git
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Test Admin Bilgileri:</strong></p>
            <p>Email: test-admin@gudubet.com</p>
            <p>Şifre: test123456</p>
          </div>
        </CardContent>
      </Card>

      {/* Database Functions Test */}
      <Card>
        <CardHeader>
          <CardTitle>Database Fonksiyonları Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  const { data, error } = await supabase.rpc('get_current_user_admin_status');
                  console.log('Admin status result:', data, error);
                  alert(`Result: ${JSON.stringify(data)} Error: ${error?.message || 'None'}`);
                } catch (err) {
                  alert(`Error: ${err}`);
                }
              }}
            >
              get_current_user_admin_status Test Et
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTest;
