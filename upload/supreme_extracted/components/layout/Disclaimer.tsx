export function Disclaimer({ className }: { className?: string }) {
  return (
    <div className={`bg-muted/50 border border-muted rounded-lg p-4 text-sm text-muted-foreground ${className || ''}`}>
      <p className="flex items-start gap-2">
        <span className="text-amber-500">⚠️</span>
        <span>
          <strong>DISCLAIMER:</strong> Prediction market simulation for entertainment purposes only. 
          Not all ideas may be implemented. Past performance does not guarantee future results. 
          This platform is for users 18+ only. Void where prohibited.
        </span>
      </p>
    </div>
  )
}