import React, { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import api from "../../api/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function ProductList({ onProductClick, searchQuery = "", categoryFilter = null, sellerFilter = null }) {
  const loader = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["products", searchQuery, categoryFilter, sellerFilter],
    queryFn: async ({ pageParam = 1 }) => {
      let url = `/products?page=${pageParam}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (categoryFilter) url += `&category_id=${categoryFilter}`;
      if (sellerFilter) url += `&seller_id=${sellerFilter}`;
      
      const response = await api.get(url);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flat array of all products from all pages
  const products = data?.pages.flatMap((page) => page.data) || [];
  
  // Get store name for title if filtering by seller
  const storeName = products.length > 0 && sellerFilter ? products[0].seller?.store_name : "";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0.1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div style={styles.container}>
      <h2 style={styles.sectionTitle}>
        {searchQuery ? `Search Results for "${searchQuery}"` : 
         categoryFilter ? "Category Products" : 
         sellerFilter ? `Products by ${storeName || "Store"}` : 
         "Featured Products"}
      </h2>
      <div style={{...styles.grid, minHeight: '400px', alignItems: 'start'}} className="responsive-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() => onProductClick && onProductClick(p)}
          />
        ))}
      </div>

      {isFetchingNextPage && (
        <div style={styles.status}>
          <div style={styles.spinner} />
          Loading more products...
        </div>
      )}

      {isLoading && products.length === 0 && (
        <div style={styles.status}>
          <div style={styles.spinner} />
          Fetching initial products...
        </div>
      )}

      {isError && (
        <div style={styles.status}>Error loading products. Please try again.</div>
      )}

      {!hasNextPage && products.length > 0 && (
        <div style={styles.status}>You've seen all products.</div>
      )}

      {!isLoading && !isFetchingNextPage && products.length === 0 && (
        <div style={styles.empty}>No products available right now.</div>
      )}

      {/* Sentinel element — when in view, triggers next page load */}
      <div ref={loader} style={{ height: "20px", marginTop: "0px" }} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "10px 20px 20px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "14px",
    color: "#222",
    borderBottom: "2px solid #eee",
    paddingBottom: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "24px",
  },
  status: {
    textAlign: "center",
    padding: "24px",
    color: "#888",
    fontSize: "14px",
    fontStyle: "italic",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid #ddd",
    borderTop: "3px solid #555",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#aaa",
    fontSize: "16px",
  },
};