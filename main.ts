// Tiny stack VM (ISA v1): a faithful interpreter of the reference VM (vm.mjs).
// Correct where the house baseline is not: exact 32-bit MUL, unsigned DIVU/MODU/LTU,
// INT_MIN/-1, shift counts masked to 5 bits, PUSH8 sign extension, and every trap
// code (under/overflow, div-by-zero, bad opcode, memory, call depth, empty RET,
// pc, step limit, output limit) with output kept up to the trap.
import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
// Per-opcode tables (index = opcode byte 0..0x53, 'x' = no such opcode):
// immediate bytes, values popped, values pushed — taken from the ISA's opcode list.
const IMM="01400000xxxxxxxx000000000000000x000xxxxxxxxxxxxx22220xxxxxxxxxxx00xxxxxxxxxxxxxx0000";
const POP="00011223xxxxxxxx222222212221222x222xxxxxxxxxxxxx01100xxxxxxxxxxx12xxxxxxxxxxxxxx1101";
const PSH="01102233xxxxxxxx111111111111111x111xxxxxxxxxxxxx00000xxxxxxxxxxx10xxxxxxxxxxxxxx0010";
function run(p,inp){
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),O=new Uint8Array(65536);
 let sp=0,cp=0,ol=0,ip=0,pc=0,st=0;const n=p.length;
 const done=e=>({o:O.slice(0,ol),e});
 for(;;){
  if(st===1e6)return done(10);
  if(pc<0||pc>=n)return done(9);
  const op=p[pc];
  if(op>83||IMM[op]==='x')return done(5);
  const im=IMM.charCodeAt(op)-48,pp=POP.charCodeAt(op)-48,ps=PSH.charCodeAt(op)-48;
  if(pc+im>=n)return done(9);
  st++;
  if(sp<pp)return done(2);
  if(sp-pp+ps>256)return done(3);
  const nx=pc+1+im;pc=nx;
  if(op<8){
   if(op===0)return done(0);
   if(op===1){D[sp++]=(p[nx-1]<<24)>>24;continue;}
   if(op===2){D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;continue;}
   if(op===3){sp--;continue;}
   if(op===4){D[sp]=D[sp-1];sp++;continue;}
   if(op===5){const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;continue;}
   if(op===6){D[sp]=D[sp-2];sp++;continue;}
   const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;continue;
  }
  if(op>=16&&op<35&&op!==23&&op!==27){
   const b=D[sp-1],a=D[sp-2];let r;
   if(op===16)r=a+b|0;
   else if(op===17)r=a-b|0;
   else if(op===18)r=Math.imul(a,b);
   else if(op===19){if(!b)return done(4);r=a===-2147483648&&b===-1?a:(a/b)|0;}
   else if(op===20){if(!b)return done(4);r=b===-1?0:a%b|0;}
   else if(op===21){if(!b)return done(4);r=Math.floor((a>>>0)/(b>>>0))|0;}
   else if(op===22){if(!b)return done(4);r=(a>>>0)%(b>>>0)|0;}
   else if(op===24)r=a&b;
   else if(op===25)r=a|b;
   else if(op===26)r=a^b;
   else if(op===28)r=a<<(b&31);
   else if(op===29)r=a>>(b&31);
   else if(op===30)r=a>>>(b&31)|0;
   else if(op===32)r=a===b?1:0;
   else if(op===33)r=a<b?1:0;
   else r=(a>>>0)<(b>>>0)?1:0;
   sp-=2;D[sp++]=r;continue;
  }
  if(op===23){D[sp-1]=-D[sp-1]|0;continue;}
  if(op===27){D[sp-1]=~D[sp-1];continue;}
  if(op>=48&&op<51){
   const rel=((p[nx-2]|p[nx-1]<<8)<<16)>>16;
   let t=op===48;
   if(op!==48){const v=D[--sp];t=op===49?v===0:v!==0;}
   if(t)pc=nx+rel;
   continue;
  }
  if(op===51){if(cp===64)return done(7);C[cp++]=nx;pc=p[nx-2]|p[nx-1]<<8;continue;}
  if(op===52){if(!cp)return done(8);pc=C[--cp];continue;}
  if(op===64){const a=D[sp-1];if(a<0||a>255)return done(6);D[sp-1]=M[a];continue;}
  if(op===65){const a=D[sp-1],v=D[sp-2];if(a<0||a>255)return done(6);sp-=2;M[a]=v;continue;}
  if(op===80){
   const s=String(D[sp-1]);
   if(ol+s.length>65536)return done(11);
   sp--;for(let i=0;i<s.length;i++)O[ol++]=s.charCodeAt(i);
   continue;
  }
  if(op===81){if(ol+1>65536)return done(11);O[ol++]=D[--sp]&255;continue;}
  if(op===82){D[sp++]=ip<inp.length?inp[ip++]:-1;continue;}
  return done(D[--sp]&255);
 }
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',Q=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
 const r=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
 mkdirSync(join(Q,id),{recursive:true});
 writeFileSync(join(Q,id,'stdout.bin'),r.o);
 writeFileSync(join(Q,id,'exit.txt'),r.e+'\n');
}
