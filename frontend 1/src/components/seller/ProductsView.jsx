import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Trash2, CheckSquare, FileText, ChevronDown, Upload, Search, PlusCircle } from 'lucide-react';
import '../../styles.css';
import api from '../../api/api';
import AddProductModal from './AddProductModal';

export default function ProductsView({ onBack, onRefresh, autoOpenAdd = false }) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPostDetailsOpen, setIsPostDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(autoOpenAdd);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    fetchProducts(1, false);
    fetchCategories();
  }, []);

  useEffect(() => {
    if (autoOpenAdd) setIsAddModalOpen(true);
  }, [autoOpenAdd]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setApiCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchProducts = async (targetPage = 1, isAppend = false) => {
    if (targetPage === 1 && !isAppend) setProducts([]);
    else setIsLoadingMore(true);

    try {
      const response = await api.get(`/seller/products?page=${targetPage}`);
      const data = response.data.data.map(p => ({
        id: p.id,
        name: p.name,
        desc: p.description,
        cat: p.categories?.[0]?.name || 'Uncategorized',
        catId: p.categories?.[0]?.id || '',
        price: 'Rs. ' + p.marked_price,
        finalPrice: p.final_price ? 'Rs. ' + p.final_price : '-',
        qty: p.quantity.toString(),
        size: p.size,
        color: p.color,
        images: (p.images || []).map(img => ({ ...img, url: img.url })) || []
      }));
      
      setProducts(prev => isAppend ? [...prev, ...data] : data);
      setPage(targetPage);
      setHasMore(response.data.current_page < response.data.last_page);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoadingMore) {
      fetchProducts(page + 1, true);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/seller/products/${productToDelete}`);
      setProducts(products.filter(p => p.id !== productToDelete));
      onRefresh?.();
    } catch (err) {
      Swal.fire("Failed to delete product");
    } finally {
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsAddModalOpen(true);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalizedQuery === "" ||
      product.id.toLowerCase().includes(normalizedQuery) ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.desc.toLowerCase().includes(normalizedQuery) ||
      product.cat.toLowerCase().includes(normalizedQuery);
    const matchesCategory = categoryFilter ? product.cat === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ paddingBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={onBack}
            style={backBtnStyle}
          >
            ← Back
          </button>
          <button
            onClick={openAddModal}
            className="add-product-btn-main"
          >
            <PlusCircle size={20} />
            <span>Add Product</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="product-filter-select"
            style={{ width: "220px", height: "44px" }}
          >
            <option value="">All Categories</option>
            {apiCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <div style={{ position: "relative", width: "220px", minWidth: "220px" }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="product-search-input"
              style={{ width: "100%", height: "44px", paddingRight: "42px" }}
            />
            <Search size={14} color="#6b7280" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#111", display: "inline-block" }}>Products</h2>
      </div>

      <div className="admin-table-container" onScroll={handleScroll} style={{ boxShadow: "none", borderRadius: "25px", border: "1px solid #d8d8d8", backgroundColor: "#f9f9f9", maxHeight: filteredProducts.length > 8 ? "600px" : "none", overflowY: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product id</th>
               <th>Product Name</th>
               <th>Description</th>
               <th>Category</th>
               <th>Base Price</th>
               <th>Final Price</th>
               <th>QTY</th>
               <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((item, idx) => (
              <tr key={idx} onClick={() => openEditModal(item)} style={{ cursor: "pointer" }}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                 <td>{item.desc}</td>
                 <td>{item.cat}</td>
                 <td>{item.price}</td>
                 <td style={{ fontWeight: '700', color: '#009922' }}>{item.finalPrice}</td>
                 <td>{item.qty}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleSelectProduct(item); setIsPostDetailsOpen(true); }}
                      style={{ backgroundColor: "#1e88e5", color: "white", width: "26px", height: "26px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <FileText size={14} />
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                      style={{ backgroundColor: "#009922", color: "white", width: "26px", height: "26px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <CheckSquare size={14} />
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setProductToDelete(item.id); setIsDeleteConfirmOpen(true); }}
                      style={{ backgroundColor: "#cc1111", color: "white", width: "26px", height: "26px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => { fetchProducts(); onRefresh?.(); }} 
        initialProduct={selectedProduct}
        categories={apiCategories}
      />

      {/* Delete Confirm Modal */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "400px", padding: "40px", background: "white", textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setIsDeleteConfirmOpen(false)}>×</button>
            <div style={{ backgroundColor: "#ff4d4f", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ color: "white", fontSize: "28px", lineHeight: 1 }}>×</span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px" }}>
              Are You Sure, You Wanna Delete?
            </h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button 
                onClick={handleDelete}
                style={{ backgroundColor: "#009922", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                Yes
              </button>
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                style={{ backgroundColor: "#ff0000", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {isPostDetailsOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "450px", padding: "30px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setIsPostDetailsOpen(false)}>×</button>
            <div className="post-images-grid" style={{ marginBottom: "25px" }}>
              <div className="post-main-image">
                <img src={selectedProduct?.images?.[0]?.url || "https://placehold.co/300x300?text=No+Image"} alt="Main View" />
              </div>
              <div className="post-side-images">
                {[1, 2, 3].map((idx) => (
                  <img key={idx} src={selectedProduct?.images?.[idx]?.url || "https://placehold.co/150x150?text=No+Image"} alt={`Side ${idx}`} />
                ))}
              </div>
            </div>
            <h2 className="freezing-modal-title" style={{ marginBottom: "20px", fontSize: "22px" }}>Post Details</h2>
            <div className="freezing-details" style={{ gap: "10px", padding: "0 20px" }}>
              <div className="freezing-row"><div className="freezing-label">Id:</div><div className="freezing-value">{selectedProduct?.id}</div></div>
              <div className="freezing-row"><div className="freezing-label">Description:</div><div className="freezing-value">{selectedProduct?.desc}</div></div>
              <div className="freezing-row"><div className="freezing-label">Category:</div><div className="freezing-value">{selectedProduct?.cat}</div></div>
              <div className="freezing-row"><div className="freezing-label">Quantity:</div><div className="freezing-value">{selectedProduct?.qty}</div></div>
              <div className="freezing-row"><div className="freezing-label">Marked Price:</div><div className="freezing-value">{selectedProduct?.price}</div></div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "25px" }}>
              <button onClick={() => setIsPostDetailsOpen(false)} style={{ backgroundColor: "#0078ff", color: "white", padding: "10px 50px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const backBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  minWidth: "112px",
  height: "44px",
  padding: "0 18px",
  borderRadius: "999px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#ffffff",
  color: "#1f2937",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 16px rgba(0,0,0,0.08)"
};


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 16px",
  borderRadius: "24px",
  border: "1px solid #dcdcdc",
  backgroundColor: "#f2f2f2",
  fontSize: "14px",
  outline: "none",
  boxShadow: "inset 0 4px 8px rgba(0,0,0,0.06)",
  height: "44px",
};
