import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="font-serif text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Gérez vos notifications</p>
        </div>

        <Card className="card-elevated">
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas de nouvelles notifications pour le moment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
