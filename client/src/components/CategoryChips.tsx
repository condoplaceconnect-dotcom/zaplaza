import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryChipsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Badge
          variant={selectedCategory === null ? "default" : "secondary"}
          className="cursor-pointer px-4 py-2"
          onClick={() => onSelectCategory(null)}
          data-testid="badge-category-all"
        >
          Todos
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2"
            onClick={() => onSelectCategory(category)}
            data-testid={`badge-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {category}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
