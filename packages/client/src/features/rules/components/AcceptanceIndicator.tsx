import { useHomeMembers } from '@/features/homes';

interface AcceptanceIndicatorProps {
  homeId: string;
  acceptedBy: string[];
}

export function AcceptanceIndicator({ homeId, acceptedBy }: AcceptanceIndicatorProps) {
  const { data: members } = useHomeMembers(homeId);
  const totalMembers = members?.length || 0;
  const acceptedCount = acceptedBy.length;
  const percentage = totalMembers > 0 ? Math.round((acceptedCount / totalMembers) * 100) : 0;
  const allAccepted = totalMembers > 0 && acceptedCount >= totalMembers;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {acceptedCount}/{totalMembers} miembros
        </span>
        <span className={`font-medium ${allAccepted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allAccepted
              ? 'bg-green-500'
              : percentage > 50
                ? 'bg-yellow-500'
                : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {members && members.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {members.map((member) => {
            const hasAccepted = acceptedBy.includes(member.userId);
            return (
              <span
                key={member.userId}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  hasAccepted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {hasAccepted ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {member.name || 'Usuario'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
