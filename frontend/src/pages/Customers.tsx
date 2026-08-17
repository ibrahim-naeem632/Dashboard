import React,{useState,useEffect,useCallback} from "react";
import Table from "../components/Table";
import RoleBanner from "../components/RoleBanner";
import {customersApi,localData} from "../services/api";
import {useToast} from "../context/ToastContext";
import {useAuth,PERMISSIONS} from "../hooks/useAuth";
import {validators,hasErrors,type FieldError} from "../utils/validate";
import "../styles/customers.css";
import "../styles/modal.css";

type C={id:string;name:string;email:string;phone:string;orders:number;spent:number;status:string;joined:string;};
type F={name:string;email:string;phone:string;};
const EMPTY:F={name:"",email:"",phone:""};

function validate(f:F):FieldError{
  const e:FieldError={};
  const n=validators.required(f.name,"Name");if(n)e.name=n;
  const em=validators.email(f.email);if(em)e.email=em;
  const ph=validators.phone(f.phone);if(ph)e.phone=ph;
  return e;
}

interface MP{title:string;form:F;errors:FieldError;saving:boolean;onChange:(k:keyof F,v:string)=>void;onClose:()=>void;onSubmit:()=>void;}
const CustomerModal:React.FC<MP>=({title,form,errors,saving,onChange,onClose,onSubmit})=>(
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3 className="modal-title">{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
      <div className="modal-body">
        <div className="form-field">
          <label className="form-label">Full Name *</label>
          <input autoFocus className={`form-input ${errors.name?"error":""}`} value={form.name}
            onChange={e=>onChange("name",e.target.value)} placeholder="Enter full name" maxLength={80}/>
          {errors.name&&<span className="form-error">⚠ {errors.name}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Email Address *</label>
          <input className={`form-input ${errors.email?"error":""}`} type="email" value={form.email}
            onChange={e=>onChange("email",e.target.value)} placeholder="customer@example.com"/>
          {errors.email&&<span className="form-error">⚠ {errors.email}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Phone (optional)</label>
          <input className={`form-input ${errors.phone?"error":""}`} type="tel" value={form.phone}
            onChange={e=>onChange("phone",e.target.value)} placeholder="+92 300 0000000"/>
          {errors.phone&&<span className="form-error">⚠ {errors.phone}</span>}
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
          {saving&&<span className="btn-spinner"/>}{saving?"Saving...":title.includes("Add")?"Add Customer":"Save Changes"}
        </button>
      </div>
    </div>
  </div>
);

const Customers:React.FC=()=>{
  const{toast}=useToast(); const auth=useAuth(); const canEdit=PERMISSIONS.canEdit(auth.role);
  const[customers,setCustomers]=useState<C[]>([]); const[loading,setLoading]=useState(true);
  const[offline,setOffline]=useState(false); const[filter,setFilter]=useState("All");
  const[showAdd,setShowAdd]=useState(false); const[editing,setEditing]=useState<C|null>(null);
  const[form,setForm]=useState<F>(EMPTY); const[errors,setErrors]=useState<FieldError>({});
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    customersApi.getAll().then(d=>{setCustomers(d);setOffline(false);}).catch(()=>{setCustomers(localData.customers);setOffline(true);}).finally(()=>setLoading(false));
  },[]);

  const handleChange=useCallback((k:keyof F,v:string)=>{setForm(p=>({...p,[k]:v}));setErrors(p=>({...p,[k]:""}));},[]);
  const filtered=filter==="All"?customers:customers.filter(c=>c.status===filter);
  const totalRev=customers.reduce((s,c)=>s+c.spent,0);

  const columns=[
    {header:"Name",   accessor:"name"},
    {header:"Email",  accessor:"email"},
    {header:"Phone",  accessor:"phone"},
    {header:"Orders", accessor:"orders"},
    {header:"Spent",  accessor:"spent",render:(v:number)=><strong>${v.toLocaleString()}</strong>},
    {header:"Status", accessor:"status"},
    {header:"Joined", accessor:"joined"},
  ];

  const openAdd=()=>{if(!canEdit){toast("Viewers cannot add customers","error");return;}setForm(EMPTY);setErrors({});setShowAdd(true);};
  const openEdit=(row:any)=>{if(!canEdit){toast("Viewers cannot edit customers","error");return;}setForm({name:row.name,email:row.email,phone:row.phone});setErrors({});setEditing(row);};

  const handleAddSubmit=async()=>{
    const errs=validate(form);if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const c=offline?{id:`c${Date.now()}`,...form,orders:0,spent:0,status:"Active",joined:new Date().toISOString().split("T")[0]}:await customersApi.create(form);
      setCustomers(p=>[c,...p]);setShowAdd(false);toast(`"${form.name}" added`,"success");
    }catch(e:any){toast(e.message||"Failed","error");}finally{setSaving(false);}
  };

  const handleEditSubmit=async()=>{
    if(!editing)return;const errs=validate(form);if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const c=offline?{...editing,...form}:await customersApi.update(editing.id,form);
      setCustomers(p=>p.map(x=>x.id===editing.id?{...x,...c}:x));setEditing(null);toast(`"${form.name}" updated`,"success");
    }catch(e:any){toast(e.message||"Failed","error");}finally{setSaving(false);}
  };

  const handleDelete=async(id:string)=>{
    if(!canEdit){toast("Viewers cannot delete customers","error");return;}
    const c=customers.find(x=>x.id===id);
    try{
      if(offline)setCustomers(p=>p.filter(x=>x.id!==id));
      else{await customersApi.delete(id);setCustomers(p=>p.filter(x=>x.id!==id));}
      toast(`"${c?.name}" deleted`,"success");
    }catch(e:any){toast(e.message||"Failed","error");}
  };

  return(
    <div className="customers fade-up">
      <RoleBanner/>
      <div className="page-header">
        <div className="page-header-left"><h2>Customers</h2><p>Manage your customer base{offline&&<span className="offline-badge">⚡ Offline</span>}</p></div>
      </div>
      <div className="stats-row">
        <div className="mini-stat"><span className="mini-stat-label">Total</span><span className="mini-stat-value">{customers.length}</span></div>
        <div className="mini-stat"><span className="mini-stat-label">Active</span><span className="mini-stat-value" style={{color:"var(--green)"}}>{customers.filter(c=>c.status==="Active").length}</span></div>
        <div className="mini-stat"><span className="mini-stat-label">Revenue</span><span className="mini-stat-value" style={{color:"var(--brand)"}}>${totalRev.toLocaleString()}</span></div>
      </div>
      <div className="filter-bar">
        {["All","Active","Inactive"].map(f=>(
          <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
            {f}{f!=="All"&&<span className="filter-count">{customers.filter(c=>c.status===f).length}</span>}
          </button>
        ))}
      </div>
      <Table columns={columns} data={filtered} rowsPerPage={10}
        showActions={canEdit} onAdd={canEdit?openAdd:undefined}
        onEdit={canEdit?openEdit:undefined} onDelete={canEdit?handleDelete:undefined}
        addButtonLabel="Add Customer" emptyMessage="No customers found"
        loading={loading} exportFilename="customers"/>
      {showAdd&&<CustomerModal title="Add New Customer"       form={form} errors={errors} saving={saving} onChange={handleChange} onClose={()=>setShowAdd(false)} onSubmit={handleAddSubmit}/>}
      {editing&&<CustomerModal title={`Edit: ${editing.name}`} form={form} errors={errors} saving={saving} onChange={handleChange} onClose={()=>setEditing(null)}  onSubmit={handleEditSubmit}/>}
    </div>
  );
};
export default Customers;
