import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../api/api';

export default function AddProductModal({ isOpen, onClose, onSuccess, initialProduct = null, categories = [] }) {
  const [newProduct, setNewProduct] = useState({
    name: "", desc: "", cat: "", price: "", discount: "", qty: "",
    deliveryFee: "250", deliveryTimeline: "", returnPolicy: "14",
    image1: null, image2: null, image3: null, image4: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    image1: null, image2: null, image3: null, image4: null
  });

  const [variantGroups, setVariantGroups] = useState([
    { label: "Standard", variants: [{ color: '#000000', qty: 0, images: [] }] }
  ]);

  useEffect(() => {
    if (initialProduct) {
      setNewProduct({
        name: initialProduct.name || "",
        desc: initialProduct.desc || "",
        cat: initialProduct.catId || "",
        price: initialProduct.price ? initialProduct.price.toString().replace(/^Rs\.\s*/i, '') : "",
        discount: initialProduct.discount || "",
        qty: initialProduct.qty || "",
        deliveryFee: initialProduct.delivery_fee || "250",
        deliveryTimeline: initialProduct.delivery_timeline || "",
        returnPolicy: initialProduct.return_policy_days || "14",
        image1: null, image2: null, image3: null, image4: null
      });

      // Hydrate Variant Groups
      if (initialProduct.color) {
        try {
          const variantsJson = typeof initialProduct.color === 'string' ? JSON.parse(initialProduct.color) : initialProduct.color;
          const hydrated = variantsJson.map(sData => {
            const label = sData.size || "Standard";
            return {
              label,
              variants: sData.variants.map(v => {
                const matchedImgs = (initialProduct.images || [])
                  .filter(img => img.color === v.color && (img.size === label))
                  .map(img => img.url);
                return { ...v, images: matchedImgs };
              })
            };
          });
          setVariantGroups(hydrated);
        } catch (e) { console.error("Failed to parse variants", e); }
      } else {
        setVariantGroups([{ label: "Standard", variants: [{ color: '#000000', qty: 0, images: [] }] }]);
        if (initialProduct.images) {
          const previews = {};
          initialProduct.images.forEach((img, idx) => {
            if (idx < 4) previews[`image${idx + 1}`] = img.url;
          });
          setImagePreviews(prev => ({ ...prev, ...previews }));
        }
      }
    } else {
      setNewProduct({
        name: "", desc: "", cat: "", price: "", discount: "", qty: "",
        deliveryFee: "250", deliveryTimeline: "", returnPolicy: "14",
        image1: null, image2: null, image3: null, image4: null
      });
      setImagePreviews({ image1: null, image2: null, image3: null, image4: null });
      resetSizeChart();
    }
  }, [initialProduct, isOpen]);

  const resetSizeChart = () => {
    setVariantGroups([{ label: "Standard", variants: [{ color: '#000000', qty: 0, images: [] }] }]);
  };

  const handleNewProductChange = (field, value) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, [field]: previewUrl }));
    setNewProduct(prev => ({ ...prev, [field]: file }));
  };

  const addVariantGroup = () => {
    setVariantGroups([...variantGroups, { label: "", variants: [{ color: '#000000', qty: 0, images: [] }] }]);
  };

  const removeVariantGroup = (idx) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== idx));
  };

  const handleGroupLabelChange = (idx, val) => {
    setVariantGroups(prev => prev.map((g, i) => i === idx ? { ...g, label: val } : g));
  };

  const addColorVariant = (groupIdx) => {
    setVariantGroups(prev => prev.map((g, i) => i === groupIdx ? { ...g, variants: [...g.variants, { color: '#000000', qty: 0, images: [] }] } : g));
  };

  const removeColorVariant = (groupIdx, vIdx) => {
    setVariantGroups(prev => prev.map((g, i) => i === groupIdx ? { ...g, variants: g.variants.filter((_, j) => j !== vIdx) } : g));
  };

  const updateVariant = (groupIdx, vIdx, field, value) => {
    setVariantGroups(prev => prev.map((g, i) => {
      if (i !== groupIdx) return g;
      const newVariants = [...g.variants];
      if (field === 'images') {
        newVariants[vIdx] = { ...newVariants[vIdx], images: [...newVariants[vIdx].images, ...value] };
      } else {
        newVariants[vIdx] = { ...newVariants[vIdx], [field]: value };
      }
      return { ...g, variants: newVariants };
    }));
  };

  const removeVariantImage = (groupIdx, vIdx, imgIdx) => {
    setVariantGroups(prev => prev.map((g, i) => {
      if (i !== groupIdx) return g;
      const newVariants = [...g.variants];
      const newImgs = [...newVariants[vIdx].images];
      newImgs.splice(imgIdx, 1);
      newVariants[vIdx] = { ...newVariants[vIdx], images: newImgs };
      return { ...g, variants: newVariants };
    }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.desc);
      formData.append('category_id', newProduct.cat);
      formData.append('marked_price', newProduct.price.toString().replace(/[^\d]/g, ''));
      if (newProduct.discount) formData.append('discount_rate', newProduct.discount);
      formData.append('delivery_fee', newProduct.deliveryFee);
      formData.append('delivery_timeline', newProduct.deliveryTimeline);
      formData.append('return_policy_days', newProduct.returnPolicy);

      const variantsForJson = variantGroups.filter(g => g.label.trim()).map(g => ({
        size: g.label,
        variants: g.variants.map(v => ({ color: v.color, qty: v.qty }))
      }));
      formData.append('color', JSON.stringify(variantsForJson));

      // Images tagging
      variantGroups.forEach(g => {
        g.variants.forEach(v => {
          v.images.forEach(img => {
            if (img instanceof File) {
              formData.append('images[]', img);
              formData.append('image_colors[]', v.color);
              formData.append('image_sizes[]', g.label);
            } else {
              formData.append('existing_images[]', img);
              formData.append('existing_image_colors[]', v.color);
              formData.append('existing_image_sizes[]', g.label);
            }
          });
        });
      });

      const totalQty = variantGroups.length > 0 
        ? variantGroups.reduce((acc, g) => acc + g.variants.reduce((vAcc, v) => vAcc + (parseInt(v.qty) || 0), 0), 0)
        : (parseInt(newProduct.qty) || 0);
      formData.append('quantity', totalQty);

      if (variantGroups.length === 0) {
        // Global images if no variants
        [1, 2, 3, 4].forEach(num => {
          const img = newProduct[`image${num}`];
          if (img instanceof File) {
            formData.append('images[]', img);
          } else if (img && typeof img === 'string') {
            formData.append('existing_images[]', img);
          }
        });
      }


      if (initialProduct) {
        formData.append('_method', 'PUT');
        await api.post(`/seller/products/${initialProduct.id}`, formData);
        Swal.fire("Success", "Product updated!", "success");
      } else {
        await api.post('/seller/products', formData);
        Swal.fire("Success", "Product sent for approval!", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  if (!isOpen) return null;
  const isClothing = Number(newProduct.cat) === 1;

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="post-details-modal-content" style={{ width: "850px", padding: "35px", maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="freezing-modal-close" onClick={onClose} style={{ fontSize: "24px", top: "20px", right: "20px" }}>×</button>
        <h2 className="freezing-modal-title" style={{ marginBottom: "25px" }}>{initialProduct ? "Update Product" : "Add New Product"}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>

          {/* Section 1: Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label className="products-form-field-label">Product Name</label>
                <input type="text" value={newProduct.name} onChange={(e) => handleNewProductChange('name', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="products-form-field-label">Select Category</label>
                <select value={newProduct.cat} onChange={(e) => handleNewProductChange('cat', e.target.value)} style={inputStyle}>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="products-form-field-label">Description</label>
              <textarea value={newProduct.desc} onChange={(e) => handleNewProductChange('desc', e.target.value)} style={{ ...inputStyle, height: "80px", borderRadius: '15px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label className="products-form-field-label">Price (Rs.)</label>
                <input type="text" value={newProduct.price} onChange={(e) => handleNewProductChange('price', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="products-form-field-label">Discount (%)</label>
                <input type="text" value={newProduct.discount} onChange={(e) => handleNewProductChange('discount', e.target.value)} style={inputStyle} />
              </div>
              <div>
                {variantGroups.length === 0 && (
                  <>
                    <label className="products-form-field-label">Quantity</label>
                    <input type="number" value={newProduct.qty} onChange={(e) => handleNewProductChange('qty', e.target.value)} style={inputStyle} />
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '10px' }}>
              <div>
                <label className="products-form-field-label">Delivery Fee (Rs.)</label>
                <input type="number" value={newProduct.deliveryFee} onChange={(e) => handleNewProductChange('deliveryFee', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="products-form-field-label">Delivery Timeline (e.g. 3-5 days)</label>
                <input type="text" value={newProduct.deliveryTimeline} onChange={(e) => handleNewProductChange('deliveryTimeline', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="products-form-field-label">Return Policy (Days)</label>
                <input type="number" value={newProduct.returnPolicy} onChange={(e) => handleNewProductChange('returnPolicy', e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Global Images (Restored for non-variant products) */}
          {variantGroups.length === 0 && (
            <div style={{ marginTop: '10px' }}>
              <label className="products-form-field-label">Product Images</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                {[1, 2, 3, 4].map(num => (
                  <div key={num} style={{ width: '100px', height: '100px', borderRadius: '15px', border: '2px dashed #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#f9f9f9' }}>
                    {imagePreviews[`image${num}`] ? (
                      <>
                        <img src={imagePreviews[`image${num}`]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleImageUpload(`image${num}`, null); 
                            setImagePreviews(p => ({...p, [`image${num}`]: null})); 
                          }} 
                          style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center' }}>
                        <Upload size={20} color="#999" />
                        <span style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Upload</span>
                        <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(`image${num}`, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Section 3: Size Chart & Variant Images (Only for Clothing) */}
        <div style={{ marginTop: '25px', background: '#fcfcfc', padding: '20px', borderRadius: '20px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Variant Settings (Sizes, Types, etc.)</h4>
            <button onClick={addVariantGroup} style={{ background: '#111', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Plus size={16}/> Add New Variant Type</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {variantGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ background: '#fff', padding: '15px', borderRadius: '15px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="E.g. Small, 2x2, Standard..." 
                    value={group.label} 
                    onChange={(e) => handleGroupLabelChange(gIdx, e.target.value)}
                    style={{ ...inputStyle, flex: 1 }} 
                  />
                  <button onClick={() => removeVariantGroup(gIdx)} style={{ ...iconBtnStyle, color: 'red' }}><X size={14}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {group.variants.map((v, vIdx) => (
                    <div key={vIdx} style={{ border: '1px solid #f0f0f0', padding: '10px', borderRadius: '12px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <input type="color" value={v.color} onChange={(e) => updateVariant(gIdx, vIdx, 'color', e.target.value)} style={{ width: '28px', height: '28px', padding: '0', border: 'none', cursor: 'pointer' }} />
                        <input 
                          type="number" 
                          min="0"
                          placeholder="Qty" 
                          value={v.qty} 
                          onChange={(e) => updateVariant(gIdx, vIdx, 'qty', e.target.value)} 
                          style={{ ...inputStyle, width: '70px', height: '30px', padding: '0 8px' }} 
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', padding: '4px 10px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #ddd', fontSize: '11px' }}>
                          <ImageIcon size={14} /> Add Img
                          <input type="file" multiple hidden accept="image/*" onChange={(e) => updateVariant(gIdx, vIdx, 'images', Array.from(e.target.files))} />
                        </label>
                        <button onClick={() => addColorVariant(gIdx)} style={iconBtnStyle}><Plus size={14}/></button>
                        {group.variants.length > 1 && <button onClick={() => removeColorVariant(gIdx, vIdx)} style={{...iconBtnStyle, color: 'red'}}><Trash2 size={12}/></button>}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {v.images.map((img, iIdx) => (
                          <div key={iIdx} style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => removeVariantImage(gIdx, vIdx, iIdx)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', width: '15px', height: '15px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', background: '#111', borderRadius: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Final Inventory to be Uploaded:</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>
              {variantGroups.reduce((acc, g) => acc + g.variants.reduce((vAcc, v) => vAcc + (parseInt(v.qty) || 0), 0), 0)} Units
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <button onClick={handleSubmit} className="products-form-submit" style={{ padding: '15px 80px', borderRadius: '30px', fontSize: '16px', fontWeight: '800', background: '#ff7a1a', border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 10px 20px rgba(255,122,26,0.3)' }}>
            {initialProduct ? "Update Product" : "Send for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 15px", borderRadius: "20px", border: "1px solid #e0e0e0", backgroundColor: "#f9f9f9", fontSize: "14px", outline: "none", boxSizing: 'border-box'
};

const iconBtnStyle = {
  background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};
