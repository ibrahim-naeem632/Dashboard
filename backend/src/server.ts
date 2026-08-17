import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose, { Schema, Document, model } from "mongoose";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dashboard-pro-secret-2024";
const MONGO_URI  = process.env.MONGODB_URI || "";

/* ─── SECURITY MIDDLEWARE ─── */
app.use(helmet({ contentSecurityPolicy: false })); // CSP off for development
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter limit on login — 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please wait 15 minutes." },
});
app.use("/api/auth/login", loginLimiter);

app.use(express.json({ limit: "1mb" })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: false }));

/* ─── MONGOOSE MODELS ─── */
interface IUser     extends Document { name:string; email:string; password:string; role:string; }
interface IProduct  extends Document { name:string; price:number; stock:number; category:string; status:string; }
interface IOrder    extends Document { customer:string; amount:number; status:string; date:string; }
interface ICustomer extends Document { name:string; email:string; phone:string; orders:number; spent:number; status:string; joined:string; }

const User     = model<IUser>("User",         new Schema<IUser>    ({ name:{type:String,required:true}, email:{type:String,required:true,unique:true,lowercase:true}, password:{type:String,required:true}, role:{type:String,default:"admin"} },{timestamps:true}));
const Product  = model<IProduct>("Product",   new Schema<IProduct> ({ name:{type:String,required:true}, price:{type:Number,required:true}, stock:{type:Number,required:true}, category:{type:String,required:true}, status:{type:String,default:"Active"} },{timestamps:true}));
const Order    = model<IOrder>("Order",       new Schema<IOrder>   ({ customer:{type:String,required:true}, amount:{type:Number,required:true}, status:{type:String,default:"Pending",enum:["Pending","Completed","Shipped","Cancelled"]}, date:{type:String,default:()=>new Date().toISOString().split("T")[0]} },{timestamps:true}));
const Customer = model<ICustomer>("Customer", new Schema<ICustomer>({ name:{type:String,required:true}, email:{type:String,required:true}, phone:{type:String,default:""}, orders:{type:Number,default:0}, spent:{type:Number,default:0}, status:{type:String,default:"Active"}, joined:{type:String,default:()=>new Date().toISOString().split("T")[0]} },{timestamps:true}));

/* ─── IN-MEMORY FALLBACK ─── */
let useMemory = false;
type MemUser     = { id:string; name:string; email:string; password:string; role:string; };
type MemProduct  = { id:string; name:string; price:number; stock:number; category:string; status:string; };
type MemOrder    = { id:string; customer:string; amount:number; status:string; date:string; };
type MemCustomer = { id:string; name:string; email:string; phone:string; orders:number; spent:number; status:string; joined:string; };

const mem = {
  users:     [] as MemUser[],
  products:  [] as MemProduct[],
  orders:    [] as MemOrder[],
  customers: [] as MemCustomer[],
};

/* ─── SEED ─── */
async function seedDatabase() {
  if (useMemory) {
    if (mem.users.length) return;
    mem.users.push({ id:"u1", name:"Ibrahim Naeem", email:"admin@gmail.com", password:bcrypt.hashSync("1234",10), role:"admin" });
    mem.products = [
      {id:"p1",name:"iPhone 15 Pro",price:1199,stock:24,category:"Mobile",status:"Active"},
      {id:"p2",name:"MacBook Pro M3",price:1999,stock:12,category:"Laptop",status:"Active"},
      {id:"p3",name:"AirPods Pro 2",price:249,stock:58,category:"Audio",status:"Active"},
      {id:"p4",name:"iPad Air",price:599,stock:31,category:"Tablet",status:"Active"},
      {id:"p5",name:"Apple Watch S9",price:399,stock:0,category:"Wearable",status:"Inactive"},
      {id:"p6",name:"Samsung S24 Ultra",price:1299,stock:18,category:"Mobile",status:"Active"},
      {id:"p7",name:"Dell XPS 15",price:1749,stock:7,category:"Laptop",status:"Active"},
      {id:"p8",name:"Sony WH-1000XM5",price:349,stock:42,category:"Audio",status:"Active"},
      {id:"p9",name:"Google Pixel 8",price:699,stock:0,category:"Mobile",status:"Inactive"},
      {id:"p10",name:"Nintendo Switch",price:299,stock:15,category:"Gaming",status:"Active"},
    ];
    mem.orders = [
      {id:"#1001",customer:"Ali Khan",amount:120,status:"Pending",date:"2025-01-15"},
      {id:"#1002",customer:"Ahmed Raza",amount:250,status:"Completed",date:"2025-01-14"},
      {id:"#1003",customer:"Sara Malik",amount:90,status:"Shipped",date:"2025-01-13"},
      {id:"#1004",customer:"Fatima Noor",amount:340,status:"Completed",date:"2025-01-12"},
      {id:"#1005",customer:"Omar Farooq",amount:175,status:"Pending",date:"2025-01-11"},
      {id:"#1006",customer:"Zainab Ali",amount:420,status:"Shipped",date:"2025-01-10"},
      {id:"#1007",customer:"Hassan Shah",amount:65,status:"Cancelled",date:"2025-01-09"},
      {id:"#1008",customer:"Ayesha Tariq",amount:290,status:"Completed",date:"2025-01-08"},
      {id:"#1009",customer:"Bilal Ahmed",amount:130,status:"Pending",date:"2025-01-07"},
      {id:"#1010",customer:"Maryam Iqbal",amount:510,status:"Shipped",date:"2025-01-06"},
    ];
    mem.customers = [
      {id:"c1",name:"Ali Khan",email:"ali@gmail.com",phone:"+92 300 1234567",orders:12,spent:2450,status:"Active",joined:"2024-06-15"},
      {id:"c2",name:"Ahmed Raza",email:"ahmed@gmail.com",phone:"+92 301 2345678",orders:5,spent:890,status:"Active",joined:"2024-07-20"},
      {id:"c3",name:"Sara Malik",email:"sara@gmail.com",phone:"+92 302 3456789",orders:23,spent:5670,status:"Active",joined:"2024-03-10"},
      {id:"c4",name:"Fatima Noor",email:"fatima@gmail.com",phone:"+92 303 4567890",orders:8,spent:1240,status:"Active",joined:"2024-08-01"},
      {id:"c5",name:"Omar Farooq",email:"omar@gmail.com",phone:"+92 304 5678901",orders:0,spent:0,status:"Inactive",joined:"2024-09-12"},
      {id:"c6",name:"Zainab Ali",email:"zainab@gmail.com",phone:"+92 305 6789012",orders:17,spent:3890,status:"Active",joined:"2024-04-22"},
      {id:"c7",name:"Hassan Shah",email:"hassan@gmail.com",phone:"+92 306 7890123",orders:3,spent:420,status:"Active",joined:"2024-10-05"},
      {id:"c8",name:"Ayesha Tariq",email:"ayesha@gmail.com",phone:"+92 307 8901234",orders:31,spent:8900,status:"Active",joined:"2024-01-18"},
    ];
    console.log("✅ In-memory seed loaded");
    return;
  }
  if (await User.countDocuments()) return;
  await User.create({ name:"Ibrahim Naeem", email:"admin@gmail.com", password:bcrypt.hashSync("1234",10), role:"admin" });
  await Product.insertMany([
    {name:"iPhone 15 Pro",price:1199,stock:24,category:"Mobile",status:"Active"},
    {name:"MacBook Pro M3",price:1999,stock:12,category:"Laptop",status:"Active"},
    {name:"AirPods Pro 2",price:249,stock:58,category:"Audio",status:"Active"},
    {name:"iPad Air",price:599,stock:31,category:"Tablet",status:"Active"},
    {name:"Apple Watch S9",price:399,stock:0,category:"Wearable",status:"Inactive"},
    {name:"Samsung S24 Ultra",price:1299,stock:18,category:"Mobile",status:"Active"},
  ]);
  await Order.insertMany([
    {customer:"Ali Khan",amount:120,status:"Pending",date:"2025-01-15"},
    {customer:"Ahmed Raza",amount:250,status:"Completed",date:"2025-01-14"},
    {customer:"Sara Malik",amount:90,status:"Shipped",date:"2025-01-13"},
    {customer:"Fatima Noor",amount:340,status:"Completed",date:"2025-01-12"},
    {customer:"Omar Farooq",amount:175,status:"Pending",date:"2025-01-11"},
    {customer:"Zainab Ali",amount:420,status:"Shipped",date:"2025-01-10"},
  ]);
  await Customer.insertMany([
    {name:"Ali Khan",email:"ali@gmail.com",phone:"+92 300 1234567",orders:12,spent:2450,status:"Active",joined:"2024-06-15"},
    {name:"Ahmed Raza",email:"ahmed@gmail.com",phone:"+92 301 2345678",orders:5,spent:890,status:"Active",joined:"2024-07-20"},
    {name:"Sara Malik",email:"sara@gmail.com",phone:"+92 302 3456789",orders:23,spent:5670,status:"Active",joined:"2024-03-10"},
    {name:"Fatima Noor",email:"fatima@gmail.com",phone:"+92 303 4567890",orders:8,spent:1240,status:"Active",joined:"2024-08-01"},
  ]);
  console.log("✅ MongoDB seed loaded");
}

/* ─── AUTH MIDDLEWARE ─── */
interface AuthReq extends Request { userId?:string; }
function authMiddleware(req:AuthReq, res:Response, next:NextFunction):void {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) { res.status(401).json({message:"No token"}); return; }
  try {
    const d = jwt.verify(token, JWT_SECRET) as {id:string;role:string};
    req.userId = d.id;
    (req as any).userRole = d.role;
    next();
  } catch { res.status(401).json({message:"Invalid token"}); }
}

function toObj(doc:any) {
  const o = doc.toObject ? doc.toObject() : {...doc};
  if (o._id) { o.id = o._id.toString(); delete o._id; delete o.__v; }
  return o;
}

/* ─── AUTH ROUTES ─── */
app.post("/api/auth/login", async (req:Request, res:Response):Promise<void> => {
  const {email,password} = req.body;
  if (!email||!password){res.status(400).json({message:"Fields required"});return;}
  try {
    const user:any = useMemory ? mem.users.find(u=>u.email===email.toLowerCase()) : await User.findOne({email:email.toLowerCase()});
    if (!user||!await bcrypt.compare(password,user.password)){res.status(401).json({message:"Invalid email or password"});return;}
    const id = useMemory ? user.id : user._id.toString();
    const token = jwt.sign({id,role:user.role},JWT_SECRET,{expiresIn:"7d"});
    res.json({token, user:{id,name:user.name,email:user.email,role:user.role}});
  } catch(e:any){res.status(500).json({message:e.message});}
});

app.get("/api/auth/me", authMiddleware, async (req:AuthReq, res:Response):Promise<void> => {
  try {
    const u:any = useMemory ? mem.users.find(u=>u.id===req.userId) : await User.findById(req.userId).select("-password");
    if (!u){res.status(404).json({message:"Not found"});return;}
    const id = useMemory ? u.id : u._id.toString();
    res.json({id,name:u.name,email:u.email,role:u.role});
  } catch(e:any){res.status(500).json({message:e.message});}
});


/* ─── ROLE MIDDLEWARE ─── */
// canEdit: admin or manager can add/edit/delete data
function requireEdit(req: AuthReq, res: Response, next: NextFunction): void {
  const role = (req as any).userRole || "";
  if (role === "admin" || role === "manager") { next(); return; }
  res.status(403).json({ message: "Access denied. Manager or Admin role required to modify data." });
}

// requireAdmin: only admin
function requireAdmin(req: AuthReq, res: Response, next: NextFunction): void {
  const role = (req as any).userRole || "";
  if (role === "admin") { next(); return; }
  res.status(403).json({ message: "Access denied. Admin role required." });
}

/* ─── PRODUCTS ─── */
app.get("/api/products", authMiddleware, async (_,res:Response)=>{
  try{ if(useMemory){res.json(mem.products);return;} res.json((await Product.find().sort({createdAt:-1})).map(toObj)); }catch(e:any){res.status(500).json({message:e.message});}
});
app.post("/api/products", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {name,price,stock,category}=req.body;
  if(!name||price===undefined||stock===undefined||!category){res.status(400).json({message:"All fields required"});return;}
  try{
    const status=Number(stock)>0?"Active":"Inactive";
    if(useMemory){const p={id:`p${Date.now()}`,name,price:Number(price),stock:Number(stock),category,status};mem.products.unshift(p);res.status(201).json(p);return;}
    res.status(201).json(toObj(await Product.create({name,price:Number(price),stock:Number(stock),category,status})));
  }catch(e:any){res.status(500).json({message:e.message});}
});
app.put("/api/products/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {name,price,stock,category}=req.body; const status=Number(stock)>0?"Active":"Inactive";
  try{
    if(useMemory){const i=mem.products.findIndex(p=>p.id===req.params.id);if(i===-1){res.status(404).json({message:"Not found"});return;}mem.products[i]={...mem.products[i],name,price:Number(price),stock:Number(stock),category,status};res.json(mem.products[i]);return;}
    const d=await Product.findByIdAndUpdate(req.params.id,{name,price:Number(price),stock:Number(stock),category,status},{new:true});
    if(!d){res.status(404).json({message:"Not found"});return;} res.json(toObj(d));
  }catch(e:any){res.status(500).json({message:e.message});}
});
app.delete("/api/products/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  try{
    if(useMemory){if(!mem.products.some(p=>p.id===req.params.id)){res.status(404).json({message:"Not found"});return;}mem.products=mem.products.filter(p=>p.id!==req.params.id);res.json({message:"Deleted"});return;}
    if(!await Product.findByIdAndDelete(req.params.id)){res.status(404).json({message:"Not found"});return;} res.json({message:"Deleted"});
  }catch(e:any){res.status(500).json({message:e.message});}
});

/* ─── ORDERS ─── */
app.get("/api/orders", authMiddleware, async (_,res:Response)=>{
  try{ if(useMemory){res.json(mem.orders);return;} res.json((await Order.find().sort({createdAt:-1})).map(toObj)); }catch(e:any){res.status(500).json({message:e.message});}
});
app.post("/api/orders", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {customer,amount,status}=req.body;
  if(!customer||amount===undefined){res.status(400).json({message:"Customer and amount required"});return;}
  try{
    const date=new Date().toISOString().split("T")[0];
    if(useMemory){const o={id:`#${Math.floor(1000+Math.random()*9000)}`,customer,amount:Number(amount),status:status||"Pending",date};mem.orders.unshift(o);res.status(201).json(o);return;}
    res.status(201).json(toObj(await Order.create({customer,amount:Number(amount),status:status||"Pending",date})));
  }catch(e:any){res.status(500).json({message:e.message});}
});
app.put("/api/orders/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {customer,amount,status}=req.body;
  try{
    if(useMemory){const i=mem.orders.findIndex(o=>o.id===req.params.id);if(i===-1){res.status(404).json({message:"Not found"});return;}mem.orders[i]={...mem.orders[i],customer,amount:Number(amount),status};res.json(mem.orders[i]);return;}
    const d=await Order.findByIdAndUpdate(req.params.id,{customer,amount:Number(amount),status},{new:true});
    if(!d){res.status(404).json({message:"Not found"});return;} res.json(toObj(d));
  }catch(e:any){res.status(500).json({message:e.message});}
});
app.delete("/api/orders/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  try{
    if(useMemory){if(!mem.orders.some(o=>o.id===req.params.id)){res.status(404).json({message:"Not found"});return;}mem.orders=mem.orders.filter(o=>o.id!==req.params.id);res.json({message:"Deleted"});return;}
    if(!await Order.findByIdAndDelete(req.params.id)){res.status(404).json({message:"Not found"});return;} res.json({message:"Deleted"});
  }catch(e:any){res.status(500).json({message:e.message});}
});

/* ─── CUSTOMERS ─── */
app.get("/api/customers", authMiddleware, async (_,res:Response)=>{
  try{ if(useMemory){res.json(mem.customers);return;} res.json((await Customer.find().sort({createdAt:-1})).map(toObj)); }catch(e:any){res.status(500).json({message:e.message});}
});
app.post("/api/customers", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {name,email,phone}=req.body;
  if(!name||!email){res.status(400).json({message:"Name and email required"});return;}
  try{
    const joined=new Date().toISOString().split("T")[0];
    if(useMemory){if(mem.customers.find(c=>c.email===email)){res.status(400).json({message:"Email exists"});return;}const c={id:`c${Date.now()}`,name,email,phone:phone||"",orders:0,spent:0,status:"Active",joined};mem.customers.unshift(c);res.status(201).json(c);return;}
    res.status(201).json(toObj(await Customer.create({name,email,phone:phone||"",joined})));
  }catch(e:any){res.status(500).json({message:e.message});}
});
app.put("/api/customers/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {name,email,phone}=req.body;
  try{
    if(useMemory){const i=mem.customers.findIndex(c=>c.id===req.params.id);if(i===-1){res.status(404).json({message:"Not found"});return;}mem.customers[i]={...mem.customers[i],name,email,phone};res.json(mem.customers[i]);return;}
    const d=await Customer.findByIdAndUpdate(req.params.id,{name,email,phone},{new:true});
    if(!d){res.status(404).json({message:"Not found"});return;} res.json(toObj(d));
  }catch(e:any){res.status(500).json({message:e.message});}
});
app.delete("/api/customers/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  try{
    if(useMemory){if(!mem.customers.some(c=>c.id===req.params.id)){res.status(404).json({message:"Not found"});return;}mem.customers=mem.customers.filter(c=>c.id!==req.params.id);res.json({message:"Deleted"});return;}
    if(!await Customer.findByIdAndDelete(req.params.id)){res.status(404).json({message:"Not found"});return;} res.json({message:"Deleted"});
  }catch(e:any){res.status(500).json({message:e.message});}
});

/* ─── ANALYTICS ─── */
app.get("/api/analytics/stats", authMiddleware, async (_,res:Response)=>{
  try{
    if(useMemory){
      const o=mem.orders, c=mem.customers, p=mem.products;
      res.json({revenue:o.filter(x=>x.status==="Completed").reduce((s,x)=>s+x.amount,0),totalOrders:o.length,totalCustomers:c.length,pendingOrders:o.filter(x=>x.status==="Pending").length,lowStockProducts:p.filter(x=>x.stock>0&&x.stock<10).length});
      return;
    }
    const [o,c,p]=await Promise.all([Order.find(),Customer.find(),Product.find()]);
    res.json({revenue:o.filter(x=>x.status==="Completed").reduce((s,x)=>s+x.amount,0),totalOrders:o.length,totalCustomers:c.length,pendingOrders:o.filter(x=>x.status==="Pending").length,lowStockProducts:p.filter(x=>x.stock>0&&x.stock<10).length});
  }catch(e:any){res.status(500).json({message:e.message});}
});

/* ─── USERS (admin management) ─── */
app.get("/api/users", authMiddleware, async (_,res:Response)=>{
  try{
    if(useMemory){ res.json(mem.users.map(u=>({id:u.id,name:u.name,email:u.email,role:u.role,status:"Active"}))); return; }
    const docs=await User.find().select("-password");
    res.json(docs.map(u=>({id:u._id.toString(),name:u.name,email:u.email,role:u.role,status:"Active"})));
  }catch(e:any){res.status(500).json({message:e.message});}
});

app.post("/api/users", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {name,email,password,role}=req.body;
  if(!name||!email||!password){res.status(400).json({message:"Name, email and password required"});return;}
  try{
    if(useMemory){
      if(mem.users.find(u=>u.email===email.toLowerCase())){res.status(400).json({message:"Email already exists"});return;}
      const u:MemUser={id:`u${Date.now()}`,name,email:email.toLowerCase(),password:bcrypt.hashSync(password,10),role:role||"viewer"};
      mem.users.push(u);
      res.status(201).json({id:u.id,name:u.name,email:u.email,role:u.role,status:"Active"});return;
    }
    const exists=await User.findOne({email:email.toLowerCase()});
    if(exists){res.status(400).json({message:"Email already exists"});return;}
    const doc=await User.create({name,email:email.toLowerCase(),password:bcrypt.hashSync(password,10),role:role||"viewer"});
    res.status(201).json({id:doc._id.toString(),name:doc.name,email:doc.email,role:doc.role,status:"Active"});
  }catch(e:any){res.status(500).json({message:e.message});}
});

app.put("/api/users/:id", authMiddleware, requireEdit, async (req:Request,res:Response)=>{
  const {name,email,role,password}=req.body;
  try{
    if(useMemory){
      const i=mem.users.findIndex(u=>u.id===req.params.id);
      if(i===-1){res.status(404).json({message:"User not found"});return;}
      mem.users[i]={...mem.users[i],name,email:email.toLowerCase(),role,
        ...(password?{password:bcrypt.hashSync(password,10)}:{})};
      const u=mem.users[i];
      res.json({id:u.id,name:u.name,email:u.email,role:u.role,status:"Active"});return;
    }
    const update:any={name,email:email.toLowerCase(),role};
    if(password) update.password=bcrypt.hashSync(password,10);
    const doc=await User.findByIdAndUpdate(req.params.id,update,{new:true}).select("-password");
    if(!doc){res.status(404).json({message:"User not found"});return;}
    res.json({id:doc._id.toString(),name:doc.name,email:doc.email,role:doc.role,status:"Active"});
  }catch(e:any){res.status(500).json({message:e.message});}
});

app.delete("/api/users/:id", authMiddleware, requireEdit, async (req:AuthReq,res:Response)=>{
  if(req.params.id===req.userId){res.status(400).json({message:"Cannot delete your own account"});return;}
  try{
    if(useMemory){
      if(!mem.users.some(u=>u.id===req.params.id)){res.status(404).json({message:"Not found"});return;}
      mem.users=mem.users.filter(u=>u.id!==req.params.id);
      res.json({message:"User deleted"});return;
    }
    if(!await User.findByIdAndDelete(req.params.id)){res.status(404).json({message:"Not found"});return;}
    res.json({message:"User deleted"});
  }catch(e:any){res.status(500).json({message:e.message});}
});

app.get("/api/health", (_,res)=>res.json({status:"ok",mode:useMemory?"memory":"mongodb"}));
app.get("/", (_,res)=>res.json({message:"Dashboard Pro API is running ✅",version:"1.0.0",endpoints:"/api/auth/login, /api/products, /api/orders, /api/customers, /api/analytics/stats"}));

/* ─── START ─── */
async function start(){
  if(MONGO_URI){
    try{ await mongoose.connect(MONGO_URI); console.log("✅ MongoDB connected"); useMemory=false; }
    catch(e){ console.warn("⚠️  MongoDB failed, using in-memory:", (e as Error).message); useMemory=true; }
  } else {
    console.log("ℹ️  No MONGODB_URI — using in-memory mode"); useMemory=true;
  }
  await seedDatabase();
  app.listen(PORT,()=>{
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
    console.log(`📦 Mode: ${useMemory?"In-Memory (no MongoDB needed)":"MongoDB"}`);
    console.log(`🔑 Login: admin@gmail.com / 1234\n`);
  });
}
start();
