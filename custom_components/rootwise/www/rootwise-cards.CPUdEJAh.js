var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},h=(e,t)=>!l(e,t),g={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:h};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=g){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??g}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??h)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:`open`},_[p(`elementProperties`)]=new Map,_[p(`finalized`)]=new Map,ae?.({ReactiveElement:_}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var v=globalThis,y=e=>e,b=v.trustedTypes,oe=b?b.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,C=()=>S.createComment(``),w=e=>e===null||typeof e!=`object`&&typeof e!=`function`,T=Array.isArray,ue=e=>T(e)||typeof e?.[Symbol.iterator]==`function`,E=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,k=/>/g,A=RegExp(`>|${E}(?:([^\\s"'>=/]+)(${E}*=${E}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),j=/'/g,M=/"/g,N=/^(?:script|style|textarea|title)$/i,P=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),F=Symbol.for(`lit-noChange`),I=Symbol.for(`lit-nothing`),L=new WeakMap,R=S.createTreeWalker(S,129);function z(e,t){if(!T(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return oe===void 0?t:oe.createHTML(t)}var de=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=D;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===D?c[1]===`!--`?o=O:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=A):(N.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=A):o=k:o===A?c[0]===`>`?(o=i??D,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?A:c[3]===`"`?M:j):o===M||o===j?o=A:o===O||o===k?o=D:(o=A,i=void 0);let d=o===A&&e[t+1].startsWith(`/>`)?` `:``;a+=o===D?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[z(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},B=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=de(t,n);if(this.el=e.createElement(l,r),R.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=R.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?pe:r[1]===`?`?me:r[1]===`@`?he:U}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(N.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=b?b.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],C()),R.nextNode(),c.push({type:2,index:++a});i.append(e[t],C())}}}else if(i.nodeType===8){if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function V(e,t,n=e,r){if(t===F)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=w(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=V(e,i._$AS(e,t.values),i,r)),t}var fe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);R.currentNode=r;let i=R.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new H(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new ge(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=R.nextNode(),a++)}return R.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},H=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=V(this,e,t),w(e)?e===I||e==null||e===``?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==F&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ue(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&w(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=B.createElement(z(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new fe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=L.get(e.strings);return t===void 0&&L.set(e.strings,t=new B(e)),t}k(t){T(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(C()),this.O(C()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=y(e).nextSibling;y(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},U=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=V(this,e,t,0),a=!w(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=V(this,r[n+o],t,o),s===F&&(s=this._$AH[o]),a||=!w(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},pe=class extends U{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},me=class extends U{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},he=class extends U{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=V(this,e,t,0)??I)===F)return;let n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ge=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){V(this,e)}},_e=v.litHtmlPolyfillSupport;_e?.(B,H),(v.litHtmlVersions??=[]).push(`3.3.3`);var ve=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new H(t.insertBefore(C(),e),e,void 0,n??{})}return i._$AI(e),i},W=globalThis,G=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ve(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};G._$litElement$=!0,G.finalized=!0,W.litElementHydrateSupport?.({LitElement:G});var ye=W.litElementPolyfillSupport;ye?.({LitElement:G}),(W.litElementVersions??=[]).push(`4.2.2`);var be=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},xe={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:h},Se=(e=xe,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function Ce(e){return(t,n)=>typeof n==`object`?Se(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function K(e){return Ce({...e,state:!0,attribute:!1})}var q=new WeakMap;function we(e,t){let n=e.connection,r=q.get(n);if(!r){let e={listeners:new Set};e.unsubscribe=n.subscribeMessage(t=>{e.last=t,e.listeners.forEach(e=>e(t))},{type:`rootwise/plants/subscribe`}),q.set(n,e),r=e}let i=r;return i.listeners.add(t),i.last&&t(i.last),()=>{i.listeners.delete(t),i.listeners.size===0&&(q.delete(n),i.unsubscribe?.then(e=>e()).catch(()=>void 0))}}async function Te(e,t,n,r){let i={type:`rootwise/care/log`,plant_id:t,care_type:n};return r&&(i.when=r.toISOString()),(await e.callWS(i)).entry}async function Ee(e,t){await e.callWS({type:`rootwise/care/delete`,entry_id:t})}async function De(e,t){await e.callWS({type:`call_service`,domain:`button`,service:`press`,target:{entity_id:t}})}function Oe(e,t){let n=e.user;return n?n.is_admin||t.user_id!==void 0&&t.user_id===n.id:!1}var ke=864e5;function Ae(e,t,n){let r=new Date(e).getTime()-t.getTime(),i=new Intl.RelativeTimeFormat(n,{numeric:`auto`}),a=Math.abs(r);if(a<6e4)return i.format(0,`second`);if(a<36e5)return i.format(Math.round(r/6e4),`minute`);let o=je(new Date(e),t);return o===0?i.format(Math.round(r/36e5),`hour`):Math.abs(o)<30?i.format(o,`day`):new Intl.DateTimeFormat(n,{dateStyle:`medium`}).format(new Date(e))}function je(e,t){let n=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime();return Math.round((n(e)-n(t))/ke)}function Me(e,t){return new Intl.DateTimeFormat(t,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function Ne(e,t,n){let r=+(e===`temperature`);return new Intl.NumberFormat(n,{maximumFractionDigits:r,minimumFractionDigits:r}).format(t)}var Pe=[`soil_moisture`,`air_humidity`,`battery`];function Fe(e,t,n,r){let i=e===`illuminance`?e=>Math.log10(Math.max(e,0)+1):e=>e,a,o;if(Pe.includes(e))a=0,o=100;else{let s=i(n??r??t??0),c=i(r??n??t??1),l=Math.max(c-s,e===`illuminance`?1:2);a=e===`illuminance`?0:s-l/4,o=c+l/4,t!==null&&(a=Math.min(a,i(t)),o=Math.max(o,i(t)))}let s=e=>Math.min(100,Math.max(0,(i(e)-a)/(o-a)*100));return{low:n===null?0:s(n),high:r===null?100:s(r),marker:t===null?null:s(t)}}var Ie={"status.ok":`All good`,"status.thirsty":`Needs water`,"status.too_wet":`Too wet`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Not watered yet`,"level.dry":`Dry`,"level.drying":`Water soon`,"level.ok":`Just right`,"level.fresh":`Wet, freshly watered`,"level.too_wet":`Too wet`,"m.soil_moisture":`Soil moisture`,"m.temperature":`Temperature`,"m.air_humidity":`Air humidity`,"m.illuminance":`Light`,"m.conductivity":`Fertilizer`,"m.battery":`Battery`,"care.watered":`Watered`,"care.fertilized":`Fertilized`,"care.repotted":`Repotted`,"care.cleaned":`Leaves cleaned`,"care.rotated":`Rotated`,"care.pest_check":`Checked for pests`,"care.pruned":`Pruned`,"care.sensor_moved":`Sensor moved`,"care.note":`Note`,"action.water":`Watered`,"action.undo":`Undo`,"action.snooze":`+1 day`,"action.more":`More`,"action.delete":`Delete`,"action.cancel":`Cancel`,"action.save":`Save`,"when.title":`When did you water?`,"when.now":`Just now`,"when.hours":`A few hours ago`,"when.yesterday":`Yesterday`,"when.pick":`Pick date and time`,"toast.logged":`{type} logged`,"toast.deleted":`Entry deleted`,"toast.failed":`That didn't work: {error}`,last_watered:`Watered {time}`,never_watered:`No watering logged yet`,history:`History`,"history.empty":`Nothing logged yet`,snoozed_until:`Snoozed until {time}`,vacation:`Vacation mode is on`,"reason.below_threshold":`Soil moisture {value} % is below {threshold} %`,"reason.too_wet":`Soil moisture {value} % above {threshold} % for two days`,"reason.sensor_offline":`No data from the soil sensor for 3 hours`,"reason.snoozed":`Snoozed`,"reason.just_watered":`Just watered`,"reason.interval_due":`Due after {days} days`,"reason.no_history":`Log the first watering to start the reminder`,"hint.temperature_low":`Too cold: {value} °C, at least {min} °C`,"hint.temperature_high":`Too warm: {value} °C, at most {max} °C`,"hint.air_humidity_low":`Air too dry: {value} %, at least {min} %`,"hint.air_humidity_high":`Air too humid: {value} %, at most {max} %`,"hint.illuminance_low":`Too dark: {value} lx, at least {min} lx`,"hint.illuminance_high":`Too bright: {value} lx, at most {max} lx`,"hint.conductivity_low":`Little fertilizer: {value} µS/cm, at least {min}`,"hint.conductivity_high":`Too much fertilizer: {value} µS/cm, at most {max}`,"hint.battery_low":`Sensor battery low: {value} %`,"overview.title":`Plants`,"overview.today":`Water today`,"overview.none":`Nobody is thirsty`,"overview.all_done":`Mark all as watered`,"overview.empty":`No plants yet. Add one under Settings → Devices & services → Rootwise.`,not_loaded:`Rootwise is not loaded.`,unknown_plant:`Pick a plant in the card settings.`,"target.range":`target {min}–{max}`,"target.min":`at least {min}`,"target.max":`at most {max}`,no_value:`no value`,"history.moisture":`{value} % soil moisture`,"delete.confirm":`Delete?`,"toast.undone":`Undone`,"more.other_time":`Watered at another time…`,"editor.device_id":`Plant`,"editor.plant":`Plant`,"editor.title":`Title`,"editor.show_history":`Show history`},Le={en:Ie,de:{"status.ok":`Alles gut`,"status.thirsty":`Braucht Wasser`,"status.too_wet":`Zu nass`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Noch nicht gegossen`,"level.dry":`Trocken`,"level.drying":`Bald gießen`,"level.ok":`Passt`,"level.fresh":`Nass, frisch gegossen`,"level.too_wet":`Zu nass`,"m.soil_moisture":`Bodenfeuchte`,"m.temperature":`Temperatur`,"m.air_humidity":`Luftfeuchte`,"m.illuminance":`Licht`,"m.conductivity":`Dünger`,"m.battery":`Batterie`,"care.watered":`Gegossen`,"care.fertilized":`Gedüngt`,"care.repotted":`Umgetopft`,"care.cleaned":`Blätter gereinigt`,"care.rotated":`Gedreht`,"care.pest_check":`Auf Schädlinge geprüft`,"care.pruned":`Geschnitten`,"care.sensor_moved":`Sensor umgesteckt`,"care.note":`Notiz`,"action.water":`Gegossen`,"action.undo":`Rückgängig`,"action.snooze":`+1 Tag`,"action.more":`Mehr`,"action.delete":`Löschen`,"action.cancel":`Abbrechen`,"action.save":`Speichern`,"when.title":`Wann hast du gegossen?`,"when.now":`Gerade eben`,"when.hours":`Vor ein paar Stunden`,"when.yesterday":`Gestern`,"when.pick":`Datum und Uhrzeit wählen`,"toast.logged":`{type} eingetragen`,"toast.deleted":`Eintrag gelöscht`,"toast.failed":`Hat nicht geklappt: {error}`,last_watered:`Gegossen {time}`,never_watered:`Noch kein Gießen eingetragen`,history:`Verlauf`,"history.empty":`Noch nichts eingetragen`,snoozed_until:`Pausiert bis {time}`,vacation:`Urlaubsmodus ist an`,"reason.below_threshold":`Bodenfeuchte {value} % unter {threshold} %`,"reason.too_wet":`Bodenfeuchte seit zwei Tagen über {threshold} % ({value} %)`,"reason.sensor_offline":`Seit 3 Stunden keine Daten vom Bodensensor`,"reason.snoozed":`Pausiert`,"reason.just_watered":`Gerade gegossen`,"reason.interval_due":`Fällig nach {days} Tagen`,"reason.no_history":`Trag das erste Gießen ein, dann startet die Erinnerung`,"hint.temperature_low":`Zu kalt: {value} °C, mindestens {min} °C`,"hint.temperature_high":`Zu warm: {value} °C, höchstens {max} °C`,"hint.air_humidity_low":`Luft zu trocken: {value} %, mindestens {min} %`,"hint.air_humidity_high":`Luft zu feucht: {value} %, höchstens {max} %`,"hint.illuminance_low":`Zu dunkel: {value} lx, mindestens {min} lx`,"hint.illuminance_high":`Zu hell: {value} lx, höchstens {max} lx`,"hint.conductivity_low":`Wenig Dünger: {value} µS/cm, mindestens {min}`,"hint.conductivity_high":`Zu viel Dünger: {value} µS/cm, höchstens {max}`,"hint.battery_low":`Sensor-Batterie schwach: {value} %`,"overview.title":`Pflanzen`,"overview.today":`Heute gießen`,"overview.none":`Niemand hat Durst`,"overview.all_done":`Alle als gegossen eintragen`,"overview.empty":`Noch keine Pflanzen. Leg eine an unter Einstellungen → Geräte & Dienste → Rootwise.`,not_loaded:`Rootwise ist nicht geladen.`,unknown_plant:`Wähle in den Karteneinstellungen eine Pflanze.`,"target.range":`Ziel {min}–{max}`,"target.min":`mindestens {min}`,"target.max":`höchstens {max}`,no_value:`kein Wert`,"history.moisture":`{value} % Bodenfeuchte`,"delete.confirm":`Löschen?`,"toast.undone":`Rückgängig gemacht`,"more.other_time":`Zu anderer Zeit gegossen…`,"editor.device_id":`Pflanze`,"editor.plant":`Pflanze`,"editor.title":`Titel`,"editor.show_history":`Verlauf zeigen`}};function J(e){let t=(e?.locale?.language??e?.language??`en`).slice(0,2);return t in Le?t:`en`}function Y(e,t,n={}){let r=J(e);return(Le[r]?.[t]??Ie[t]??t).replace(/\{(\w+)\}/g,(e,t)=>t in n?Re(n[t],r):e)}function Re(e,t){return typeof e==`number`?new Intl.NumberFormat(t,{maximumFractionDigits:1}).format(e):String(e)}var ze=[`soil_moisture`,`temperature`,`air_humidity`,`illuminance`,`conductivity`];function Be(e,t){if(t.device_id)return e.find(e=>e.device_id===t.device_id);if(t.plant_id)return e.find(e=>e.id===t.plant_id);if(t.plant){let n=t.plant.trim().toLocaleLowerCase();return e.find(e=>e.id===t.plant||e.name.toLocaleLowerCase()===n)}}var Ve=/_(low|high)$/;function He(e){return Ve.test(e.code)}function Ue(e,t){let n=t.reasons.filter(e=>!He(e));if(t.status&&t.status!==`ok`){let t=n.find(e=>e.code!==`snoozed`);return t?Y(e,`reason.${t.code}`,t):null}return t.snoozed_until?Y(e,`snoozed_until`,{time:new Intl.DateTimeFormat(e.language,{weekday:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(t.snoozed_until))}):t.moisture_level?Y(e,`level.${t.moisture_level}`):null}function We(e,t){return t.reasons.filter(He).map(t=>Y(e,`hint.${t.code}`,t))}function Ge(e,t){if(e===`hours`)return new Date(t.getTime()-108e5);if(e===`yesterday`){let e=new Date(t);return e.setDate(e.getDate()-1),e.setHours(18,0,0,0),e}}function Ke(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}function qe(e){return Object.values(e.entities??{}).find(e=>e.platform===`rootwise`&&e.entity_id.endsWith(`_status`)&&e.device_id)?.device_id}var Je=o`
  :host {
    --rw-accent: #2e7d4a;
    --rw-accent-soft: rgba(46, 125, 74, 0.12);
    --rw-water: #1f6fb2;
    --rw-water-ink: #ffffff;
    --rw-water-soft: rgba(31, 111, 178, 0.12);
    --rw-warn: #a8620a;
    --rw-warn-soft: rgba(168, 98, 10, 0.13);
    --rw-prob: #9a3fb0;
    --rw-prob-soft: rgba(154, 63, 176, 0.12);
    --rw-track: rgba(127, 127, 127, 0.16);
    --rw-text: var(--primary-text-color, #16201a);
    --rw-text2: var(--secondary-text-color, #3d4c41);
    --rw-line: var(--divider-color, rgba(127, 127, 127, 0.25));
    --rw-radius: var(--ha-card-border-radius, 12px);
    display: block;
    color: var(--rw-text);
  }
  :host([dark]) {
    --rw-accent: #48a566;
    --rw-accent-soft: rgba(72, 165, 102, 0.16);
    --rw-water: #3e8fd4;
    --rw-water-ink: #06111c;
    --rw-water-soft: rgba(62, 143, 212, 0.18);
    --rw-warn: #c4821a;
    --rw-warn-soft: rgba(196, 130, 26, 0.18);
    --rw-prob: #c064d2;
    --rw-prob-soft: rgba(192, 100, 210, 0.17);
    --rw-track: rgba(255, 255, 255, 0.08);
  }
  * {
    box-sizing: border-box;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:focus-visible,
  [role="button"]:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--rw-accent);
    outline-offset: 2px;
  }
  .num {
    font-variant-numeric: tabular-nums;
  }
  .muted {
    color: var(--rw-text2);
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`,Ye={ok:`var(--rw-accent)`,thirsty:`var(--rw-warn)`,too_wet:`var(--rw-prob)`,sensor_offline:`var(--rw-text2)`,no_history:`var(--rw-text2)`},X={soil_moisture:`mdi:water-percent`,temperature:`mdi:thermometer`,air_humidity:`mdi:water-opacity`,illuminance:`mdi:white-balance-sunny`,conductivity:`mdi:sprout-outline`,battery:`mdi:battery-40`,watered:`mdi:watering-can`,fertilized:`mdi:bottle-tonic-plus`,repotted:`mdi:pot-mix`,cleaned:`mdi:leaf`,rotated:`mdi:rotate-3d-variant`,pest_check:`mdi:bug-check`,pruned:`mdi:content-cut`,sensor_moved:`mdi:cursor-move`,note:`mdi:note-text-outline`};function Z(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var Xe=10,Ze=500,Q=class extends G{constructor(...e){super(...e),this.panel=`none`,this.pickTime=``,this.busy=!1,this.longPressed=!1}static getConfigForm(){let e={language:document.documentElement.lang||`en`};return{schema:[{name:`device_id`,required:!0,selector:{device:{filter:[{integration:`rootwise`}]}}},{name:`show_history`,selector:{boolean:{}}}],computeLabel:t=>Y(e,`editor.${t.name}`)}}static getStubConfig(e){return{device_id:qe(e),show_history:!0}}setConfig(e){this.config={show_history:!0,...e}}getCardSize(){return this.config?.show_history?8:5}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}connectedCallback(){super.connectedCallback(),this.subscribe()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0,window.clearTimeout(this.toastTimer),window.clearTimeout(this.confirmTimer)}willUpdate(e){e.has(`hass`)&&(this.subscribe(),this.toggleAttribute(`dark`,!!this.hass?.themes?.darkMode))}subscribe(){let e=this.hass;e&&this.isConnected&&e.connection!==this.connection&&(this.unsubscribe?.(),this.connection=e.connection,this.unsubscribe=we(e,e=>{this.payload=e}))}get plant(){return this.payload&&this.config?Be(this.payload.plants,this.config):void 0}t(e,t){return Y(this.hass,e,t)}async log(e,t){let n=this.plant;if(n&&this.hass&&!this.busy){this.busy=!0,this.panel=`none`;try{let r=await Te(this.hass,n.id,e,t);this.showToast({text:this.t(`toast.logged`,{type:this.t(`care.${e}`)}),undo:r})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:$(e)})})}finally{this.busy=!1}}}async deleteEntry(e,t){if(this.hass)try{await Ee(this.hass,e.id),this.showToast({text:t})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:$(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},Xe*1e3)}undo(){let e=this.toast?.undo;e&&this.deleteEntry(e,this.t(`toast.undone`))}pressStart(){this.longPressed=!1,window.clearTimeout(this.pressTimer),this.pressTimer=window.setTimeout(()=>{this.longPressed=!0,this.openWhen()},Ze)}pressEnd(){window.clearTimeout(this.pressTimer)}waterClick(){if(this.longPressed){this.longPressed=!1;return}this.log(`watered`)}openWhen(){this.pickTime=``,this.panel=`when`}chooseWhen(e){this.log(`watered`,Ge(e,new Date))}savePicked(){this.pickTime&&this.log(`watered`,new Date(this.pickTime))}askDelete(e){if(this.confirmDelete===e.id){this.confirmDelete=void 0,this.deleteEntry(e,this.t(`toast.deleted`));return}this.confirmDelete=e.id,window.clearTimeout(this.confirmTimer),this.confirmTimer=window.setTimeout(()=>{this.confirmDelete=void 0},4e3)}moreInfo(e){e&&this.dispatchEvent(new CustomEvent(`hass-more-info`,{detail:{entityId:e},bubbles:!0,composed:!0}))}render(){if(!this.payload)return P`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return P`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let e=this.plant;if(!e)return P`<ha-card><div class="empty muted">${this.t(`unknown_plant`)}</div></ha-card>`;let t=this.hass?Ue(this.hass,e):null,n=this.hass?We(this.hass,e):[],r=ze.filter(t=>e.measurements[t]);return P`
      <ha-card>
        ${this.payload.vacation?P`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:I}
        ${this.renderHead(e)}
        ${t?P`<div class="detail">${t}</div>`:I}
        ${r.length?P`<div class="bars">
              ${r.map(t=>this.renderBar(t,e.measurements[t]))}
            </div>`:I}
        ${n.length?P`<ul class="hints">
              ${n.map(e=>P`<li><ha-icon icon="mdi:information-outline"></ha-icon>${e}</li>`)}
            </ul>`:I}
        <div class="last muted">${this.lastWatered(e)}</div>
        ${this.renderActions(e)} ${this.panel===`when`?this.renderWhen():I}
        ${this.panel===`more`?this.renderMore():I}
        ${this.toast?this.renderToast(this.toast):I}
        ${this.config?.show_history?this.renderHistory(e):I}
      </ha-card>
    `}renderHead(e){let t=e.status??`no_history`,n=[e.species.common,e.species.scientific].filter(Boolean).filter((e,t,n)=>n.indexOf(e)===t);return P`
      <div
        class="head"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(e.entity_ids.status)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&this.moreInfo(e.entity_ids.status)}}
      >
        <div class="avatar">
          ${e.species.image_url?P`<img
                src=${e.species.image_url}
                alt=""
                loading="lazy"
                @error=${e=>e.target.hidden=!0}
              />`:I}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="titles">
          <div class="name">${e.name}</div>
          <div class="status">
            <span class="dot" style="background:${Ye[t]}"></span>
            <span>${this.t(`status.${t}`)}${e.area?` · ${e.area}`:``}</span>
          </div>
          ${n.length?P`<div class="species muted">${n.join(` · `)}</div>`:I}
        </div>
      </div>
    `}renderBar(e,t){let n=J(this.hass),r=Fe(e,t.value,t.min,t.max),i=t.unit??``,a=t.value===null?`–`:`${Ne(e,t.value,n)}${i?` ${i}`:``}`,o=t.rating===`low`||t.rating===`high`||t.level===`dry`||t.level===`too_wet`,s=t.min!==null&&t.max!==null?this.t(`target.range`,{min:t.min,max:t.max}):t.min===null?t.max===null?``:this.t(`target.max`,{max:t.max}):this.t(`target.min`,{min:t.min}),c=this.t(`m.${e}`),l=`${c} ${t.value===null?this.t(`no_value`):a}${s?`, ${s}`:``}`;return P`
      <div
        class="bar-row ${o?`off`:``}"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(this.plant?.entity_ids[e])}
      >
        <ha-icon icon=${X[e]??`mdi:gauge`}></ha-icon>
        <span class="label">${c}</span>
        <div class="bar" role="img" aria-label=${l}>
          <div class="zone" style="left:${r.low}%;width:${Math.max(r.high-r.low,0)}%"></div>
          ${e===`soil_moisture`&&r.marker!==null?P`<div class="fill" style="width:${r.marker}%"></div>`:I}
          ${t.min===null?I:P`<div class="tick" style="left:${r.low}%"></div>`}
          ${t.max===null?I:P`<div class="tick" style="left:${r.high}%"></div>`}
          ${r.marker===null?I:P`<div class="marker" style="left:${r.marker}%"></div>`}
        </div>
        <span class="value num">${a}</span>
      </div>
    `}lastWatered(e){return e.last_watered?this.t(`last_watered`,{time:Ae(e.last_watered,new Date,J(this.hass))}):this.t(`never_watered`)}renderActions(e){let t=e.entity_ids.snooze,n=this.toast?.undo?.type===`watered`;return P`
      <div class="actions">
        <button
          class="water ${n?`done`:``}"
          ?disabled=${this.busy}
          @pointerdown=${this.pressStart}
          @pointerup=${this.pressEnd}
          @pointerleave=${this.pressEnd}
          @pointercancel=${this.pressEnd}
          @contextmenu=${e=>e.preventDefault()}
          @click=${this.waterClick}
        >
          <ha-icon icon=${n?`mdi:check`:`mdi:watering-can`}></ha-icon>
          ${this.t(`action.water`)}
        </button>
        ${e.needs_water&&t?P`<button class="secondary" @click=${()=>this.hass&&void De(this.hass,t)}>
              ${this.t(`action.snooze`)}
            </button>`:I}
        <button
          class="icon"
          aria-label=${this.t(`action.more`)}
          aria-haspopup="true"
          aria-expanded=${this.panel===`more`?`true`:`false`}
          @click=${()=>this.panel=this.panel===`more`?`none`:`more`}
        >
          <ha-icon icon="mdi:dots-horizontal"></ha-icon>
        </button>
      </div>
    `}renderWhen(){let e=Ke(new Date);return P`
      <div class="panel" role="group" aria-label=${this.t(`when.title`)}>
        <div class="panel-title">${this.t(`when.title`)}</div>
        <div class="choices">
          ${[`now`,`hours`,`yesterday`].map(e=>P`<button @click=${()=>this.chooseWhen(e)}>${this.t(`when.${e}`)}</button>`)}
        </div>
        <label class="pick">
          <span class="muted">${this.t(`when.pick`)}</span>
          <input
            type="datetime-local"
            max=${e}
            .value=${this.pickTime}
            @input=${e=>this.pickTime=e.target.value}
          />
        </label>
        <div class="panel-actions">
          <button class="secondary" @click=${()=>this.panel=`none`}>${this.t(`action.cancel`)}</button>
          <button class="primary" ?disabled=${!this.pickTime} @click=${this.savePicked}>
            ${this.t(`action.save`)}
          </button>
        </div>
      </div>
    `}renderMore(){return P`
      <div class="panel menu" role="menu">
        <button role="menuitem" @click=${this.openWhen}>
          <ha-icon icon="mdi:clock-edit-outline"></ha-icon>${this.t(`more.other_time`)}
        </button>
        ${[`fertilized`,`sensor_moved`].map(e=>P`<button role="menuitem" @click=${()=>void this.log(e)}>
            <ha-icon icon=${X[e]??`mdi:plus`}></ha-icon>${this.t(`care.${e}`)}
          </button>`)}
      </div>
    `}renderToast(e){return P`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${e.undo?P`<button class="link" @click=${this.undo}>${this.t(`action.undo`)}</button>`:I}
      </div>
    `}renderHistory(e){let t=J(this.hass);return P`
      <div class="history">
        <div class="section">${this.t(`history`)}</div>
        ${e.recent.length===0?P`<div class="muted small">${this.t(`history.empty`)}</div>`:P`<ul>
              ${e.recent.map(e=>{let n=e.data?.moisture,r=this.hass?Oe(this.hass,e):!1,i=this.confirmDelete===e.id;return P`<li>
                  <ha-icon icon=${X[e.type]??`mdi:circle-small`}></ha-icon>
                  <div class="entry">
                    <span>${this.t(`care.${e.type}`)}</span>
                    <span class="muted small">
                      ${Me(e.ts,t)}${n===void 0?``:` · ${this.t(`history.moisture`,{value:n})}`}
                    </span>
                  </div>
                  ${r?P`<button
                        class="delete ${i?`confirm`:``}"
                        aria-label=${this.t(`action.delete`)}
                        @click=${()=>this.askDelete(e)}
                      >
                        ${i?this.t(`delete.confirm`):P`<ha-icon icon="mdi:delete-outline"></ha-icon>`}
                      </button>`:I}
                </li>`})}
            </ul>`}
      </div>
    `}static{this.styles=[Je,o`
      ha-card {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
      }
      .empty {
        padding: 8px 0;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--rw-water-soft);
        font-size: 14px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        border-radius: 12px;
      }
      .avatar {
        position: relative;
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar ha-icon {
        --mdc-icon-size: 30px;
      }
      .avatar img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .titles {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .name {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }
      .status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .species {
        font-size: 12px;
        font-style: italic;
      }
      .detail {
        font-size: 15px;
        font-weight: 600;
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bar-row {
        display: grid;
        grid-template-columns: 20px minmax(64px, 7.5em) 1fr minmax(52px, auto);
        align-items: center;
        gap: 10px;
        font-size: 14px;
        cursor: pointer;
        min-height: 28px;
      }
      .bar-row ha-icon {
        color: var(--rw-text2);
      }
      .bar-row .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bar {
        position: relative;
        height: 8px;
        border-radius: 4px;
        background: var(--rw-track);
      }
      .zone {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 4px;
        background: var(--rw-accent-soft);
        box-shadow: inset 0 0 0 1px var(--rw-accent-soft);
      }
      .fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: 4px;
        background: var(--rw-water);
        opacity: 0.55;
      }
      .tick {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--rw-accent);
        opacity: 0.7;
      }
      .marker {
        position: absolute;
        top: -4px;
        width: 4px;
        height: 16px;
        margin-left: -2px;
        border-radius: 2px;
        background: var(--rw-accent);
        box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff));
      }
      .off .marker {
        background: var(--rw-warn);
      }
      .off .value {
        color: var(--rw-warn);
      }
      .value {
        text-align: right;
        font-weight: 700;
        white-space: nowrap;
      }
      .hints {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }
      .hints li {
        display: flex;
        gap: 6px;
        align-items: flex-start;
        color: var(--rw-warn);
      }
      .hints ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
      }
      .last {
        font-size: 14px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .actions button,
      .panel button {
        min-height: 48px;
        border-radius: 12px;
        border: 1px solid var(--rw-line);
        background: transparent;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 14px;
      }
      .actions .water {
        flex-grow: 1;
        border-color: var(--rw-water);
        background: var(--rw-water-soft);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .actions .water.done {
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .actions .icon {
        width: 48px;
        padding: 0;
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--rw-line);
      }
      .panel-title {
        font-weight: 700;
      }
      .choices {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .choices button {
        justify-content: flex-start;
        font-weight: 500;
      }
      .pick {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }
      .pick input {
        min-height: 44px;
        font: inherit;
        color: inherit;
        background: transparent;
        border: 1px solid var(--rw-line);
        border-radius: 10px;
        padding: 0 10px;
        color-scheme: light dark;
      }
      .panel-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .panel .primary {
        border-color: var(--rw-water);
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .menu {
        padding: 6px;
        gap: 2px;
      }
      .menu button {
        justify-content: flex-start;
        border: 0;
        font-weight: 500;
      }
      .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 6px 6px 6px 12px;
        border-radius: 10px;
        background: var(--rw-accent-soft);
        font-size: 14px;
      }
      .link {
        min-height: 40px;
        padding: 0 12px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--rw-accent);
        font-weight: 700;
      }
      .history {
        border-top: 1px solid var(--rw-line);
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .section {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--rw-text2);
      }
      .history ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      .history li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .history li ha-icon {
        color: var(--rw-text2);
      }
      .entry {
        flex-grow: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .small {
        font-size: 12px;
      }
      .delete {
        min-width: 44px;
        min-height: 44px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--rw-text2);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .delete.confirm {
        color: var(--error-color, #b3261e);
        font-weight: 700;
        padding: 0 10px;
      }
    `]}};Z([Ce({attribute:!1})],Q.prototype,`hass`,void 0),Z([K()],Q.prototype,`config`,void 0),Z([K()],Q.prototype,`payload`,void 0),Z([K()],Q.prototype,`panel`,void 0),Z([K()],Q.prototype,`pickTime`,void 0),Z([K()],Q.prototype,`toast`,void 0),Z([K()],Q.prototype,`confirmDelete`,void 0),Z([K()],Q.prototype,`busy`,void 0),Q=Z([be(`rootwise-plant-card`)],Q);function $(e){return e&&typeof e==`object`&&`message`in e?String(e.message):String(e)}window.customCards=window.customCards??[],window.customCards.push({type:`rootwise-plant-card`,name:`Rootwise plant`,description:`One plant: status, moisture and climate ranges, watering with undo and history.`,preview:!0,documentationURL:`https://github.com/michi-walchsi/ha-rootwise`}),console.info(`%c ROOTWISE-CARDS %c 0.1.0 `,`background:#2e7d32;color:#fff`,``);