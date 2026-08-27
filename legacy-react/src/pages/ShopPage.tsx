import { useDeferredValue, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import ProductGrid, { ProductGridSkeleton } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SORT_OPTIONS, CATEGORIES, PRODUCTS_PER_PAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

export default function ShopPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    category || searchParams.get("category") || ""
  );
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort") || "newest"
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [page, setPage] = useState(0);
  const deferredSearch = useDeferredValue(searchQuery.trim());

  const categories = useQuery(api.categories.list);

  const categoryId = useMemo(() => {
    if (!selectedCategory) return undefined;
    const cat = categories?.find((c) => c.slug === selectedCategory);
    return cat?._id;
  }, [selectedCategory, categories]);

  const products = useQuery(api.products.list, {
    categoryId,
    sort: selectedSort,
    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
    minPrice,
    maxPrice,
    search: deferredSearch || undefined,
    limit: PRODUCTS_PER_PAGE,
    offset: page * PRODUCTS_PER_PAGE,
  });

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSort("newest");
    setSelectedSizes([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchQuery("");
    setPage(0);
    setSearchParams({});
  };

  const activeFilterCount = [
    selectedCategory,
    selectedSizes.length > 0,
    minPrice !== undefined || maxPrice !== undefined,
    searchQuery,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
          {selectedCategory
            ? CATEGORIES.find((c) => c.id === selectedCategory)?.name || "Shop"
            : "Shop All"}
        </h1>
        <p className="text-muted-foreground">
          {products ? `${products.total} products found` : "Loading..."}
        </p>
      </motion.div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(v) => {
              setSelectedCategory(v);
              setPage(0);
            }}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            minPrice={minPrice}
            setMinPrice={(v) => {
              setMinPrice(v);
              setPage(0);
            }}
            maxPrice={maxPrice}
            setMaxPrice={(v) => {
              setMaxPrice(v);
              setPage(0);
            }}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="rose" className="ml-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Search in shop */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="pl-9 w-64"
                />
              </div>
            </div>

            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setPage(0);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setPage(0);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSizes.map((size) => (
                <Badge key={size} variant="secondary" className="gap-1">
                  {size}
                  <button onClick={() => toggleSize(size)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPage(0);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden mb-6 p-4 bg-card rounded-lg border border-border animate-fade-in">
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={(v) => {
                  setSelectedCategory(v);
                  setPage(0);
                }}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                minPrice={minPrice}
                setMinPrice={(v) => {
                  setMinPrice(v);
                  setPage(0);
                }}
                maxPrice={maxPrice}
                setMaxPrice={(v) => {
                  setMaxPrice(v);
                  setPage(0);
                }}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          )}

          {/* Products */}
          {products ? (
            <ProductGrid products={products.products} />
          ) : (
            <ProductGridSkeleton />
          )}

          {/* Pagination */}
          {products && products.total > PRODUCTS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page + 1} of{" "}
                {Math.ceil(products.total / PRODUCTS_PER_PAGE)}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={!products.hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSizes,
  toggleSize,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  clearFilters,
  activeFilterCount,
}: {
  categories:
    | { _id: string; name: string; slug: string }[]
    | undefined;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  minPrice: number | undefined;
  setMinPrice: (v: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (v: number | undefined) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}) {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider">
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategory("")}
            className={cn(
              "block w-full text-left text-sm py-1 px-2 rounded transition-colors",
              !selectedCategory
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent"
            )}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                "block w-full text-left text-sm py-1 px-2 rounded transition-colors",
                selectedCategory === cat.slug
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-sm font-medium mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium transition-all",
                selectedSizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice !== undefined ? minPrice / 100 : ""}
            onChange={(e) =>
              setMinPrice(
                e.target.value ? Number(e.target.value) * 100 : undefined
              )
            }
            className="h-9 text-sm"
          />
          <span className="text-muted-foreground">&mdash;</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice !== undefined ? maxPrice / 100 : ""}
            onChange={(e) =>
              setMaxPrice(
                e.target.value ? Number(e.target.value) * 100 : undefined
              )
            }
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
