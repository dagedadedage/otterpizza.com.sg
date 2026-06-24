"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/admin/menu/ProductForm";
import { parseTags } from "@/lib/utils";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductData {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  categoryId: number;
  category: Category;
  inStock: boolean;
  isFeatured: boolean;
  tags: string;
  sortOrder: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/menu/${params.id}`, {
          credentials: "include",
        }),
        fetch("/api/admin/categories", {
          credentials: "include",
        }),
      ]);

      if (!productRes.ok) {
        if (productRes.status === 404) throw new Error("Product not found");
        throw new Error("Failed to load product");
      }
      if (!categoriesRes.ok) throw new Error("Failed to load categories");

      const productData = await productRes.json();
      const categoriesData = await categoriesRes.json();

      setProduct(productData);
      setCategories(categoriesData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData: any) => {
    const res = await fetch(`/api/admin/menu/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        sku: formData.sku,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        categoryId: Number(formData.categoryId),
        imageUrl: formData.imageUrl || null,
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
      throw new Error(errData.error || "Failed to update product");
    }

    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-muted">{error || "Product not found"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/menu")}>
          Back to Menu
        </Button>
      </div>
    );
  }

  const initialData = {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: String(product.price),
    salePrice: product.salePrice ? String(product.salePrice) : "",
    categoryId: product.categoryId,
    imageUrl: product.imageUrl || "",
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    tags: parseTags(product.tags).join(", "),
    sortOrder: product.sortOrder,
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/menu">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-dark">Edit Product</h2>
            <p className="text-sm text-muted mt-1">{product.name}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <ProductForm
          initialData={initialData}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/menu")}
          isEditing
        />
      </div>
    </div>
  );
}
