interface IButtonProps {
  canClick?: boolean
  loading: boolean
  actionText: string
}

const Button: React.FC<IButtonProps> = ({ canClick, loading, actionText }) => {
  return (
    <button className="text-lg font-medium focus:outline-none bg-green-100 hover:bg-green-300 py-4 transition-colors border-2 ">
      {loading ? 'Loading...' : actionText}
    </button>
  )
}

export default Button
