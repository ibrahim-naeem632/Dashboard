import React,{useState,useEffect,useCallback} from "react";
import Table from "../components/Table";
import RoleBanner from "../components/RoleBanner";
import {ordersApi,localData} from "../services/api";
import {useToast} from "../context/ToastContext";
import {useAuth,PERMISSIONS} from "../hooks/useAuth";
import {validators,hasErrors,type FieldError} from "../utils/validate";
import "../styles/orders.css";
import "../styles/modal.css";

type Order={id:string;customer:string;amount:number;status:string;date:string;};
type F={customer:string;amount:string;status:string;};
const EMPTY:F={customer:"",amount:"",status:"Pending"};

function validate(f:F):FieldError{
  const e:FieldError={};
  const c=validators.required(f.customer,"Customer name"); if(c)e.customer=c;
  const a=validators.positiveNum(f.amount,"Amount"); if(a)e.amount=a;
  return e;
}

interface MP{title:string;form:F;errors:FieldError;saving:boolean;onChange:(f:keyof F,v:string)=>void;onClose:()=>void;onSubmit:()=>void;}
const OrderModal:React.FC<MP>=({title,form,errors,saving,onChange,onClose,onSubmit})=>(
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3 className="modal-title">{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
      <div className="modal-body">
        <div className="form-field">
          <label className="form-label">Customer Name *</label>
          <input autoFocus className={`form-input ${errors.customer?"error":""}`}
            value={form.customer} onChange={e=>onChange("customer",e.target.value)} placeholder="Enter customer name" maxLength={80}/>
          {errors.customer&&<span className="form-error">⚠ {errors.customer}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Amount (USD) *</label>
          <input className={`form-input ${errors.amount?"error":""}`} type="number"
            value={form.amount} onChange={e=>onChange("amount",e.target.value)} placeholder="0.00" min="0"/>
          {errors.amount&&<span className="form-error">⚠ {errors.amount}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Status</label>
          <select className="form-input" value={form.status} onChange={e=>onChange("status",e.target.value)}>
            {["Pending","Completed","Shipped","Cancelled"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
          {saving&&<span className="btn-spinner"/>}{saving?"Saving...":title.includes("Add")?"Add Order":"Save Changes"}
        </button>
      </div>
    </div>
  </div>
);

const Orders:React.FC=()=>{
  const{toast}=useToast(); const auth=useAuth(); const canEdit=PERMISSIONS.canEdit(auth.role);
  const[orders,setOrders]=useState<Order[]>([]); const[loading,setLoading]=useState(true);
  const[offline,setOffline]=useState(false); const[filter,setFilter]=useState("All");
  const[showAdd,setShowAdd]=useState(false); const[editing,setEditing]=useState<Order|null>(null);
  const[form,setForm]=useState<F>(EMPTY); const[errors,setErrors]=useState<FieldError>({});
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    ordersApi.getAll().then(d=>{setOrders(d);setOffline(false);}).catch(()=>{setOrders(localData.orders);setOffline(true);}).finally(()=>setLoading(false));
  },[]);

  const handleChange=useCallback((f:keyof F,v:string)=>{setForm(p=>({...p,[f]:v}));setErrors(p=>({...p,[f]:""}));},[]);
  const filtered=filter==="All"?orders:orders.filter(o=>o.status===filter);
  const columns=[
    {header:"Order ID",accessor:"id"},
    {header:"Customer",accessor:"customer"},
    {header:"Amount",  accessor:"amount",render:(v:number)=>`$${v}`},
    {header:"Status",  accessor:"status"},
    {header:"Date",    accessor:"date"},
  ];

  const openAdd=()=>{if(!canEdit){toast("Viewers cannot add orders — contact an Admin","error");return;}setForm(EMPTY);setErrors({});setShowAdd(true);};
  const openEdit=(row:any)=>{if(!canEdit){toast("Viewers cannot edit orders","error");return;}setForm({customer:row.customer,amount:String(row.amount),status:row.status});setErrors({});setEditing(row);};

  const handleAddSubmit=async()=>{
    const errs=validate(form);if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const data={customer:form.customer,amount:Number(form.amount),status:form.status};
      const o=offline?{id:`#${Math.floor(1000+Math.random()*9000)}`,date:new Date().toISOString().split("T")[0],...data}:await ordersApi.create(data);
      setOrders(p=>[o,...p]);setShowAdd(false);toast("Order created","success");
    }catch(e:any){toast(e.message||"Failed","error");}finally{setSaving(false);}
  };

  const handleEditSubmit=async()=>{
    if(!editing)return;const errs=validate(form);if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const data={customer:form.customer,amount:Number(form.amount),status:form.status};
      const o=offline?{...editing,...data}:await ordersApi.update(editing.id,data);
      setOrders(p=>p.map(x=>x.id===editing.id?o:x));setEditing(null);toast("Order updated","success");
    }catch(e:any){toast(e.message||"Failed","error");}finally{setSaving(false);}
  };

  const handleDelete=async(id:string)=>{
    if(!canEdit){toast("Viewers cannot delete orders","error");return;}
    try{
      if(offline)setOrders(p=>p.filter(o=>o.id!==id));
      else{await ordersApi.delete(id);setOrders(p=>p.filter(o=>o.id!==id));}
      toast("Order deleted","success");
    }catch(e:any){toast(e.message||"Failed","error");}
  };

  return(
    <div className="orders fade-up">
      <RoleBanner/>
      <div className="page-header">
        <div className="page-header-left"><h2>Orders</h2><p>Track all customer orders{offline&&<span className="offline-badge">⚡ Offline</span>}</p></div>
      </div>
      <div className="filter-bar">
        {["All","Pending","Completed","Shipped","Cancelled"].map(f=>(
          <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
            {f}{f!=="All"&&<span className="filter-count">{orders.filter(o=>o.status===f).length}</span>}
          </button>
        ))}
      </div>
      <Table columns={columns} data={filtered} rowsPerPage={10}
        showActions={canEdit} onAdd={canEdit?openAdd:undefined}
        onEdit={canEdit?openEdit:undefined} onDelete={canEdit?handleDelete:undefined}
        addButtonLabel="Add Order" emptyMessage="No orders found"
        loading={loading} exportFilename="orders"/>
      {showAdd&&<OrderModal title="Add New Order"            form={form} errors={errors} saving={saving} onChange={handleChange} onClose={()=>setShowAdd(false)} onSubmit={handleAddSubmit}/>}
      {editing&&<OrderModal title={`Edit Order ${editing.id}`} form={form} errors={errors} saving={saving} onChange={handleChange} onClose={()=>setEditing(null)} onSubmit={handleEditSubmit}/>}
    </div>
  );
};
export default Orders;
