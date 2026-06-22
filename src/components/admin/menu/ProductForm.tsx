"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: number | "";
  imageUrl: string;
  inStock: boolean;
  isFeatured: boolean;
  tags: string;
  sortOrder: number;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isEditing = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: initialData?.sku || "",
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    salePrice: initialData?.salePrice || "",
    categoryId: initialData?.categoryId ?? "",
    imageUrl: initialData?.imageUrl || "",
    inStock: initialData?.inStock ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    tags: initialData?.tags || "",
    sortOrder: initialData?.sortOrder ?? 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    // Auto-generate slug from name
    if (name === "name" && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, [name]: value, slug }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU is required");
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setError("Valid price is required");
      return;
    }
    if (!formData.categoryId) {
      setError("Category is required");
      return;
    }
    if (!formData.slug.trim()) {
      setError("Slug is required");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Margherita Pizza"
          required
        />
        <Input
          label="SKU *"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="PZ-MARG-001"
          required
        />
      </div>

      <Input
        label="Slug *"
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        placeholder="margherita-pizza"
        required
      />

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1.5 flex w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Fresh mozzarella, tomato sauce, basil..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price * ($)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          placeholder="18.00"
          required
        />
        <Input
          label="Sale Price ($)"
          name="salePrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.salePrice}
          onChange={handleChange}
          placeholder="15.00"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryId">Category *</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="mt-1.5 flex h-10 w-full rounded-lg border border-border bg-warm-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Image URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <Input
        label="Tags (comma-separated)"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="bestseller, vegetarian, spicy"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            checked={formData.inStock}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                inStock: e.target.checked,
              }))
            }
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isFeatured: e.target.checked,
              }))
            }
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>

        <Input
          label="Sort Order"
          name="sortOrder"
          type="number"
          min="0"
          value={formData.sortOrder}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? "Update Product" : "Create Product"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
