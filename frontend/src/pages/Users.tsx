import React,{useState,useEffect,useCallback} from "react";
import Table from "../components/Table";
import RoleBanner from "../components/RoleBanner";
import {usersApi} from "../services/api";
import {useToast} from "../context/ToastContext";
import {useAuth,PERMISSIONS} from "../hooks/useAuth";
import {validators,hasErrors,type FieldError} from "../utils/validate";
import "../styles/users.css";
import "../styles/modal.css";
import "../styles/animations.css";

type User={id:string;name:string;email:string;role:string;status:string;};
type F={name:string;email:string;password:string;role:string;};
const EMPTY:F={name:"",email:"",password:"",role:"viewer"};

function validate(f:F,isEdit:boolean):FieldError{
  const e:FieldError={};
  const n=validators.required(f.name,"Name");if(n)e.name=n;
  const em=validators.email(f.email);if(em)e.email=em;
  if(!isEdit||f.password){
    if(!isEdit&&!f.password)e.password="Password is required";
    else if(f.password){const pw=validators.minLen(f.password,6,"Password");if(pw)e.password=pw;}
  }
  return e;
}

/* Modal outside — no blink */
interface MP{title:string;form:F;errors:FieldError;saving:boolean;isEdit:boolean;
  onChange:(k:keyof F,v:string)=>void;onClose:()=>void;onSubmit:()=>void;}

const UserModal:React.FC<MP>=({title,form,errors,saving,isEdit,onChange,onClose,onSubmit})=>(
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e=>e.stopPropagation()}>
      <div className="modal-header"><h3 className="modal-title">{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
      <div className="modal-body">
        <div className="form-field">
          <label className="form-label">Full Name *</label>
          <input autoFocus className={`form-input ${errors.name?"error":""}`}
            value={form.name} onChange={e=>onChange("name",e.target.value)} placeholder="Enter full name" maxLength={60}/>
          {errors.name&&<span className="form-error">⚠ {errors.name}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Email Address *</label>
          <input className={`form-input ${errors.email?"error":""}`} type="email"
            value={form.email} onChange={e=>onChange("email",e.target.value)}
            placeholder="user@example.com" disabled={isEdit}/>
          {isEdit&&<span className="form-hint">Email cannot be changed after creation</span>}
          {errors.email&&<span className="form-error">⚠ {errors.email}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">{isEdit?"New Password (optional)":"Password *"}</label>
          <input className={`form-input ${errors.password?"error":""}`} type="password"
            value={form.password} onChange={e=>onChange("password",e.target.value)}
            placeholder={isEdit?"Leave blank to keep current":"Min 6 characters"}/>
          {errors.password&&<span className="form-error">⚠ {errors.password}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Role *</label>
          <select className="form-input" value={form.role} onChange={e=>onChange("role",e.target.value)}>
            <option value="admin">👑 Admin — Full access to everything</option>
            <option value="manager">🔧 Manager — Manage data & users, no Settings</option>
            <option value="viewer">👁 Viewer — Read-only access</option>
          </select>
          <span className="form-hint">
            {form.role==="admin"&&"Full access: can manage everything including Settings and system config."}
            {form.role==="manager"&&"Can add/edit/delete products, orders, customers and users. Cannot access Settings."}
            {form.role==="viewer"&&"Read-only. Can see all data but cannot add, edit, or delete anything."}
          </span>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
          {saving&&<span className="btn-spinner"/>}
          {saving?"Saving...":isEdit?"Save Changes":"Create User"}
        </button>
      </div>
    </div>
  </div>
);

const LOCAL_USERS:User[]=[
  {id:"u1",name:"Ibrahim Naeem",email:"admin@gmail.com",  role:"admin",  status:"Active"},
  {id:"u2",name:"Ali Khan",      email:"ali@gmail.com",   role:"manager",status:"Active"},
  {id:"u3",name:"Sara Malik",    email:"sara@gmail.com",  role:"viewer", status:"Active"},
];

const Users:React.FC=()=>{
  const{toast}=useToast(); const auth=useAuth();
  const canManage=PERMISSIONS.canManageUsers(auth.role);

  const[users,setUsers]=useState<User[]>([]); const[loading,setLoading]=useState(true);
  const[offline,setOffline]=useState(false);
  const[showAdd,setShowAdd]=useState(false); const[editing,setEditing]=useState<User|null>(null);
  const[form,setForm]=useState<F>(EMPTY); const[errors,setErrors]=useState<FieldError>({});
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    usersApi.getAll().then(d=>{setUsers(d);setOffline(false);}).catch(()=>{setUsers(LOCAL_USERS);setOffline(true);}).finally(()=>setLoading(false));
  },[]);

  const handleChange=useCallback((k:keyof F,v:string)=>{setForm(p=>({...p,[k]:v}));setErrors(p=>({...p,[k]:""}));},[]);
  const openAdd=()=>{if(!canManage){toast("Viewers cannot add users","error");return;}setForm(EMPTY);setErrors({});setShowAdd(true);};
  const openEdit=(row:any)=>{if(!canManage){toast("Viewers cannot edit users","error");return;}setForm({name:row.name,email:row.email,password:"",role:row.role});setErrors({});setEditing(row);};

  const handleAddSubmit=async()=>{
    const errs=validate(form,false);if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      if(offline){setUsers(p=>[{id:`u${Date.now()}`,name:form.name,email:form.email,role:form.role,status:"Active"},...p]);}
      else{const u=await usersApi.create({name:form.name,email:form.email,password:form.password,role:form.role});setUsers(p=>[u,...p]);}
      setShowAdd(false);toast(`User "${form.name}" created`,"success");
    }catch(e:any){toast(e.message||"Failed","error");}finally{setSaving(false);}
  };

  const handleEditSubmit=async()=>{
    if(!editing)return;const errs=validate(form,true);if(hasErrors(errs)){setErrors(errs);return;}
    setSaving(true);
    try{
      const payload:any={name:form.name,email:form.email,role:form.role};
      if(form.password)payload.password=form.password;
      if(offline){setUsers(p=>p.map(x=>x.id===editing.id?{...x,...payload}:x));}
      else{const u=await usersApi.update(editing.id,payload);setUsers(p=>p.map(x=>x.id===editing.id?u:x));}
      setEditing(null);toast(`"${form.name}" updated`,"success");
    }catch(e:any){toast(e.message||"Failed","error");}finally{setSaving(false);}
  };

  const handleDelete=async(id:string)=>{
    if(!canManage){toast("Viewers cannot delete users","error");return;}
    if(id===auth.id){toast("You cannot delete your own account","error");return;}
    const u=users.find(x=>x.id===id);
    try{
      if(offline)setUsers(p=>p.filter(x=>x.id!==id));
      else{await usersApi.delete(id);setUsers(p=>p.filter(x=>x.id!==id));}
      toast(`"${u?.name}" deleted`,"success");
    }catch(e:any){toast(e.message||"Failed","error");}
  };

  const roleCell=(role:string)=>(
    <span className={`role-pill role-${role}`}>
      {role==="admin"?"👑 Admin":role==="manager"?"🔧 Manager":"👁 Viewer"}
    </span>
  );

  const nameCell=(_:any,row:any)=>(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,var(--brand),var(--purple))",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>
        {row.name.charAt(0)}
      </div>
      <div>
        <div style={{fontWeight:700,fontSize:"13.5px",color:"var(--text)"}}>{row.name}</div>
        <div style={{fontSize:"11.5px",color:"var(--dim)"}}>{row.email}</div>
      </div>
    </div>
  );

  const columns=[
    {header:"User",  accessor:"name",  render:nameCell},
    {header:"Role",  accessor:"role",  render:roleCell},
    {header:"Status",accessor:"status"},
  ];

  const admins  =users.filter(u=>u.role==="admin").length;
  const managers=users.filter(u=>u.role==="manager").length;
  const viewers =users.filter(u=>u.role==="viewer").length;

  return(
    <div className="users fade-up">
      <RoleBanner/>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Users</h2>
          <p>Manage team members & permissions{offline&&<span className="offline-badge">⚡ Offline</span>}</p>
        </div>
      </div>

      {/* Stats — visible to everyone */}
      <div className="stats-row">
        <div className="mini-stat"><span className="mini-stat-label">Total Users</span><span className="mini-stat-value">{users.length}</span></div>
        <div className="mini-stat"><span className="mini-stat-label">👑 Admins</span><span className="mini-stat-value" style={{color:"var(--purple)"}}>{admins}</span></div>
        <div className="mini-stat"><span className="mini-stat-label">🔧 Managers</span><span className="mini-stat-value" style={{color:"var(--amber)"}}>{managers}</span></div>
        <div className="mini-stat"><span className="mini-stat-label">👁 Viewers</span><span className="mini-stat-value" style={{color:"var(--blue)"}}>{viewers}</span></div>
      </div>

      {/* Table — viewers see data but no actions, managers get full control */}
      <Table columns={columns} data={users} rowsPerPage={10}
        showActions={canManage}
        onAdd={canManage?openAdd:undefined}
        onEdit={canManage?openEdit:undefined}
        onDelete={canManage?handleDelete:undefined}
        addButtonLabel="Add User"
        emptyMessage="No users found"
        loading={loading}
        exportFilename="users"
      />

      {!canManage&&(
        <div style={{
          display:"flex",alignItems:"center",gap:10,padding:"14px 18px",
          background:"var(--blue-dim)",border:"1px solid rgba(59,130,246,.2)",
          borderRadius:"var(--r-sm)",fontSize:13,color:"var(--text2)"
        }}>
          <span style={{fontSize:18}}>ℹ️</span>
          <span>You can <strong>view</strong> user data but cannot add, edit, or delete users. Only Admins and Managers can manage users.</span>
        </div>
      )}

      {showAdd&&<UserModal title="Add New User"          form={form} errors={errors} saving={saving} isEdit={false} onChange={handleChange} onClose={()=>setShowAdd(false)} onSubmit={handleAddSubmit}/>}
      {editing&&<UserModal title={`Edit: ${editing.name}`} form={form} errors={errors} saving={saving} isEdit={true}  onChange={handleChange} onClose={()=>setEditing(null)}  onSubmit={handleEditSubmit}/>}
    </div>
  );
};
export default Users;
