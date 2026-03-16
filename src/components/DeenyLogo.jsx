export default function DeenyLogo({ className = 'w-8 h-8', ...props }) {
  return (
    <img
      src="/logo.png"
      alt="Deeny"
      className={className}
      {...props}
    />
  )
}
