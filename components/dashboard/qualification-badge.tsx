interface QualificationBadgeProps {
  score: number | null;
}

export function QualificationBadge({ score }: QualificationBadgeProps) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-tertiary">
        Sin calificar
      </span>
    );
  }

  let colorClass: string;
  if (score >= 70) {
    colorClass = "bg-green-100 text-green-800";
  } else if (score >= 40) {
    colorClass = "bg-yellow-100 text-yellow-800";
  } else {
    colorClass = "bg-red-100 text-red-800";
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {score}/100
    </span>
  );
}
