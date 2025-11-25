import BottomNav from "@/components/BottomNav";
import CreatePostFAB from "@/components/CreatePostFAB";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="pb-16"> {/* Add padding to the bottom to avoid content being hidden by the nav */}
      <main>{children}</main>
      <CreatePostFAB />
      <BottomNav />
    </div>
  );
}
