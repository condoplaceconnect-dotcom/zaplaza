import { Badge } from "@/components/ui/badge";

interface CategoryChipsProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

export default function CategoryChips({ 
  categories, 
  selectedCategories, 
  onCategoryToggle 
}: CategoryChipsProps) {
  
  // Add an "All" option to easily clear filters
  const allCategories = ["Todas", ...categories];

  const handleToggle = (category: string) => {
    // If "All" is clicked, clear the selection
    if (category === "Todas") {
      onCategoryToggle("__ALL__"); // Use a special value to signify clearing
    } else {
      onCategoryToggle(category);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allCategories.map((category) => {
        // "All" is active if no other categories are selected.
        const isActive = category === "Todas" 
          ? selectedCategories.length === 0 
          : selectedCategories.includes(category);

        return (
          <Badge
            key={category}
            variant={isActive ? "default" : "outline"}
            onClick={() => handleToggle(category)}
            className="cursor-pointer transition-all text-sm px-3 py-1 border-2"
            data-testid={`category-chip-${category}`}
          >
            {category}
          </Badge>
        );
      })}
    </div>
  );
}
