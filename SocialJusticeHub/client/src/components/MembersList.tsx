import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  UserPlus, 
  Crown, 
  Shield, 
  User, 
  Eye,
  Settings,
  UserMinus
} from 'lucide-react';

interface Member {
  id: number;
  userId: number;
  role: string;
  status: string;
  joinedAt: string;
  permissions?: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

interface MembersListProps {
  members: Member[];
  currentUserId?: number;
  isCreator?: boolean;
  onInviteMember?: () => void;
  onUpdateRole?: (memberId: number, newRole: string) => void;
  onRemoveMember?: (memberId: number) => void;
  className?: string;
}

export default function MembersList({
  members,
  currentUserId,
  isCreator = false,
  onInviteMember,
  onUpdateRole,
  onRemoveMember,
  className = ""
}: MembersListProps) {
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'creator':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'co-organizer':
      case 'co-organizador':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'active_member':
      case 'miembro activo':
        return <User className="w-4 h-4 text-green-600" />;
      case 'observer':
      case 'observador':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'creator':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'co-organizer':
      case 'co-organizador':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active_member':
      case 'miembro activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'observer':
      case 'observador':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'creator':
        return 'Creador';
      case 'co-organizer':
      case 'co-organizador':
        return 'Co-organizador';
      case 'active_member':
      case 'miembro activo':
        return 'Miembro Activo';
      case 'observer':
      case 'observador':
        return 'Observador';
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canManageMember = (member: Member) => {
    if (!isCreator) return false;
    if (member.role.toLowerCase() === 'creator') return false;
    if (member.userId === currentUserId) return false;
    return true;
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    if (onUpdateRole) {
      onUpdateRole(memberId, newRole);
    }
  };

  const handleRemoveMember = (memberId: number) => {
    if (onRemoveMember && confirm('¿Estás seguro de que quieres remover a este miembro?')) {
      onRemoveMember(memberId);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Miembros ({members.length})
          </CardTitle>
          {onInviteMember && (
            <Button onClick={onInviteMember} size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invitar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay miembros aún</p>
            <p className="text-gray-500 text-sm">Invita a otros a unirse a la iniciativa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {member.user.name}
                    </p>
                    {member.userId === currentUserId && (
                      <Badge variant="outline" className="text-xs">
                        Tú
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    @{member.user.username}
                  </p>
                </div>

                {/* Role Badge */}
                <Badge className={`${getRoleColor(member.role)} border flex items-center gap-1`}>
                  {getRoleIcon(member.role)}
                  {getRoleLabel(member.role)}
                </Badge>

                {/* Actions */}
                {canManageMember(member) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'co-organizador')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Hacer Co-organizador
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'miembro activo')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Hacer Miembro Activo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'observador')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Hacer Observador
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remover Miembro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {members.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.role.toLowerCase() === 'creator').length}
                </p>
                <p className="text-xs text-gray-500">Creadores</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => 
                    m.role.toLowerCase().includes('organizador') || 
                    m.role.toLowerCase().includes('active')
                  ).length}
                </p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.role.toLowerCase() === 'observer').length}
                </p>
                <p className="text-xs text-gray-500">Observadores</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
