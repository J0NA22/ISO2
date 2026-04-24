// src/pages/Products/ProductsPage.jsx
// Catálogo de productos — usa hooks y componentes reutilizables
// Validación con react-hook-form + Zod

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import useProducts from '../../hooks/useProducts';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';

// ── Esquema Zod de validación para el formulario ──
const productSchema = z.object({
  name:        z.string().min(2, 'Al menos 2 caracteres').max(200),
  categoryId:  z.string().min(1, 'Selecciona una categoría'),
  basePrice:   z.string().refine((v) => parseFloat(v) > 0, 'Precio debe ser mayor a 0'),
  barcode:     z.string().max(50).optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
});

const variantSchema = z.object({
  sizeId:        z.string().min(1, 'Selecciona una talla'),
  colorId:       z.string().min(1, 'Selecciona un color'),
  sku:           z.string().min(2, 'SKU requerido').max(50),
  specificPrice: z.string().optional().or(z.literal('')),
  minThreshold:  z.string().optional(),
});

export default function ProductsPage() {
  const {
    products, meta, loading, search, page,
    categories, sizes, colors,
    setSearch, setPage,
    createProduct, updateProduct, deleteProduct, createVariant,
  } = useProducts();

  const [showProduct, setShowProduct] = useState(false);
  const [showVariant, setShowVariant] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // react-hook-form con Zod
  const productForm = useForm({ resolver: zodResolver(productSchema) });
  const variantForm = useForm({ resolver: zodResolver(variantSchema) });

  const handleCreateProduct = async (data) => {
    setSubmitting(true);
    try {
      await createProduct({
        name:        data.name.trim(),
        categoryId:  parseInt(data.categoryId),
        basePrice:   parseFloat(data.basePrice),
        barcode:     data.barcode || undefined,
        description: data.description || undefined,
      });
      setShowProduct(false);
      productForm.reset();
    } catch {
      // El error ya se muestra via el interceptor de Axios
    } finally { setSubmitting(false); }
  };

  const handleCreateVariant = async (data) => {
    setSubmitting(true);
    try {
      await createVariant(selectedProduct.id, {
        sizeId:        parseInt(data.sizeId),
        colorId:       parseInt(data.colorId),
        sku:           data.sku.trim().toUpperCase(),
        specificPrice: data.specificPrice ? parseFloat(data.specificPrice) : undefined,
        minThreshold:  data.minThreshold ? parseInt(data.minThreshold) : 5,
      });
      setShowVariant(false);
      variantForm.reset();
    } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <div className="page-content">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Productos</h1>
          <p className="text-muted text-sm">{meta?.total || 0} productos activos</p>
        </div>
        <button id="new-product-btn" className="btn btn-primary" onClick={() => { productForm.reset(); setShowProduct(true); }}>
          ➕ Nuevo Producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="search-bar mb-4">
        <span className="search-icon">🔍</span>
        <input
          id="product-search"
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Tabla */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No hay productos{search ? ' que coincidan con la búsqueda' : ''}</p>
            {!search && <button className="btn btn-primary" onClick={() => setShowProduct(true)}>Crear primer producto</button>}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio Base</th>
                    <th>Variantes</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const totalStock = p.variants?.reduce((s, v) => s + (v.stock?.quantity || 0), 0) || 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          {p.barcode && <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.barcode}</div>}
                        </td>
                        <td><Badge variant="purple" label={p.category?.name} /></td>
                        <td style={{ fontWeight: 600 }}>C$ {Number(p.basePrice).toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {p.variants?.slice(0, 3).map((v) => (
                              <span key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>
                                <span style={{ background: v.color?.hexCode, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
                                {v.size?.name}
                              </span>
                            ))}
                            {(p.variants?.length || 0) > 3 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{p.variants.length - 3}</span>}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: totalStock === 0 ? 'var(--danger)' : totalStock < 5 ? 'var(--warning)' : 'inherit' }}>
                            {totalStock}
                          </span>
                        </td>
                        <td><Badge status="ACTIVE" /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              id={`add-variant-${p.id}`}
                              className="btn btn-ghost btn-sm"
                              title="Agregar variante"
                              onClick={() => { setSelectedProduct(p); variantForm.reset(); setShowVariant(true); }}
                            >
                              ＋ Variante
                            </button>
                            <button
                              id={`delete-product-${p.id}`}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Desactivar producto"
                              onClick={() => setDeleteTarget(p)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <Pagination page={page} totalPages={meta?.totalPages || 1} onPageChange={setPage} total={meta?.total} />
            </div>
          </>
        )}
      </div>

      {/* Modal crear producto */}
      <Modal open={showProduct} onClose={() => setShowProduct(false)} title="Nuevo Producto">
        <form onSubmit={productForm.handleSubmit(handleCreateProduct)}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input id="product-name" className="form-input" type="text" maxLength={200} {...productForm.register('name')} />
              {productForm.formState.errors.name && <p className="form-error">{productForm.formState.errors.name.message}</p>}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select id="product-category" className="form-select" {...productForm.register('categoryId')}>
                  <option value="">Selecciona...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {productForm.formState.errors.categoryId && <p className="form-error">{productForm.formState.errors.categoryId.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Precio Base (C$) *</label>
                <input id="product-price" className="form-input" type="number" min="0.01" step="0.01" {...productForm.register('basePrice')} />
                {productForm.formState.errors.basePrice && <p className="form-error">{productForm.formState.errors.basePrice.message}</p>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Código de Barras</label>
              <input className="form-input" type="text" maxLength={50} {...productForm.register('barcode')} />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" rows={3} maxLength={1000} {...productForm.register('description')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setShowProduct(false)}>Cancelar</button>
            <button id="submit-product" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal crear variante */}
      <Modal open={showVariant} onClose={() => setShowVariant(false)} title={`Nueva Variante — ${selectedProduct?.name || ''}`}>
        <form onSubmit={variantForm.handleSubmit(handleCreateVariant)}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Talla *</label>
                <select className="form-select" {...variantForm.register('sizeId')}>
                  <option value="">Selecciona...</option>
                  {sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {variantForm.formState.errors.sizeId && <p className="form-error">{variantForm.formState.errors.sizeId.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Color *</label>
                <select className="form-select" {...variantForm.register('colorId')}>
                  <option value="">Selecciona...</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {variantForm.formState.errors.colorId && <p className="form-error">{variantForm.formState.errors.colorId.message}</p>}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="form-input" type="text" maxLength={50} style={{ textTransform: 'uppercase' }} {...variantForm.register('sku')} />
                {variantForm.formState.errors.sku && <p className="form-error">{variantForm.formState.errors.sku.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Precio Específico (C$)</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder={`Base: C$ ${selectedProduct?.basePrice || 0}`} {...variantForm.register('specificPrice')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Stock mínimo de alerta</label>
              <input className="form-input" type="number" min="0" defaultValue={5} {...variantForm.register('minThreshold')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setShowVariant(false)}>Cancelar</button>
            <button id="submit-variant" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Crear Variante'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Desactivar Producto"
        message={`¿Seguro que deseas desactivar "${deleteTarget?.name}"? El producto no aparecerá en el catálogo activo.`}
        confirmLabel="Desactivar"
        loading={submitting}
      />
    </div>
  );
}
