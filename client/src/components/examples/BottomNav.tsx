import BottomNav from '../BottomNav';

export default function BottomNavExample() {
  return (
    <div className="relative h-20">
      <BottomNav onNavigate={(path) => console.log('Navigate to:', path)} />
    </div>
  );
}
