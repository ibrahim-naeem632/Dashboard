import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import RoleBanner from "../components/RoleBanner";
import { productsApi, localData } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth, PERMISSIONS } from "../hooks/useAuth";
import { validators, hasErrors, type FieldError } from "../utils/validate";
import "../styles/products.css";
import "../styles/modal.css";
import "../styles/animations.css";

type Product  = { id:string; name:string; price:number; stock:number; category:string; status:string; };
type FormData = { name:string; price:string; stock:string; category:string; };
const EMPTY:FormData = { name:"", price:"", stock:"", category:"" };

function validate(f:FormData):FieldError {
  const e:FieldError = {};
  const n=validators.required(f.name,"Product name"); if(n)e.name=n;
  const p=validators.positiveNum(f.price,"Price"); if(p)e.price=p;
  const s=validators.nonNegativeNum(f.stock,"Stock"); if(s)e.stock=s;
  const c=validators.required(f.category,"Category"); if(c)e.category=c;
  return e;
}

/* Modal defined at FILE SCOPE — prevents blink */
interface MP { title:string; form:FormData; errors:FieldError; saving:boolean;
  onChange:(f:keyof FormData,v:string)=>void; onClose:()=>void; onSubmit:()=>void; }

const ProductModal:React.FC<MP> = ({title,form,errors,saving,onChange,onClose,onSubmit}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e=>e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-field">
          <label className="form-label">Product Name *</label>
          <input autoFocus className={`form-input ${errors.name?"error":""}`}
            value={form.name} onChange={e=>onChange("name",e.target.value)}
            placeholder="e.g. iPhone 15 Pro" maxLength={100}/>
          {errors.name && <span className="form-error">⚠ {errors.name}</span>}
        </div>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Price (USD) *</label>
            <input className={`form-input ${errors.price?"error":""}`} type="number"
              value={form.price} onChange={e=>onChange("price",e.target.value)} placeholder="0.00" min="0"/>
            {errors.price && <span className="form-error">⚠ {errors.price}</span>}
          </div>
          <div className="form-field">
            <label className="form-label">Stock Qty *</label>
            <input className={`form-input ${errors.stock?"error":""}`} type="number"
              value={form.stock} onChange={e=>onChange("stock",e.target.value)} placeholder="0" min="0"/>
            {errors.stock && <span className="form-error">⚠ {errors.stock}</span>}
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Category *</label>
          <input className={`form-input ${errors.category?"error":""}`}
            value={form.category} onChange={e=>onChange("category",e.target.value)}
            placeholder="e.g. Mobile, Laptop, Audio"/>
          {errors.category && <span className="form-error">⚠ {errors.category}</span>}
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
          {saving && <span className="btn-spinner"/>}
          {saving ? "Saving..." : title.includes("Add") ? "Add Product" : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
);

const Products:React.FC = () => {
  const { toast } = useToast();
  const auth = useAuth();
  const canEdit = PERMISSIONS.canEdit(auth.role);

  const [products,setProducts] = useState<Product[]>([]);
  const [loading,setLoading]   = useState(true);
  const [offline,setOffline]   = useState(false);
  const [filter,setFilter]     = useState("All");
  const [showAdd,setShowAdd]   = useState(false);
  const [editing,setEditing]   = useState<Product|null>(null);
  const [form,setForm]         = useState<FormData>(EMPTY);
  const [errors,setErrors]     = useState<FieldError>({});
  const [saving,setSaving]     = useState(false);

  useEffect(()=>{
    productsApi.getAll()
      .then(d=>{setProducts(d);setOffline(false);})
      .catch(()=>{setProducts(localData.products);setOffline(true);})
      .finally(()=>setLoading(false));
  },[]);

  const handleChange = useCallback((f:keyof FormData,v:string)=>{
    setForm(p=>({...p,[f]:v})); setErrors(p=>({...p,[f]:""}));
  },[]);

  const categories = ["All",...Array.from(new Set(products.map(p=>p.category)))];
  const filtered   = filter==="All" ? products : products.filter(p=>p.category===filter);

  const columns = [
    {header:"Product",  accessor:"name"},
    {header:"Price",    accessor:"price", render:(v:number)=>`$${v.toLocaleString()}`},
    {header:"Stock",    accessor:"stock",
      render:(v:number)=>(
        <span className={v===0?"stock-out":v<10?"stock-low":"stock-ok"}>
          {v===0?"Out of Stock":v<10?`⚠ Low (${v})`:v}
        </span>
      )},
    {header:"Category", accessor:"category"},
    {header:"Status",   accessor:"status"},
  ];

  const openAdd = () => {
    if(!canEdit){ toast("Viewers cannot add products — contact an Admin","error"); return; }
    setForm(EMPTY); setErrors({}); setShowAdd(true);
  };
  const openEdit = (row:any) => {
    if(!canEdit){ toast("Viewers cannot edit products","error"); return; }
    setForm({name:row.name,price:String(row.price),stock:String(row.stock),category:row.category});
    setErrors({}); setEditing(row);
  };

  const handleAddSubmit = async() => {
    const errs=validate(form); if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const data={name:form.name,price:Number(form.price),stock:Number(form.stock),category:form.category};
      const p = offline
        ? {id:`p${Date.now()}`,...data,status:data.stock>0?"Active":"Inactive"}
        : await productsApi.create(data);
      setProducts(prev=>[p,...prev]); setShowAdd(false);
      toast(`"${form.name}" added to inventory`,"success");
    } catch(e:any){ toast(e.message||"Failed to add product","error"); }
    finally{ setSaving(false); }
  };

  const handleEditSubmit = async() => {
    if(!editing)return;
    const errs=validate(form); if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const data={name:form.name,price:Number(form.price),stock:Number(form.stock),category:form.category};
      const p = offline
        ? {...editing,...data,status:data.stock>0?"Active":"Inactive"}
        : await productsApi.update(editing.id,data);
      setProducts(prev=>prev.map(x=>x.id===editing.id?p:x)); setEditing(null);
      toast(`"${form.name}" updated`,"success");
    } catch(e:any){ toast(e.message||"Failed to update","error"); }
    finally{ setSaving(false); }
  };

  const handleDelete = async(id:string) => {
    if(!canEdit){ toast("Viewers cannot delete products","error"); return; }
    const p=products.find(x=>x.id===id);
    try{
      if(offline) setProducts(prev=>prev.filter(x=>x.id!==id));
      else { await productsApi.delete(id); setProducts(prev=>prev.filter(x=>x.id!==id)); }
      toast(`"${p?.name}" deleted`,"success");
    } catch(e:any){ toast(e.message||"Delete failed","error"); }
  };

  return (
    <div className="products fade-up">
      <RoleBanner/>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Products</h2>
          <p>Manage your inventory{offline&&<span className="offline-badge">⚡ Offline</span>}</p>
        </div>
      </div>
      <div className="filter-bar">
        {categories.map(c=>(
          <button key={c} className={`filter-btn${filter===c?" active":""}`} onClick={()=>setFilter(c)}>
            {c}{c!=="All"&&<span className="filter-count">{products.filter(p=>p.category===c).length}</span>}
          </button>
        ))}
      </div>
      <Table
        columns={columns} data={filtered} rowsPerPage={10}
        showActions={canEdit}
        onAdd={canEdit?openAdd:undefined}
        onEdit={canEdit?openEdit:undefined}
        onDelete={canEdit?handleDelete:undefined}
        addButtonLabel="Add Product"
        emptyMessage="No products found"
        loading={loading}
        exportFilename="products"
      />
      {showAdd&&<ProductModal title="Add New Product"        form={form} errors={errors} saving={saving} onChange={handleChange} onClose={()=>setShowAdd(false)} onSubmit={handleAddSubmit}/>}
      {editing&&<ProductModal title={`Edit: ${editing.name}`} form={form} errors={errors} saving={saving} onChange={handleChange} onClose={()=>setEditing(null)}  onSubmit={handleEditSubmit}/>}
    </div>
  );
};
export default Products;
