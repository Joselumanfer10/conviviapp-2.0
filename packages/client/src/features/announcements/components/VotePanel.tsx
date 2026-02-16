import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Announcement } from '@conviviapp/shared';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

interface VotePanelProps {
  announcement: Announcement;
  isExpired: boolean;
  onCastVote?: (id: string, optionIndex: number) => void;
  onRemoveVote?: (id: string) => void;
}

export function VotePanel({
  announcement,
  isExpired,
  onCastVote,
  onRemoveVote,
}: VotePanelProps) {
  const { user } = useAuthStore();

  const userVote = useMemo(
    () => announcement.votes?.find((v) => v.userId === user?.id),
    [announcement.votes, user?.id]
  );

  const hasVoted = !!userVote;
  const totalVotes = announcement.votes?.length || 0;

  const votesByOption = useMemo(() => {
    const counts: Record<number, number> = {};
    announcement.options.forEach((_, idx) => {
      counts[idx] = 0;
    });
    announcement.votes?.forEach((v) => {
      counts[v.optionIndex] = (counts[v.optionIndex] || 0) + 1;
    });
    return counts;
  }, [announcement.votes, announcement.options]);

  const showResults = hasVoted || isExpired;

  const handleVote = (optionIndex: number) => {
    if (isExpired || !onCastVote) return;
    onCastVote(announcement.id, optionIndex);
  };

  const handleRemoveVote = () => {
    if (isExpired || !onRemoveVote) return;
    onRemoveVote(announcement.id);
  };

  return (
    <div className="space-y-2">
      {announcement.options.map((option, idx) => {
        const count = votesByOption[idx] || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isUserChoice = userVote?.optionIndex === idx;

        if (showResults) {
          return (
            <div key={idx} className="relative">
              <div
                className={`relative rounded-lg border px-3 py-2 overflow-hidden ${
                  isUserChoice
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <motion.div
                  className={`absolute inset-y-0 left-0 ${
                    isUserChoice
                      ? 'bg-primary/15 dark:bg-primary/20'
                      : 'bg-muted/50'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isUserChoice && (
                      <svg
                        className="w-4 h-4 text-primary shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className={`text-sm ${isUserChoice ? 'font-semibold' : ''}`}>
                      {option}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 ml-2">
                    <span className="font-medium tabular-nums">{percentage}%</span>
                    <span className="text-xs">({count})</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Button
            key={idx}
            variant="outline"
            className="w-full justify-start text-left h-auto py-2 px-3"
            onClick={() => handleVote(idx)}
            disabled={isExpired}
          >
            <span className="text-sm">{option}</span>
          </Button>
        );
      })}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
          {announcement.quorum && (
            <span className="ml-1">
              - Quorum: {totalVotes}/{announcement.quorum}
              {totalVotes >= announcement.quorum && (
                <span className="text-green-600 dark:text-green-400 ml-1 font-medium">
                  Alcanzado
                </span>
              )}
            </span>
          )}
        </span>
        {hasVoted && !isExpired && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={handleRemoveVote}
          >
            Quitar voto
          </Button>
        )}
      </div>
    </div>
  );
}
