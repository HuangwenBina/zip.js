!function(){"use strict";class t{constructor(){this.crc=-1,this.table=(()=>{const t=[];for(let e=0;e<256;e++){let n=e;for(let t=0;t<8;t++)1&n?n=n>>>1^3988292384:n>>>=1;t[e]=n}return t})()}append(t){const e=this.table;let n=0|this.crc;for(let s=0,i=0|t.length;s<i;s++)n=n>>>8^e[255&(n^t[s])];this.crc=n}get(){return~this.crc}}const e="Invalid pasword",n=16,s="raw",i={name:"PBKDF2"},r={name:"HMAC"},a="SHA-1",c={name:"AES-CTR"},h=Object.assign({hash:r},i),p=Object.assign({iterations:1e3,hash:{name:a}},i),o=Object.assign({hash:a},r),u=Object.assign({length:n},c),d=["deriveBits"],y=["sign"],l=528,g=10,w=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],f=crypto.subtle;class b{constructor(t,e){this.password=t,this.signed=e,this.input=e&&new Uint8Array(0),this.pendingInput=new Uint8Array(0)}async append(t){const i=async(e=0)=>{if(e+n<=a.length-g){const t=a.subarray(e,e+n),s=await f.decrypt(Object.assign({counter:this.counter},u),this.keys.decrypt,t);return U(this.counter),r.set(new Uint8Array(s),e),i(e+n)}return this.pendingInput=a.subarray(e),this.signed&&(this.input=m(this.input,t)),r};if(this.password){const n=t.subarray(0,18);await async function(t,n,i){t.counter=new Uint8Array(w);const r=n.subarray(0,16),a=n.subarray(16),u=(new TextEncoder).encode(i),l=await f.importKey(s,u,h,!1,d),g=await f.deriveBits(Object.assign({salt:r},p),l,528),b=new Uint8Array(g),A=b.subarray(64);if(t.keys={decrypt:await f.importKey(s,b.subarray(0,32),c,!0,["decrypt"]),authentication:await f.importKey(s,b.subarray(32,64),o,!1,y),passwordVerification:A},A[0]!=a[0]||A[1]!=a[1])throw new Error(e)}(this,n,this.password),this.password=null,t=t.subarray(18)}let r=new Uint8Array(t.length-g-(t.length-g)%n),a=t;return this.pendingInput.length&&(a=m(this.pendingInput,t),r=I(r,a.length-g-(a.length-g)%n)),i()}async flush(){const t=this.pendingInput,e=this.keys,n=t.subarray(0,t.length-g),s=t.subarray(t.length-g);let i=new Uint8Array(0);if(n.length){const t=await f.decrypt(Object.assign({counter:this.counter},u),e.decrypt,n);i=new Uint8Array(t)}let a=!0;if(this.signed){const t=await f.sign(r,e.authentication,this.input.subarray(0,this.input.length-g)),n=new Uint8Array(t);this.input=null;for(let t=0;t<g;t++)n[t]!=s[t]&&(a=!1)}return{valid:a,data:i}}}class A{constructor(t){this.password=t,this.output=new Uint8Array(0),this.pendingInput=new Uint8Array(0)}async append(t){const e=async(s=0)=>{if(s+n<=t.length){const a=t.subarray(s,s+n),c=await f.encrypt(Object.assign({counter:this.counter},u),this.keys.encrypt,a);return U(this.counter),r.set(new Uint8Array(c),s+i.length),e(s+n)}return this.pendingInput=t.subarray(s),this.output=m(this.output,r),r};let i=new Uint8Array(0);this.password&&(i=await async function(t,e){t.counter=new Uint8Array(w);const n=crypto.getRandomValues(new Uint8Array(16)),i=(new TextEncoder).encode(e),r=await f.importKey(s,i,h,!1,d),a=await f.deriveBits(Object.assign({salt:n},p),r,l),u=new Uint8Array(a);return t.keys={encrypt:await f.importKey(s,u.subarray(0,32),c,!0,["encrypt"]),authentication:await f.importKey(s,u.subarray(32,64),o,!1,y),passwordVerification:u.subarray(64)},m(n,t.keys.passwordVerification)}(this,this.password),this.password=null);let r=new Uint8Array(i.length+t.length-t.length%n);return r.set(i,0),this.pendingInput.length&&(t=m(this.pendingInput,t),r=I(r,t.length-t.length%n)),e()}async flush(){let t=new Uint8Array(0);if(this.pendingInput.length){const e=await f.encrypt(Object.assign({counter:this.counter},u),this.keys.encrypt,this.pendingInput);t=new Uint8Array(e),this.output=m(this.output,t)}const e=await f.sign(r,this.keys.authentication,this.output.subarray(18));this.output=null;const n=new Uint8Array(e).subarray(0,g);return{data:m(t,n),signature:n}}}function U(t){for(let e=0;e<16;e++){if(255!=t[e]){t[e]++;break}t[e]=0}}function m(t,e){let n=t;return t.length+e.length&&(n=new Uint8Array(t.length+e.length),n.set(t,0),n.set(e,t.length)),n}function I(t,e){if(e&&e>t.length){const n=t;(t=new Uint8Array(e)).set(n,0)}return t}const v="Invalid signature";class k{constructor(e){this.signature=e.inputSignature,this.encrypted=Boolean(e.inputPassword),this.signed=e.inputSigned,this.compressed=e.inputCompressed,this.inflate=this.compressed&&new ZipInflate,this.crc32=this.signed&&this.signed&&new t,this.decrypt=this.encrypted&&new b(e.inputPassword)}async append(t){return this.encrypted&&(t=await this.decrypt.append(t)),this.compressed&&t.length&&(t=await this.inflate.append(t)),!this.encrypted&&this.signed&&this.crc32.append(t),t}async flush(){let t,e=new Uint8Array(0);if(this.encrypted){const t=await this.decrypt.flush();if(!t.valid)throw new Error(v);e=t.data}else if(this.signed){const e=new DataView(new Uint8Array(4).buffer);if(t=this.crc32.get(),e.setUint32(0,t),this.signature!=e.getUint32(0,!1))throw new Error(v)}return this.compressed&&(e=await this.inflate.append(e)||new Uint8Array(0),await this.inflate.flush()),{data:e,signature:t}}}class j{constructor(e){this.encrypted=e.outputEncrypted,this.signed=e.outputSigned,this.compressed=e.outputCompressed,this.deflate=this.compressed&&new ZipDeflate({level:e.level||5}),this.crc32=this.signed&&new t,this.encrypt=this.encrypted&&new A(e.outputPassword)}async append(t){let e=t;return this.compressed&&t.length&&(e=await this.deflate.append(t)),this.encrypted?e=await this.encrypt.append(e):this.signed&&this.crc32.append(t),e}async flush(){let t,e=new Uint8Array(0);if(this.compressed&&(e=await this.deflate.flush()||new Uint8Array(0)),this.encrypted){e=await this.encrypt.append(e);const n=await this.encrypt.flush();t=n.signature;const s=new Uint8Array(e.length+n.data.length);s.set(e,0),s.set(n.data,e.length),e=s}else this.signed&&(t=this.crc32.get());return{data:e,signature:t}}}const E={init(t){t.scripts&&t.scripts.length>0&&t.scripts.length&&importScripts.apply(void 0,t.scripts);const e=t.options;self.initExternalCodec&&self.initExternalCodec(),O=function(t){return t.codecType.startsWith("deflate")?new j(t):t.codecType.startsWith("inflate")?new k(t):void 0}(e)},append:async t=>({data:await O.append(t.data)}),flush:()=>O.flush()};let O;addEventListener("message",(async t=>{const e=t.data,n=e.type,s=E[n];if(s)try{const t=await s(e)||{};if(t.type=n,t.data)try{postMessage(t,[t.data.buffer])}catch(e){postMessage(t)}else postMessage(t)}catch(t){postMessage({type:n,error:{message:t.message,stack:t.stack}})}}))}();
