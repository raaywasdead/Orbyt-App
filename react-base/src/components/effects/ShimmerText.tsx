import '../../styles/ShimmerText.css'

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function ShimmerText({ children, className = '' }: ShimmerTextProps) {
  return (
    <span className={`shimmer-text ${className}`}>
      {children}
    </span>
  )
}
