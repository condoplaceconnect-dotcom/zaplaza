import { Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CreatePostFAB() {
  return (
    <Button
      asChild
      className="fixed bottom-20 right-4 h-16 w-16 rounded-full shadow-lg z-50"
    >
      <Link to="/posts/create">
        <Plus className="h-8 w-8" />
        <span className="sr-only">Criar Anúncio</span>
      </Link>
    </Button>
  );
}
