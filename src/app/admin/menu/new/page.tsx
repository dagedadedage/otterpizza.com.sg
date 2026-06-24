"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/menu/ProductForm";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (formData: any) => {
    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sku: formData.sku,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        categoryId: Number(formData.categoryId),
        imageUrl: formData.imageUrl || undefined,
        inStock: formData.inStock,
        isFeatured: formData.isFeatured,
        tags: formData.tags
          ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
        sortOrder: Number(formData.sortOrder) || 0,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to create product");
    }

    const product = await res.json();
    router.push(`/admin/menu/${product.id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-muted">{error}</p>
        <Button variant="outline" onClick={() => router.push("/admin/menu")}>
          Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark">New Product</h2>
        <p className="text-sm text-muted mt-1">Add a new product to the menu</p>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/menu")}
        />
      </div>
    </div>
  );
}
