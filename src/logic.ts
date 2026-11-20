export type Trip={id:string;date:string;city:string;km:number|null;price:number|null;rate:number;liters:number|null;fuelCost:number|null;start:string;end:string;duration:number;extra:number;hotel:boolean;hotelName:string;hotelPrice:number;createdAt:number};
export type Settings={consumption:number;salary:number;password:string;periodEnds:Record<string,string>};
export const initialSettings:Settings={consumption:8,salary:30000,password:'',periodEnds:{}};
export const num=(v:string)=>Number(v.replace(',','.'));
export const fmtMoney=(v:number)=>Math.round(v).toLocaleString('uk-UA');
export const fmtNum=(v:number)=>v.toLocaleString('uk-UA',{maximumFractionDigits:2});
export const fmtDate=(d:string)=>`${d.slice(8,10)}/${d.slice(5,7)}/${d.slice(2,4)}`;
export const fmtTime=(m:number)=>`${Math.floor(m/60)} год${m%60?` ${m%60} хв`:''}`;
export const titleCity=(s:string)=>s.replace(/(^|[\s-])([а-яіїєґa-z])/giu,(_,p:string,c:string)=>p+c.toLocaleUpperCase('uk-UA'));
export const minutes=(t:string)=>{const [h,m]=t.split(':').map(Number);return h*60+m};
export function calcTime(date:string,start:string,end:string){const a=minutes(start),b=minutes(end),duration=Math.max(0,b-a),day=new Date(`${date}T12:00:00`).getDay();const extra=(day===0||day===6)?duration:Math.max(0,Math.min(b,480)-a)+Math.max(0,b-Math.max(a,1080))+(duration>0?60:0);return {duration,extra};}
export const monthName=(p:string)=>`${['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'][Number(p.slice(5))-1]} ${p.slice(0,4)}`;
export function adjacent(p:string,n:number){const [y,m]=p.split('-').map(Number);const d=new Date(y,m-1+n,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
export function shift(d:string,n:number){const v=new Date(`${d}T12:00:00`);v.setDate(v.getDate()+n);return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`}
export function monthEnd(p:string){const [y,m]=p.split('-').map(Number);return `${p}-${String(new Date(y,m,0).getDate()).padStart(2,'0')}`}
export function period(p:string,ends:Record<string,string>){const to=ends[p]||monthEnd(p);const from=shift(ends[adjacent(p,-1)]||monthEnd(adjacent(p,-1)),1);return {from,to}}
export const ordered=(rs:Trip[])=>[...rs].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt-b.createdAt||a.id.localeCompare(b.id));
export function monthTrips(rs:Trip[],p:string,ends:Record<string,string>){const {from,to}=period(p,ends);return ordered(rs.filter(r=>r.date>=from&&r.date<=to))}
export function sums(rs:Trip[]){return rs.reduce((a,r)=>({km:a.km+(r.km??0),liters:a.liters+(r.liters??0),fuel:a.fuel+(r.fuelCost??0),extra:a.extra+r.extra,hotel:a.hotel+(r.hotel?r.hotelPrice:0)}),{km:0,liters:0,fuel:0,extra:0,hotel:0})}
export function workdays(p:string){const [y,m]=p.split('-').map(Number);return Array.from({length:new Date(y,m,0).getDate()},(_,i)=>new Date(y,m-1,i+1).getDay()).filter(d=>d!==0&&d!==6).length}
export function reportText(rs:Trip[],p:string,ends:Record<string,string>){const t=sums(rs),q=period(p,ends);return `Звіт — ${monthName(p)}\nПеріод: ${fmtDate(q.from)} – ${fmtDate(q.to)}\n\n${rs.map(r=>`${fmtDate(r.date)} - ${r.city}${r.km!==null?` - ${fmtNum(r.km)} км`:''} - ${fmtTime(r.extra)}${r.hotel?`\nГотель: ${r.hotelName} - ${fmtMoney(r.hotelPrice)} грн.`:''}`).join('\n')}\n\nПальне всього: ${fmtNum(t.km)} км - ${fmtMoney(t.fuel)} грн.\nПонаднормово: ${fmtTime(t.extra)}.\nВідрядження: ${[...new Set(rs.map(r=>r.city))].join(', ')||'—'} - ${new Set(rs.map(r=>r.date)).size} днів.`}
export function totalValues(rs:Trip[],p:string,salary:number){const t=sums(rs),hourly=salary/workdays(p)/8,fuelPay=t.fuel*1.3,extraPay=hourly*t.extra/60;return {...t,hourly,fuelPay,extraPay,total:salary+fuelPay+extraPay+t.hotel}}
