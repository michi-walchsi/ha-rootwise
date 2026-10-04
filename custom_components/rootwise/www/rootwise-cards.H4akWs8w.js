var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,ee=g?g.emptyScript:``,te=h.reactiveElementPolyfillSupport,_=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?ee:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ne=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(_(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?v:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?v:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ne)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:`open`},b[_(`elementProperties`)]=new Map,b[_(`finalized`)]=new Map,te?.({ReactiveElement:b}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var re=globalThis,ie=e=>e,x=re.trustedTypes,ae=x?x.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,S=`$lit$`,C=`lit$${Math.random().toFixed(9).slice(2)}$`,oe=`?`+C,se=`<${oe}>`,w=document,T=()=>w.createComment(``),E=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ce=Array.isArray,le=e=>ce(e)||typeof e?.[Symbol.iterator]==`function`,ue=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,fe=/>/g,O=RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),pe=/'/g,me=/"/g,he=/^(?:script|style|textarea|title)$/i,ge=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),k=ge(1),A=ge(2),j=Symbol.for(`lit-noChange`),M=Symbol.for(`lit-nothing`),_e=new WeakMap,N=w.createTreeWalker(w,129);function ve(e,t){if(!ce(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ae===void 0?t:ae.createHTML(t)}var ye=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=D;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===D?c[1]===`!--`?o=de:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=O):(he.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=O):o=fe:o===O?c[0]===`>`?(o=i??D,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?O:c[3]===`"`?me:pe):o===me||o===pe?o=O:o===de||o===fe?o=D:(o=O,i=void 0);let d=o===O&&e[t+1].startsWith(`/>`)?` `:``;a+=o===D?n+se:l>=0?(r.push(s),n.slice(0,l)+S+n.slice(l)+C+d):n+C+(l===-2?t:d)}return[ve(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},be=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ye(t,n);if(this.el=e.createElement(l,r),N.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=N.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(S)){let t=u[o++],n=i.getAttribute(e).split(C),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ce:r[1]===`?`?we:r[1]===`@`?Te:F}),i.removeAttribute(e)}else e.startsWith(C)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(he.test(i.tagName)){let e=i.textContent.split(C),t=e.length-1;if(t>0){i.textContent=x?x.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],T()),N.nextNode(),c.push({type:2,index:++a});i.append(e[t],T())}}}else if(i.nodeType===8){if(i.data===oe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(C,e+1))!==-1;)c.push({type:7,index:a}),e+=C.length-1}}a++}}static createElement(e,t){let n=w.createElement(`template`);return n.innerHTML=e,n}};function P(e,t,n=e,r){if(t===j)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=E(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=P(e,i._$AS(e,t.values),i,r)),t}var xe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??w).importNode(t,!0);N.currentNode=r;let i=N.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Se(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ee(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=N.nextNode(),a++)}return N.currentNode=w,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Se=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=M,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),E(e)?e===M||e==null||e===``?(this._$AH!==M&&this._$AR(),this._$AH=M):e!==this._$AH&&e!==j&&this._(e):e._$litType$===void 0?e.nodeType===void 0?le(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==M&&E(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=be.createElement(ve(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new xe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=_e.get(e.strings);return t===void 0&&_e.set(e.strings,t=new be(e)),t}k(t){ce(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(T()),this.O(T()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ie(e).nextSibling;ie(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},F=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=M,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=M}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=P(this,e,t,0),a=!E(e)||e!==this._$AH&&e!==j,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=P(this,r[n+o],t,o),s===j&&(s=this._$AH[o]),a||=!E(s)||s!==this._$AH[o],s===M?e=M:e!==M&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===M?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ce=class extends F{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===M?void 0:e}},we=class extends F{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==M)}},Te=class extends F{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??M)===j)return;let n=this._$AH,r=e===M&&n!==M||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==M&&(n===M||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ee=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}},De={M:S,P:C,A:oe,C:1,L:ye,R:xe,D:le,V:P,I:Se,H:F,N:we,U:Te,B:Ce,F:Ee},Oe=re.litHtmlPolyfillSupport;Oe?.(be,Se),(re.litHtmlVersions??=[]).push(`3.3.3`);var ke=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Se(t.insertBefore(T(),e),e,void 0,n??{})}return i._$AI(e),i},Ae=globalThis,I=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ke(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};I._$litElement$=!0,I.finalized=!0,Ae.litElementHydrateSupport?.({LitElement:I});var je=Ae.litElementPolyfillSupport;je?.({LitElement:I}),(Ae.litElementVersions??=[]).push(`4.2.2`);var Me={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:ne},Ne=(e=Me,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function L(e){return(t,n)=>typeof n==`object`?Ne(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function R(e){return L({...e,state:!0,attribute:!1})}var Pe=(e,t,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof t!=`object`&&Object.defineProperty(e,t,n),n);function Fe(e,t){return(n,r,i)=>{let a=t=>t.renderRoot?.querySelector(e)??null;if(t){let{get:e,set:t}=typeof r==`object`?n:i??(()=>{let e=Symbol();return{get(){return this[e]},set(t){this[e]=t}}})();return Pe(n,r,{get(){let n=e.call(this);return n===void 0&&(n=a(this),(n!==null||this.hasUpdated)&&t.call(this,n)),n}})}return Pe(n,r,{get(){return a(this)}})}}var Ie=new WeakMap;function Le(e,t){let n=e.connection,r=Ie.get(n);if(!r){let e={listeners:new Set};e.unsubscribe=n.subscribeMessage(t=>{e.last=t,e.listeners.forEach(e=>e(t))},{type:`rootwise/plants/subscribe`}),Ie.set(n,e),r=e}let i=r;return i.listeners.add(t),i.last&&t(i.last),()=>{i.listeners.delete(t),i.listeners.size===0&&(Ie.delete(n),i.unsubscribe?.then(e=>e()).catch(()=>void 0))}}async function Re(e,t,n,r){let i={type:`rootwise/care/log`,plant_id:t,care_type:n};return r&&(i.when=r.toISOString()),(await e.callWS(i)).entry}async function ze(e,t){await e.callWS({type:`rootwise/care/delete`,entry_id:t})}async function Be(e,t){await e.callWS({type:`call_service`,domain:`button`,service:`press`,target:{entity_id:t}})}async function Ve(e,t){await e.callWS({type:`rootwise/thresholds/reset`,plant_id:t})}function He(e,t){let n=e.user;return n?n.is_admin||t.source===`auto`?!0:t.user_id!==void 0&&t.user_id===n.id:!1}function Ue(e,t,n){return e.callWS({type:`rootwise/plant/history`,plant_id:t,days:n})}var We={"status.ok":`All good`,"status.thirsty":`Needs water`,"status.too_wet":`Too wet`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Not watered yet`,"level.dry":`Dry`,"level.drying":`Water soon`,"level.ok":`Just right`,"level.fresh":`Wet, freshly watered`,"level.too_wet":`Too wet`,"m.soil_moisture":`Soil moisture`,"m.temperature":`Temperature`,"m.air_humidity":`Air humidity`,"m.illuminance":`Light`,"m.conductivity":`Fertilizer`,"m.battery":`Battery`,"care.watered":`Watered`,"care.fertilized":`Fertilized`,"care.repotted":`Repotted`,"care.cleaned":`Leaves cleaned`,"care.rotated":`Rotated`,"care.pest_check":`Checked for pests`,"care.pruned":`Pruned`,"care.sensor_moved":`Sensor moved`,"care.note":`Note`,"action.water":`Watered`,"action.undo":`Undo`,"action.snooze":`+1 day`,"action.more":`More`,"action.delete":`Delete`,"action.cancel":`Cancel`,"action.save":`Save`,"when.title":`When did you water?`,"when.now":`Just now`,"when.hours":`A few hours ago`,"when.yesterday":`Yesterday`,"when.pick":`Pick date and time`,"toast.logged":`{type} logged`,"toast.deleted":`Entry deleted`,"toast.failed":`That didn't work: {error}`,last_watered:`Watered {time}`,never_watered:`No watering logged yet`,history:`History`,"history.empty":`Nothing logged yet`,snoozed_until:`Snoozed until {time}`,vacation:`Vacation mode is on`,"reason.below_threshold":`Soil moisture {value} % is below {threshold} %`,"reason.too_wet":`Soil moisture {value} % above {threshold} % for two days`,"reason.sensor_offline":`No data from the soil sensor`,"reason.snoozed":`Snoozed`,"reason.just_watered":`Just watered`,"reason.interval_due":`Due after {days} days`,"reason.no_history":`Log the first watering to start the reminder`,"hint.temperature_low":`Too cold: {value} °C, at least {min} °C`,"hint.temperature_high":`Too warm: {value} °C, at most {max} °C`,"hint.air_humidity_low":`Air too dry: {value} %, at least {min} %`,"hint.air_humidity_high":`Air too humid: {value} %, at most {max} %`,"hint.illuminance_low":`Too dark: {value} lx, at least {min} lx`,"hint.illuminance_high":`Too bright: {value} lx, at most {max} lx`,"hint.conductivity_low":`Little fertilizer: {value} µS/cm, at least {min}`,"hint.conductivity_high":`Too much fertilizer: {value} µS/cm, at most {max}`,"hint.battery_low":`Sensor battery low: {value} %`,"overview.title":`Plants`,"overview.today":`Water today`,"overview.none":`Nobody is thirsty`,"overview.all_done":`Mark all as watered`,"overview.empty":`No plants yet. Add one under Settings → Devices & services → Rootwise.`,not_loaded:`Rootwise is not loaded.`,unknown_plant:`Pick a plant in the card settings.`,"target.range":`target {min}–{max}`,"target.min":`at least {min}`,"target.max":`at most {max}`,no_value:`no value`,"history.moisture":`{value} % soil moisture`,"delete.confirm":`Delete?`,"toast.undone":`Undone`,"more.other_time":`Watered at another time…`,"editor.device_id":`Plant`,"overview.due.one":`1 needs water today`,"overview.due.other":`{count} need water today`,"overview.hints.one":`1 hint`,"overview.hints.other":`{count} hints`,"overview.logged_at":`logged at {time}`,"overview.all_logged":`{count} × watered logged`,"overview.undo_row":`{name}: take back the entry`,"overview.log_row":`Log {name} as watered`,"tile.low":`{measure} low`,"tile.high":`{measure} high`,"tile.never":`never watered`,"editor.area_id":`Room`,"editor.show_tiles":`All plants as tiles`,"picker.overview.name":`Rootwise overview`,"picker.overview.description":`Which plants need water today, with one-tap ticks, and all plants as tiles.`,"picker.plant.name":`Rootwise plant`,"picker.plant.description":`One plant: status, moisture and climate ranges, watering with undo, history.`,"next.in":`Next watering {time}`,"next.in_rough":`Next watering roughly {time}`,"next.interval":`Next watering {time} (usual interval)`,"next.due":`Watering is due`,"next.window":`({from} – {to})`,"next.learning":`Rootwise is still learning: the forecast comes after a few days of readings`,"thresholds.learned_hint":`Learned from your watering: dry {low} %, wet {high} %`,"thresholds.apply":`Use them`,"thresholds.learned":`Thresholds learned from {count} waterings`,"history.detected":`detected`,"history.rise":`{before} → {after} %`,"history.reject":`That wasn't me`,"history.reject_confirm":`Not you?`,"tile.next":`Water {time}`,"toast.thresholds":`Learned thresholds in use`,"editor.title":`Title`,"editor.show_history":`Show history`,"chart.empty":`No readings yet`,"chart.no_sensor":`No soil sensor`,"chart.point":`{value} % ({min}–{max})`,"chart.summary":`Soil moisture over the last {days} days: now {value} %, target {low}–{high} %, watered {count} times`,"chart.summary_plain":`Soil moisture over the last {days} days: now {value} %`,"panel.title":`Plants`,"panel.back":`Back`,"panel.menu":`Menu`,"panel.settings":`Plant settings`,"panel.all":`All`,"panel.rooms":`Rooms`,"chart.forecast":`Forecast`,"chart.target":`Target {low}–{high} %`,"panel.unknown":`This plant doesn't exist (any more).`,"panel.days":`{days} days`,"section.moisture":`Soil moisture`,"section.species":`Species`,"section.pot":`Pot and watering`,"amount.range":`about {from}–{to} {unit}`,"amount.one":`about {value} {unit}`,"amount.per_watering":`{amount} per watering`,"pot.plastic":`Plastic`,"pot.terracotta":`Terracotta`,"pot.ceramic_glazed":`Glazed ceramic`,"pot.self_watering":`Self-watering`,"pot.no_drainage":`no drainage hole`,"window.n":`North window`,"window.ne":`North-east window`,"window.e":`East window`,"window.se":`South-east window`,"window.s":`South window`,"window.sw":`South-west window`,"window.w":`West window`,"window.nw":`North-west window`,"how.drainage":`Water thoroughly until it runs out at the bottom. Empty the saucer after 15 minutes.`,"how.no_drainage":`No drainage hole: give just this amount, don't water until it runs out.`,"how.self_watering":`Self-watering pot: check the water level and refill the reservoir.`,"range.both":`{min}–{max} {unit}`,"range.min":`from {min} {unit}`,"range.max":`up to {max} {unit}`,"species.watering":`Watering`,"species.light":`Light`,"species.temperature":`Temperature`,"species.humidity":`Air humidity`,"species.fertilize":`Fertilizing`,"species.toxicity":`Toxicity`,"style.dry_out":`Let it dry out almost completely, then water thoroughly`,"style.mostly_dry":`Let the top 3–5 cm dry, then water thoroughly`,"style.slightly_dry":`Let the surface dry`,"style.evenly_moist":`Keep evenly moist, never let it dry out`,"light.dli":`{min}–{max} mol/m² a day`,"fertilize.one":`March to September every week`,"fertilize.other":`March to September every {count} weeks`,"tox.cats":`Cats`,"tox.dogs":`Dogs`,"tox.humans":`Children`,"tox.none":`non-toxic`,"tox.mild":`irritant`,"tox.moderate":`toxic`,"tox.severe":`highly toxic`,"tox.unknown":`unknown`,"tox.note.calcium_oxalate":`Contains calcium oxalate.`,"tox.source.aspca":`Guidance from the ASPCA.`,"tox.source.other":`Guidance from the literature.`,"tox.emergency":`In an emergency call poison control or a vet.`,"care.photo":`Photo`,"section.photos":`Photos`,"photo.add":`Add photo`,"photo.add_short":`Photo`,"photo.camera":`Camera`,"photo.gallery":`Gallery`,"photo.shoot":`Take photo`,"photo.retake":`Retake`,"photo.save":`Save`,"photo.saving":`Saving …`,"photo.note":`Note (optional)`,"photo.close":`Close`,"photo.prev":`Previous photo`,"photo.next":`Next photo`,"photo.https_hint":`The live camera needs Home Assistant's HTTPS address. Take the photo with your camera app and pick it from the gallery.`,"photo.chrome":`Open in Chrome`,"photo.heic":`This photo is HEIC, which the browser can't read. Set the camera to “Most compatible” (JPEG) or pick another photo.`,"photo.camera_denied":`No access to the camera. Allow it in the settings, or use the gallery.`,"photo.failed":`Photo not saved: {error}`,"photo.empty":`No photos yet. One a month shows how the plant grows.`,"photo.cover":`Use as cover`,"photo.is_cover":`Cover`,"photo.cover_set":`Cover photo set`,"photo.delete":`Delete`,"photo.delete_confirm":`Really delete?`,"photo.cover_caption":`Cover photo · {date}`},Ge={en:We,de:{"status.ok":`Alles gut`,"status.thirsty":`Braucht Wasser`,"status.too_wet":`Zu nass`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Noch nicht gegossen`,"level.dry":`Trocken`,"level.drying":`Bald gießen`,"level.ok":`Passt`,"level.fresh":`Nass, frisch gegossen`,"level.too_wet":`Zu nass`,"m.soil_moisture":`Bodenfeuchte`,"m.temperature":`Temperatur`,"m.air_humidity":`Luftfeuchte`,"m.illuminance":`Licht`,"m.conductivity":`Dünger`,"m.battery":`Batterie`,"care.watered":`Gegossen`,"care.fertilized":`Gedüngt`,"care.repotted":`Umgetopft`,"care.cleaned":`Blätter gereinigt`,"care.rotated":`Gedreht`,"care.pest_check":`Auf Schädlinge geprüft`,"care.pruned":`Geschnitten`,"care.sensor_moved":`Sensor umgesteckt`,"care.note":`Notiz`,"action.water":`Gegossen`,"action.undo":`Rückgängig`,"action.snooze":`+1 Tag`,"action.more":`Mehr`,"action.delete":`Löschen`,"action.cancel":`Abbrechen`,"action.save":`Speichern`,"when.title":`Wann hast du gegossen?`,"when.now":`Gerade eben`,"when.hours":`Vor ein paar Stunden`,"when.yesterday":`Gestern`,"when.pick":`Datum und Uhrzeit wählen`,"toast.logged":`{type} eingetragen`,"toast.deleted":`Eintrag gelöscht`,"toast.failed":`Hat nicht geklappt: {error}`,last_watered:`Gegossen {time}`,never_watered:`Noch kein Gießen eingetragen`,history:`Verlauf`,"history.empty":`Noch nichts eingetragen`,snoozed_until:`Pausiert bis {time}`,vacation:`Urlaubsmodus ist an`,"reason.below_threshold":`Bodenfeuchte {value} % unter {threshold} %`,"reason.too_wet":`Bodenfeuchte seit zwei Tagen über {threshold} % ({value} %)`,"reason.sensor_offline":`Keine Daten vom Bodensensor`,"reason.snoozed":`Pausiert`,"reason.just_watered":`Gerade gegossen`,"reason.interval_due":`Fällig nach {days} Tagen`,"reason.no_history":`Trag das erste Gießen ein, dann startet die Erinnerung`,"hint.temperature_low":`Zu kalt: {value} °C, mindestens {min} °C`,"hint.temperature_high":`Zu warm: {value} °C, höchstens {max} °C`,"hint.air_humidity_low":`Luft zu trocken: {value} %, mindestens {min} %`,"hint.air_humidity_high":`Luft zu feucht: {value} %, höchstens {max} %`,"hint.illuminance_low":`Zu dunkel: {value} lx, mindestens {min} lx`,"hint.illuminance_high":`Zu hell: {value} lx, höchstens {max} lx`,"hint.conductivity_low":`Wenig Dünger: {value} µS/cm, mindestens {min}`,"hint.conductivity_high":`Zu viel Dünger: {value} µS/cm, höchstens {max}`,"hint.battery_low":`Sensor-Batterie schwach: {value} %`,"overview.title":`Pflanzen`,"overview.today":`Heute gießen`,"overview.none":`Niemand hat Durst`,"overview.all_done":`Alle als gegossen eintragen`,"overview.empty":`Noch keine Pflanzen. Leg eine an unter Einstellungen → Geräte & Dienste → Rootwise.`,not_loaded:`Rootwise ist nicht geladen.`,unknown_plant:`Wähle in den Karteneinstellungen eine Pflanze.`,"target.range":`Ziel {min}–{max}`,"target.min":`mindestens {min}`,"target.max":`höchstens {max}`,no_value:`kein Wert`,"history.moisture":`{value} % Bodenfeuchte`,"delete.confirm":`Löschen?`,"toast.undone":`Rückgängig gemacht`,"more.other_time":`Zu anderer Zeit gegossen…`,"editor.device_id":`Pflanze`,"overview.due.one":`1 braucht heute Wasser`,"overview.due.other":`{count} brauchen heute Wasser`,"overview.hints.one":`1 Hinweis`,"overview.hints.other":`{count} Hinweise`,"overview.logged_at":`eingetragen um {time}`,"overview.all_logged":`{count} × Gegossen eingetragen`,"overview.undo_row":`{name}: Eintrag zurücknehmen`,"overview.log_row":`{name} als gegossen eintragen`,"tile.low":`{measure} zu niedrig`,"tile.high":`{measure} zu hoch`,"tile.never":`noch nie gegossen`,"editor.area_id":`Raum`,"editor.show_tiles":`Alle Pflanzen als Kacheln`,"picker.overview.name":`Rootwise Übersicht`,"picker.overview.description":`Welche Pflanzen heute Wasser brauchen, zum Abhaken, und alle Pflanzen als Kacheln.`,"picker.plant.name":`Rootwise Pflanze`,"picker.plant.description":`Eine Pflanze: Status, Feuchte und Klima mit Zielbereich, Gießen mit Rückgängig, Verlauf.`,"next.in":`Nächstes Gießen {time}`,"next.in_rough":`Nächstes Gießen ungefähr {time}`,"next.interval":`Nächstes Gießen {time} (übliches Intervall)`,"next.due":`Gießen ist fällig`,"next.window":`({from} – {to})`,"next.learning":`Rootwise lernt noch: die Prognose kommt nach ein paar Tagen Messwerten`,"thresholds.learned_hint":`Gelernt aus deinem Gießen: trocken {low} %, nass {high} %`,"thresholds.apply":`Übernehmen`,"thresholds.learned":`Schwellen gelernt aus {count}× Gießen`,"history.detected":`erkannt`,"history.rise":`{before} → {after} %`,"history.reject":`War ich nicht`,"history.reject_confirm":`Wirklich nicht?`,"tile.next":`Gießen {time}`,"toast.thresholds":`Gelernte Schwellen übernommen`,"editor.title":`Titel`,"editor.show_history":`Verlauf zeigen`,"chart.empty":`Noch keine Messwerte`,"chart.no_sensor":`Kein Bodensensor`,"chart.point":`{value} % ({min}–{max})`,"chart.summary":`Bodenfeuchte der letzten {days} Tage: jetzt {value} %, Ziel {low}–{high} %, {count}× gegossen`,"chart.summary_plain":`Bodenfeuchte der letzten {days} Tage: jetzt {value} %`,"panel.title":`Pflanzen`,"panel.back":`Zurück`,"panel.menu":`Menü`,"panel.settings":`Pflanze einstellen`,"panel.all":`Alle`,"panel.rooms":`Räume`,"chart.forecast":`Prognose`,"chart.target":`Ziel {low}–{high} %`,"panel.unknown":`Diese Pflanze gibt es nicht (mehr).`,"panel.days":`{days} Tage`,"section.moisture":`Bodenfeuchte`,"section.species":`Artinfo`,"section.pot":`Topf und Gießen`,"amount.range":`ca. {from}–{to} {unit}`,"amount.one":`ca. {value} {unit}`,"amount.per_watering":`{amount} pro Gießen`,"pot.plastic":`Kunststoff`,"pot.terracotta":`Terrakotta`,"pot.ceramic_glazed":`Keramik, glasiert`,"pot.self_watering":`Selbstbewässerung`,"pot.no_drainage":`ohne Abzugsloch`,"window.n":`Fenster Nord`,"window.ne":`Fenster Nordost`,"window.e":`Fenster Ost`,"window.se":`Fenster Südost`,"window.s":`Fenster Süd`,"window.sw":`Fenster Südwest`,"window.w":`Fenster West`,"window.nw":`Fenster Nordwest`,"how.drainage":`Durchdringend gießen, bis unten Wasser austritt. Untersetzer nach 15 Minuten leeren.`,"how.no_drainage":`Kein Abzugsloch: nur diese Menge geben, nicht bis zum Austritt gießen.`,"how.self_watering":`Selbstbewässerung: Wasserstand prüfen und den Vorratsbehälter auffüllen.`,"range.both":`{min}–{max} {unit}`,"range.min":`ab {min} {unit}`,"range.max":`bis {max} {unit}`,"species.watering":`Gießen`,"species.light":`Licht`,"species.temperature":`Temperatur`,"species.humidity":`Luftfeuchte`,"species.fertilize":`Düngen`,"species.toxicity":`Giftigkeit`,"style.dry_out":`Fast ganz austrocknen lassen, dann gründlich`,"style.mostly_dry":`Oben 3–5 cm antrocknen lassen, dann gründlich`,"style.slightly_dry":`Oberfläche antrocknen lassen`,"style.evenly_moist":`Gleichmäßig feucht halten, nie austrocknen lassen`,"light.dli":`{min}–{max} mol/m² am Tag`,"fertilize.one":`März bis September jede Woche`,"fertilize.other":`März bis September alle {count} Wochen`,"tox.cats":`Katzen`,"tox.dogs":`Hunde`,"tox.humans":`Kinder`,"tox.none":`ungiftig`,"tox.mild":`reizend`,"tox.moderate":`giftig`,"tox.severe":`stark giftig`,"tox.unknown":`unbekannt`,"tox.note.calcium_oxalate":`Enthält Calciumoxalat.`,"tox.source.aspca":`Richtwerte nach ASPCA.`,"tox.source.other":`Richtwerte aus der Fachliteratur.`,"tox.emergency":`Im Notfall: Vergiftungsinformationszentrale oder Tierarzt.`,"care.photo":`Foto`,"section.photos":`Fotos`,"photo.add":`Foto hinzufügen`,"photo.add_short":`Foto`,"photo.camera":`Kamera`,"photo.gallery":`Galerie`,"photo.shoot":`Auslösen`,"photo.retake":`Neu aufnehmen`,"photo.save":`Speichern`,"photo.saving":`Wird gespeichert …`,"photo.note":`Notiz (optional)`,"photo.close":`Schließen`,"photo.prev":`Vorheriges Foto`,"photo.next":`Nächstes Foto`,"photo.https_hint":`Die Live-Kamera braucht die HTTPS-Adresse von Home Assistant. Mach das Foto mit der Kamera-App und wähle es aus der Galerie.`,"photo.chrome":`In Chrome öffnen`,"photo.heic":`Dieses Foto ist im HEIC-Format, das der Browser nicht lesen kann. Stell die Kamera auf „Maximale Kompatibilität“ (JPEG) oder wähle ein anderes Foto.`,"photo.camera_denied":`Kein Zugriff auf die Kamera. Erlaube ihn in den Einstellungen oder nimm die Galerie.`,"photo.failed":`Foto nicht gespeichert: {error}`,"photo.empty":`Noch keine Fotos. Eines im Monat zeigt, wie die Pflanze wächst.`,"photo.cover":`Als Titelbild`,"photo.is_cover":`Titelbild`,"photo.cover_set":`Titelbild gesetzt`,"photo.delete":`Löschen`,"photo.delete_confirm":`Wirklich löschen?`,"photo.cover_caption":`Titelfoto · {date}`}};function z(e){let t=(e?.locale?.language??e?.language??`en`).slice(0,2);return t in Ge?t:`en`}function B(e,t,n={}){let r=z(e);return(Ge[r]?.[t]??We[t]??t).replace(/\{(\w+)\}/g,(e,t)=>t in n?qe(n[t],r):e)}function Ke(e,t,n){return B(e,`${t}.${new Intl.PluralRules(z(e)).select(n)===`one`?`one`:`other`}`,{count:n})}function qe(e,t){return typeof e==`number`?new Intl.NumberFormat(t,{maximumFractionDigits:1}).format(e):String(e)}var Je=864e5;function Ye(e,t,n){let r=new Date(e).getTime()-t.getTime(),i=new Intl.RelativeTimeFormat(n,{numeric:`auto`}),a=Math.abs(r);if(a<6e4)return i.format(0,`second`);if(a<36e5)return i.format(Math.round(r/6e4),`minute`);let o=Xe(new Date(e),t);return o===0?i.format(Math.round(r/36e5),`hour`):Math.abs(o)<30?i.format(o,`day`):new Intl.DateTimeFormat(n,{dateStyle:`medium`}).format(new Date(e))}function Xe(e,t){let n=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime();return Math.round((n(e)-n(t))/Je)}function Ze(e,t){return new Intl.DateTimeFormat(t,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function Qe(e,t,n){return new Intl.DateTimeFormat(n,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).formatRange(e,t)}function $e(e,t,n){let r=+(e===`temperature`);return new Intl.NumberFormat(n,{maximumFractionDigits:r,minimumFractionDigits:r}).format(t)}var et=[`soil_moisture`,`air_humidity`,`battery`];function tt(e,t,n,r){let i=e===`illuminance`?e=>Math.log10(Math.max(e,0)+1):e=>e,a,o;if(et.includes(e))a=0,o=100;else{let s=i(n??r??t??0),c=i(r??n??t??1),l=Math.max(c-s,e===`illuminance`?1:2);a=e===`illuminance`?0:s-l/4,o=c+l/4,t!==null&&(a=Math.min(a,i(t)),o=Math.max(o,i(t)))}let s=e=>Math.min(100,Math.max(0,(i(e)-a)/(o-a)*100));return{low:n===null?0:s(n),high:r===null?100:s(r),marker:t===null?null:s(t)}}var nt=[`soil_moisture`,`temperature`,`air_humidity`,`illuminance`,`conductivity`];function rt(e,t){if(t.device_id)return e.find(e=>e.device_id===t.device_id);if(t.plant_id)return e.find(e=>e.id===t.plant_id);if(t.plant){let n=t.plant.trim().toLocaleLowerCase();return e.find(e=>e.id===t.plant||e.name.toLocaleLowerCase()===n)}}var it=/_(low|high)$/;function V(e){return it.test(e.code)}function at(e,t){let n=t.reasons.filter(e=>!V(e));if(t.status&&t.status!==`ok`){let t=n.find(e=>e.code!==`snoozed`);return t?B(e,`reason.${t.code}`,t):null}return t.snoozed_until?B(e,`snoozed_until`,{time:new Intl.DateTimeFormat(e.language,{weekday:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(t.snoozed_until))}):t.moisture_level?B(e,`level.${t.moisture_level}`):null}function ot(e,t){return t.reasons.filter(V).map(t=>B(e,`hint.${t.code}`,t))}function st(e,t){if(e===`hours`)return new Date(t.getTime()-108e5);if(e===`yesterday`){let e=new Date(t);return e.setDate(e.getDate()-1),e.setHours(18,0,0,0),e}}function ct(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}function lt(e){return Object.values(e.entities??{}).find(e=>e.platform===`rootwise`&&e.entity_id.endsWith(`_status`)&&e.device_id)?.device_id}function ut(e,t,n){let r=t.next_watering;if(!r)return t.measurements.soil_moisture?{text:B(e,`next.learning`)}:null;if(new Date(r.due).getTime()<=n.getTime())return{text:B(e,`next.due`)};let i=z(e),a=Ye(r.due,n,i),o={text:B(e,r.method===`interval`?`next.interval`:r.confidence===`low`?`next.in_rough`:`next.in`,{time:a})};if(r.earliest&&r.latest){let t=e=>new Intl.DateTimeFormat(i,{weekday:`short`}).format(new Date(e)),n=t(r.earliest),a=t(r.latest);n!==a&&(o.window=B(e,`next.window`,{from:n,to:a}))}return o}var dt=3;function ft(e,t){let n=t.thresholds;if(!n?.learned)return null;let[r,i]=n.learned;return n.source===`learned`?{text:B(e,`thresholds.learned`,{count:n.waterings}),canApply:!1}:n.source===`custom`&&(Math.abs(r-n.low)>=dt||Math.abs(i-n.high)>=dt)?{text:B(e,`thresholds.learned_hint`,{low:r,high:i}),canApply:!0}:null}function pt(e,t){let n=t.data??{};if(t.source===`auto`){let t=n.settled??n.peak,r=n.before!==void 0&&t!==void 0?B(e,`history.rise`,{before:Math.round(n.before),after:Math.round(t)}):``;return[B(e,`history.detected`),r].filter(Boolean).join(` · `)}return n.moisture===void 0?``:B(e,`history.moisture`,{value:n.moisture})}var mt={thirsty:0,too_wet:1,sensor_offline:2,no_history:3,ok:4};function ht(e,t){return t?e.filter(e=>e.area_id===t):e}var gt=(e,t)=>e.name.localeCompare(t.name);function _t(e){return e.filter(e=>e.needs_water).sort(gt)}function vt(e,t){return e.filter(e=>e.needs_water||t(e)).sort(gt)}function yt(e,t){let n=t.measurements.soil_moisture?.value,r=n==null?at(e,t):`${$e(`soil_moisture`,n,z(e))} %`;return[t.area,r].filter(Boolean).join(` · `)}function bt(e,t){let n=t.filter(e=>e.needs_water).length,r=t.filter(e=>e.reasons.some(V)).length,i=[n?Ke(e,`overview.due`,n):B(e,`overview.none`)];return r&&i.push(Ke(e,`overview.hints`,r)),i.join(` · `)}function xt(e,t,n){let r=t.status??`no_history`;if(r===`thirsty`)return{color:`var(--rw-warn)`,text:B(e,`status.thirsty`)};if(r===`too_wet`)return{color:`var(--rw-prob)`,text:B(e,`level.too_wet`)};if(r===`sensor_offline`)return{color:`var(--rw-text2)`,text:B(e,`status.sensor_offline`)};let i=t.reasons.find(V);if(i){let[,t,n]=/^(.*)_(low|high)$/.exec(i.code)??[],r=B(e,`m.${t}`);return{color:`var(--rw-warn)`,text:B(e,`tile.${n}`,{measure:r})}}let a=t.next_watering;return a&&new Date(a.due).getTime()>n.getTime()?{color:`var(--rw-accent)`,text:B(e,`tile.next`,{time:Ye(a.due,n,z(e))})}:t.moisture_level?{color:`var(--rw-accent)`,text:B(e,`level.${t.moisture_level}`)}:t.last_watered?{color:`var(--rw-accent)`,text:Ye(t.last_watered,n,z(e))}:{color:`var(--rw-text2)`,text:B(e,`tile.never`)}}function St(e){return[...e].sort((e,t)=>(mt[e.status??`ok`]??9)-(mt[t.status??`ok`]??9)||Number(t.reasons.some(V))-Number(e.reasons.some(V))||e.name.localeCompare(t.name))}function Ct(e,t){if(!t)return null;let[n,r]=t,i=r>=1e3,a=new Intl.NumberFormat(z(e),{maximumFractionDigits:+!!i}),o=e=>a.format(i?e/1e3:e),s=i?`l`:`ml`;return n===r?B(e,`amount.one`,{value:o(n),unit:s}):B(e,`amount.range`,{from:o(n),to:o(r),unit:s})}function wt(e,t){let n=[`${t.diameter} cm`,B(e,`pot.${t.material}`)];return t.window!==`none`&&n.push(B(e,`window.${t.window}`)),t.drainage||n.push(B(e,`pot.no_drainage`)),n.join(` · `)}function Tt(e,t){return t.material===`self_watering`?B(e,`how.self_watering`):B(e,t.drainage?`how.drainage`:`how.no_drainage`)}function Et(e,t,n){if(!t)return null;let{min:r,max:i}=t;return r!==null&&i!==null?B(e,`range.both`,{min:r,max:i,unit:n}):r===null?i===null?null:B(e,`range.max`,{max:i,unit:n}):B(e,`range.min`,{min:r,unit:n})}function Dt(e,t){let n=[],r=(t,r)=>{r&&n.push({key:t,label:B(e,`species.${t}`),text:r})};return r(`watering`,t.watering_style?B(e,`style.${t.watering_style}`):null),r(`light`,t.dli?B(e,`light.dli`,{min:t.dli.min,max:t.dli.max}):Et(e,t.ranges.illuminance,`lx`)),r(`temperature`,Et(e,t.ranges.temperature,`°C`)),r(`humidity`,Et(e,t.ranges.air_humidity,`%`)),r(`fertilize`,t.fertilize_weeks?Ke(e,`fertilize`,t.fertilize_weeks):null),n}function Ot(e,t){let n=t.toxicity;return n?{badges:[`cats`,`dogs`,`humans`].map(t=>({key:t,who:B(e,`tox.${t}`),level:n[t],text:B(e,`tox.${n[t]}`)})),note:n.note?B(e,`tox.note.${n.note}`):null,source:B(e,n.source.includes(`aspca.org`)?`tox.source.aspca`:`tox.source.other`)}:null}var H=o`
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
`,kt={ok:`var(--rw-accent)`,thirsty:`var(--rw-warn)`,too_wet:`var(--rw-prob)`,sensor_offline:`var(--rw-text2)`,no_history:`var(--rw-text2)`},At={soil_moisture:`mdi:water-percent`,temperature:`mdi:thermometer`,air_humidity:`mdi:water-opacity`,illuminance:`mdi:white-balance-sunny`,conductivity:`mdi:sprout-outline`,battery:`mdi:battery-40`,watered:`mdi:watering-can`,fertilized:`mdi:bottle-tonic-plus`,repotted:`mdi:pot-mix`,cleaned:`mdi:leaf`,rotated:`mdi:rotate-3d-variant`,pest_check:`mdi:bug-check`,pruned:`mdi:content-cut`,sensor_moved:`mdi:cursor-move`,note:`mdi:note-text-outline`,photo:`mdi:camera`},jt=`/rootwise`;function Mt(e){return`${jt}/plant/${encodeURIComponent(e)}`}function Nt(e,t=!1){t?history.replaceState(null,``,e):history.pushState(null,``,e),window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:t}}))}function U(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var W=class extends I{connectedCallback(){super.connectedCallback(),this.subscribe()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0}willUpdate(e){e.has(`hass`)&&(this.subscribe(),this.toggleAttribute(`dark`,!!this.hass?.themes?.darkMode))}subscribe(){let e=this.hass;e&&this.isConnected&&e.connection!==this.connection&&(this.unsubscribe?.(),this.connection=e.connection,this.unsubscribe=Le(e,e=>{this.payload=e}))}t(e,t){return B(this.hass,e,t)}openPlant(e){Nt(Mt(e.id))}moreInfo(e){e&&this.dispatchEvent(new CustomEvent(`hass-more-info`,{detail:{entityId:e},bubbles:!0,composed:!0}))}};U([L({attribute:!1})],W.prototype,`hass`,void 0),U([R()],W.prototype,`payload`,void 0);function G(e){return e&&typeof e==`object`&&`message`in e?String(e.message):String(e)}function Pt(e){return B({language:document.documentElement.lang||`en`},`editor.${e.name}`)}var Ft=36e5,It=1e4,K=class extends W{constructor(...e){super(...e),this.ticked=new Map,this.busy=new Set}static getConfigForm(){return{schema:[{name:`title`,selector:{text:{}}},{name:`area_id`,selector:{area:{}}},{name:`show_tiles`,selector:{boolean:{}}}],computeLabel:Pt}}static getStubConfig(){return{show_tiles:!0}}setConfig(e){this.config={show_tiles:!0,...e}}getCardSize(){return 3+(this.payload?_t(this.payload.plants).length:0)}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer)}async toggle(e){if(!this.hass||this.busy.has(e.id))return;this.busy=new Set(this.busy).add(e.id);let t=this.ticked.get(e.id);try{let n=new Map(this.ticked);t?(await ze(this.hass,t.id),n.delete(e.id)):n.set(e.id,await Re(this.hass,e.id,`watered`)),this.ticked=n}catch(e){this.showToast({text:this.t(`toast.failed`,{error:G(e)})})}finally{let t=new Set(this.busy);t.delete(e.id),this.busy=t}}async allDone(e){let t=this.hass;if(!t)return;let n=e.filter(e=>!this.ticked.has(e.id));try{let e=await Promise.all(n.map(e=>Re(t,e.id,`watered`))),r=new Map(this.ticked);n.forEach((t,n)=>r.set(t.id,e[n])),this.ticked=r,this.showToast({text:this.t(`overview.all_logged`,{count:e.length}),undo:e})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:G(e)})})}}async undoAll(e){let t=this.hass;if(t)try{await Promise.all(e.map(e=>ze(t,e.id)));let n=new Map(this.ticked);e.forEach(e=>n.delete(e.plant_id)),this.ticked=n,this.showToast({text:this.t(`toast.undone`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:G(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},It)}render(){let e=this.hass;if(!this.payload||!e)return k`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return k`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let t=ht(this.payload.plants,this.config?.area_id),n=_t(t),r=Date.now(),i=vt(t,e=>{let t=this.ticked.get(e.id);return t!==void 0&&r-Date.parse(t.ts)<Ft}),a=n.filter(e=>!this.ticked.has(e.id));return k`
      <ha-card>
        <div class="head">
          <span class="badge"><ha-icon icon="mdi:sprout"></ha-icon></span>
          <div class="titles">
            <div class="title">${this.config?.title||this.t(`overview.title`)}</div>
            <div class="muted small">${t.length?bt(e,t):``}</div>
          </div>
        </div>
        ${this.payload.vacation?k`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:M}
        ${t.length===0?k`<div class="empty muted">${this.t(`overview.empty`)}</div>`:M}
        ${i.length?k`<ul class="due" aria-label=${this.t(`overview.today`)}>
              ${i.map(e=>this.renderRow(e))}
            </ul>`:M}
        ${a.length>=2?k`<button class="all" @click=${()=>void this.allDone(a)}>
              <ha-icon icon="mdi:check-all"></ha-icon>${this.t(`overview.all_done`)}
            </button>`:M}
        ${this.toast?this.renderToast(this.toast):M}
        ${this.config?.show_tiles&&t.length?k`<div class="tiles">${St(t).map(e=>this.renderTile(e))}</div>`:M}
      </ha-card>
    `}renderRow(e){let t=this.hass,n=this.ticked.get(e.id),r=t?Ct(t,e.pot.amount):null,i=n?this.t(`overview.logged_at`,{time:new Intl.DateTimeFormat(z(t),{hour:`2-digit`,minute:`2-digit`}).format(new Date(n.ts))}):t?yt(t,e):``;return k`
      <li>
        <button
          class="tick ${n?`done`:``}"
          aria-pressed=${n?`true`:`false`}
          aria-label=${this.t(n?`overview.undo_row`:`overview.log_row`,{name:e.name})}
          ?disabled=${this.busy.has(e.id)}
          @click=${()=>void this.toggle(e)}
        >
          <ha-icon icon="mdi:check"></ha-icon>
        </button>
        <div
          class="row-text"
          role="button"
          tabindex="0"
          @click=${()=>this.openPlant(e)}
          @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&this.openPlant(e)}}
        >
          <span class="name">${e.name}</span>
          <span class="muted small">${i}</span>
          ${!n&&r?k`<span class="muted small">${r}</span>`:M}
        </div>
      </li>
    `}renderTile(e){let t=this.hass?xt(this.hass,e,new Date):{color:``,text:``};return k`
      <button class="tile" @click=${()=>this.openPlant(e)}>
        <span class="tile-name"><span class="dot" style="background:${t.color}"></span>${e.name}</span>
        <span class="muted tiny">${t.text}</span>
      </button>
    `}renderToast(e){let t=e.undo;return k`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${t?k`<button class="link" @click=${()=>void this.undoAll(t)}>${this.t(`action.undo`)}</button>`:M}
      </div>
    `}static{this.styles=[H,o`
      ha-card {
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .empty {
        padding: 0 16px 14px;
      }
      .small {
        font-size: 13px;
      }
      .tiny {
        max-width: 100%;
        font-size: 12px;
        line-height: 1.3;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px 10px;
      }
      .badge {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .title {
        font-size: 17px;
        font-weight: 700;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 16px 10px;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--rw-water-soft);
        font-size: 14px;
      }
      .due {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .due li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-top: 1px solid var(--rw-line);
      }
      .tick {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 2px solid var(--rw-water);
        background: transparent;
        color: var(--rw-water);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .tick.done {
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .tick:disabled {
        opacity: 0.6;
      }
      .row-text {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex-grow: 1;
        cursor: pointer;
      }
      .name {
        font-weight: 700;
      }
      .all {
        margin: 4px 16px 10px;
        min-height: 44px;
        border-radius: 12px;
        border: 1px solid var(--rw-water);
        background: var(--rw-water-soft);
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 0 16px 10px;
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
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 6px;
        padding: 10px 12px 14px;
        border-top: 1px solid var(--rw-line);
      }
      .tile {
        min-width: 0;
        min-height: 52px;
        padding: 8px;
        border: 0;
        border-radius: 12px;
        background: var(--rw-track);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 2px;
        text-align: left;
      }
      .tile-name {
        display: flex;
        align-items: center;
        gap: 5px;
        max-width: 100%;
        font-size: 12px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    `]}};U([R()],K.prototype,`config`,void 0),U([R()],K.prototype,`ticked`,void 0),U([R()],K.prototype,`busy`,void 0),U([R()],K.prototype,`toast`,void 0);var Lt=10,Rt=500,q=class extends W{constructor(...e){super(...e),this.panel=`none`,this.pickTime=``,this.busy=!1,this.longPressed=!1}static getConfigForm(){return{schema:[{name:`device_id`,required:!0,selector:{device:{filter:[{integration:`rootwise`}]}}},{name:`show_history`,selector:{boolean:{}}}],computeLabel:Pt}}static getStubConfig(e){return{device_id:lt(e),show_history:!0}}setConfig(e){this.config={show_history:!0,...e}}getCardSize(){return this.config?.show_history?8:5}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer),window.clearTimeout(this.confirmTimer)}get plant(){return this.payload&&this.config?rt(this.payload.plants,this.config):void 0}async log(e,t){let n=this.plant;if(n&&this.hass&&!this.busy){this.busy=!0,this.panel=`none`;try{let r=await Re(this.hass,n.id,e,t);this.showToast({text:this.t(`toast.logged`,{type:this.t(`care.${e}`)}),undo:r})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:G(e)})})}finally{this.busy=!1}}}async deleteEntry(e,t){if(this.hass)try{await ze(this.hass,e.id),this.showToast({text:t})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:G(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},Lt*1e3)}undo(){let e=this.toast?.undo;e&&this.deleteEntry(e,this.t(`toast.undone`))}pressStart(){this.longPressed=!1,window.clearTimeout(this.pressTimer),this.pressTimer=window.setTimeout(()=>{this.longPressed=!0,this.openWhen()},Rt)}pressEnd(){window.clearTimeout(this.pressTimer)}waterClick(){if(this.longPressed){this.longPressed=!1;return}this.log(`watered`)}openWhen(){this.pickTime=``,this.panel=`when`}chooseWhen(e){this.log(`watered`,st(e,new Date))}savePicked(){this.pickTime&&this.log(`watered`,new Date(this.pickTime))}askDelete(e){if(this.confirmDelete===e.id){this.confirmDelete=void 0,this.deleteEntry(e,this.t(`toast.deleted`));return}this.confirmDelete=e.id,window.clearTimeout(this.confirmTimer),this.confirmTimer=window.setTimeout(()=>{this.confirmDelete=void 0},4e3)}render(){if(!this.payload)return k`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return k`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let e=this.plant;if(!e)return k`<ha-card><div class="empty muted">${this.t(`unknown_plant`)}</div></ha-card>`;let t=this.hass?at(this.hass,e):null,n=this.hass?ot(this.hass,e):[],r=nt.filter(t=>e.measurements[t]);return k`
      <ha-card>
        ${this.payload.vacation?k`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:M}
        ${this.config?.embedded?M:this.renderHead(e)}
        ${t?k`<div class="detail">${t}</div>`:M}
        ${r.length?k`<div class="bars">
              ${r.map(t=>this.renderBar(t,e.measurements[t]))}
            </div>`:M}
        ${n.length?k`<ul class="hints">
              ${n.map(e=>k`<li><ha-icon icon="mdi:information-outline"></ha-icon>${e}</li>`)}
            </ul>`:M}
        ${this.renderLearned(e)}
        <div class="when-block">
          ${this.renderNext(e)}
          <div class="last muted">${this.lastWatered(e)}</div>
        </div>
        ${this.renderActions(e)} ${this.panel===`when`?this.renderWhen():M}
        ${this.panel===`more`?this.renderMore():M}
        ${this.toast?this.renderToast(this.toast):M}
        ${this.config?.show_history?this.renderHistory(e):M}
      </ha-card>
    `}renderHead(e){let t=e.status??`no_history`,n=[e.species.common,e.species.scientific].filter(Boolean).filter((e,t,n)=>n.indexOf(e)===t);return k`
      <div
        class="head"
        role="button"
        tabindex="0"
        @click=${()=>this.openPlant(e)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&this.openPlant(e)}}
      >
        <div class="avatar">
          ${e.species.image_url?k`<img
                src=${e.species.image_url}
                alt=""
                loading="lazy"
                @error=${e=>e.target.hidden=!0}
              />`:M}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="titles">
          <div class="name">${e.name}</div>
          <div class="status">
            <span class="dot" style="background:${kt[t]}"></span>
            <span>${this.t(`status.${t}`)}${e.area?` · ${e.area}`:``}</span>
          </div>
          ${n.length?k`<div class="species muted">${n.join(` · `)}</div>`:M}
        </div>
      </div>
    `}renderBar(e,t){let n=z(this.hass),r=tt(e,t.value,t.min,t.max),i=t.unit??``,a=t.value===null?`–`:`${$e(e,t.value,n)}${i?` ${i}`:``}`,o=t.rating===`low`||t.rating===`high`||t.level===`dry`||t.level===`too_wet`,s=t.min!==null&&t.max!==null?this.t(`target.range`,{min:t.min,max:t.max}):t.min===null?t.max===null?``:this.t(`target.max`,{max:t.max}):this.t(`target.min`,{min:t.min}),c=this.t(`m.${e}`),l=`${c} ${t.value===null?this.t(`no_value`):a}${s?`, ${s}`:``}`;return k`
      <div
        class="bar-row ${o?`off`:``}"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(this.plant?.entity_ids[e])}
      >
        <ha-icon icon=${At[e]??`mdi:gauge`}></ha-icon>
        <span class="label">${c}</span>
        <div class="bar" role="img" aria-label=${l}>
          <div class="zone" style="left:${r.low}%;width:${Math.max(r.high-r.low,0)}%"></div>
          ${e===`soil_moisture`&&r.marker!==null?k`<div class="fill" style="width:${r.marker}%"></div>`:M}
          ${t.min===null?M:k`<div class="tick" style="left:${r.low}%"></div>`}
          ${t.max===null?M:k`<div class="tick" style="left:${r.high}%"></div>`}
          ${r.marker===null?M:k`<div class="marker" style="left:${r.marker}%"></div>`}
        </div>
        <span class="value num">${a}</span>
      </div>
    `}renderNext(e){let t=this.hass?ut(this.hass,e,new Date):null;return t?k`<div class="next">
      <ha-icon icon="mdi:calendar-clock"></ha-icon>
      <span>${t.text}${t.window?k` <span class="muted">${t.window}</span>`:M}</span>
    </div>`:M}renderLearned(e){let t=this.hass?ft(this.hass,e):null;return t?k`<div class="learned muted">
      <ha-icon icon="mdi:school-outline"></ha-icon>
      <span>${t.text}</span>
      ${t.canApply?k`<button class="link" @click=${()=>void this.applyLearned(e)}>
            ${this.t(`thresholds.apply`)}
          </button>`:M}
    </div>`:M}async applyLearned(e){if(this.hass)try{await Ve(this.hass,e.id),this.showToast({text:this.t(`toast.thresholds`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:G(e)})})}}lastWatered(e){return e.last_watered?this.t(`last_watered`,{time:Ye(e.last_watered,new Date,z(this.hass))}):this.t(`never_watered`)}renderActions(e){let t=e.entity_ids.snooze,n=this.toast?.undo?.type===`watered`;return k`
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
        ${e.needs_water&&t?k`<button class="secondary" @click=${()=>this.hass&&void Be(this.hass,t)}>
              ${this.t(`action.snooze`)}
            </button>`:M}
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
    `}renderWhen(){let e=ct(new Date);return k`
      <div class="panel" role="group" aria-label=${this.t(`when.title`)}>
        <div class="panel-title">${this.t(`when.title`)}</div>
        <div class="choices">
          ${[`now`,`hours`,`yesterday`].map(e=>k`<button @click=${()=>this.chooseWhen(e)}>${this.t(`when.${e}`)}</button>`)}
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
    `}renderMore(){return k`
      <div class="panel menu" role="menu">
        <button role="menuitem" @click=${this.openWhen}>
          <ha-icon icon="mdi:clock-edit-outline"></ha-icon>${this.t(`more.other_time`)}
        </button>
        ${[`fertilized`,`sensor_moved`].map(e=>k`<button role="menuitem" @click=${()=>void this.log(e)}>
            <ha-icon icon=${At[e]??`mdi:plus`}></ha-icon>${this.t(`care.${e}`)}
          </button>`)}
      </div>
    `}renderToast(e){return k`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${e.undo?k`<button class="link" @click=${this.undo}>${this.t(`action.undo`)}</button>`:M}
      </div>
    `}renderHistory(e){let t=z(this.hass);return k`
      <div class="history">
        <div class="section">${this.t(`history`)}</div>
        ${e.recent.length===0?k`<div class="muted small">${this.t(`history.empty`)}</div>`:k`<ul>
              ${e.recent.map(e=>{let n=this.hass?pt(this.hass,e):``,r=this.hass?He(this.hass,e):!1,i=this.confirmDelete===e.id,a=e.source===`auto`;return k`<li class=${a?`detected`:``}>
                  <ha-icon icon=${At[e.type]??`mdi:circle-small`}></ha-icon>
                  <div class="entry">
                    <span>${this.t(`care.${e.type}`)}</span>
                    <span class="muted small">
                      ${Ze(e.ts,t)}${n?` · ${n}`:``}
                    </span>
                  </div>
                  ${r?k`<button
                        class="delete ${i?`confirm`:``}"
                        aria-label=${this.t(a?`history.reject`:`action.delete`)}
                        title=${this.t(a?`history.reject`:`action.delete`)}
                        @click=${()=>this.askDelete(e)}
                      >
                        ${i?this.t(a?`history.reject_confirm`:`delete.confirm`):k`<ha-icon
                              icon=${a?`mdi:close-circle-outline`:`mdi:delete-outline`}
                            ></ha-icon>`}
                      </button>`:M}
                </li>`})}
            </ul>`}
      </div>
    `}static{this.styles=[H,o`
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
      .when-block {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .next {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 15px;
        font-weight: 600;
      }
      .next ha-icon,
      .learned ha-icon {
        --mdc-icon-size: 18px;
        color: var(--rw-accent);
      }
      .last {
        font-size: 14px;
      }
      .learned {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 13px;
      }
      .learned .link {
        min-height: 32px;
        padding: 0 8px;
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
    `]}};U([R()],q.prototype,`config`,void 0),U([R()],q.prototype,`panel`,void 0),U([R()],q.prototype,`pickTime`,void 0),U([R()],q.prototype,`toast`,void 0),U([R()],q.prototype,`confirmDelete`,void 0),U([R()],q.prototype,`busy`,void 0);var zt=1600,Bt=.82;function Vt(e,t,n){let r=Math.min(1,n/Math.max(e,t));return{width:Math.round(e*r),height:Math.round(t*r)}}function Ht(e){return/image\/hei[cf]/i.test(e.type)||/\.hei[cf]$/i.test(e.name)}function Ut(e,t,n){let r=`/api/rootwise/photos/${encodeURIComponent(e)}/${encodeURIComponent(t)}`;return n===`thumb`?`${r}?size=thumb`:r}function Wt(e,t,n){return!e?.startsWith(`https://`)||!/Android/i.test(n)?null:`intent://${e.slice(8).replace(/\/+$/,``)}${t}#Intent;scheme=https;package=com.android.chrome;end`}async function Gt(e){let t=await createImageBitmap(e,{imageOrientation:`from-image`}),{width:n,height:r}=Vt(t.width,t.height,zt),i=document.createElement(`canvas`);i.width=n,i.height=r;let a=i.getContext(`2d`);if(!a)throw Error(`No canvas`);return a.drawImage(t,0,0,n,r),t.close(),new Promise((e,t)=>{i.toBlob(n=>n?e(n):t(Error(`JPEG`)),`image/jpeg`,Bt)})}async function Kt(e){try{let t=await e.json();if(t.message)return Error(t.message)}catch{}return Error(`HTTP ${e.status}`)}async function qt(e,t,n,r){let i=new FormData;i.append(`file`,n,`photo.jpg`),r?.trim()&&i.append(`note`,r.trim());let a=await e.fetchWithAuth(`/api/rootwise/photos/${encodeURIComponent(t)}`,{method:`POST`,body:i});if(!a.ok)throw await Kt(a);return(await a.json()).entry}var Jt=new Map;function Yt(e,t,n,r){let i=Ut(t,n,r),a=Jt.get(i);return a||(a=e.fetchWithAuth(i).then(async e=>{if(!e.ok)throw await Kt(e);return URL.createObjectURL(await e.blob())}),a.catch(()=>Jt.delete(i)),Jt.set(i,a)),a}async function Xt(e,t){return e.callWS({type:`rootwise/photos/list`,plant_id:t})}async function Zt(e,t,n){await e.callWS({type:`rootwise/photos/cover`,plant_id:t,photo_id:n})}var J=class extends I{constructor(...e){super(...e),this.plantId=``,this.photoId=``,this.size=`thumb`,this.alt=``,this.failed=!1,this.key=``}willUpdate(){let e=`${this.plantId}/${this.photoId}/${this.size}`;this.hass&&this.plantId&&this.photoId&&e!==this.key&&(this.key=e,this.src=void 0,this.failed=!1,Yt(this.hass,this.plantId,this.photoId,this.size).then(t=>{this.key===e&&(this.src=t)},()=>{this.key===e&&(this.failed=!0)}))}render(){return this.src?k`<img src=${this.src} alt=${this.alt} draggable="false" />`:k`<div class="placeholder ${this.failed?`failed`:``}" role="img" aria-label=${this.alt}>
      ${this.failed?k`<ha-icon icon="mdi:image-broken-variant"></ha-icon>`:M}
    </div>`}static{this.styles=o`
    :host {
      display: block;
      overflow: hidden;
      background: var(--rw-track, rgba(127, 127, 127, 0.16));
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: var(--rw-image-fit, cover);
    }
    .placeholder {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      color: var(--rw-text2, var(--secondary-text-color));
    }
    .placeholder:not(.failed) {
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.55;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .placeholder:not(.failed) {
        animation: none;
      }
    }
  `}};U([L({attribute:!1})],J.prototype,`hass`,void 0),U([L()],J.prototype,`plantId`,void 0),U([L()],J.prototype,`photoId`,void 0),U([L()],J.prototype,`size`,void 0),U([L()],J.prototype,`alt`,void 0),U([R()],J.prototype,`src`,void 0),U([R()],J.prototype,`failed`,void 0);var Qt=864e5,$t=.25,en=1.5,tn=[1,2,7,14,28],nn=36,rn=64,an={left:30,right:8,top:8,bottom:22},on={left:4,right:4,top:6,bottom:18},sn=e=>e.toFixed(1),cn=(e,t,n)=>Math.min(n,Math.max(t,e));function ln(e){let t=[];for(let[,,n,r]of e.points)t.push(n,r);if(e.thresholds&&t.push(e.thresholds.low,e.thresholds.high),e.forecast&&t.push(e.forecast.level),!t.length)return[0,100];let n=Math.max(0,Math.floor((Math.min(...t)-5)/10)*10),r=Math.min(100,Math.ceil((Math.max(...t)+5)/10)*10);return r-n<20&&(r=Math.min(100,n+20),n=Math.max(0,r-20)),[n,r]}function un(e,t){let n=[],r=[];for(let i of e){let e=r.at(-1);e&&i[0]-e[0]>t&&(n.push(r),r=[]),r.push(i)}return r.length&&n.push(r),n}function dn(e,t,n,r,i){let a=tn.find(e=>e*i>=nn)??28,o=new Date(t);if(o.setHours(0,0,0,0),a>=7)for(;o.getDay()!==1;)o.setDate(o.getDate()-1);let s=[];for(let t=new Date(o);t.getTime()>=e;t.setDate(t.getDate()-a))s.unshift(t.getTime());let c=new Date(o);for(c.setDate(c.getDate()+a);c.getTime()<=n;c.setDate(c.getDate()+a))s.push(c.getTime());let l=a<7&&a*i>=rn,u=new Intl.DateTimeFormat(r,l?{weekday:`short`,day:`numeric`}:{day:`numeric`,month:`numeric`});return s.map(e=>({time:e,label:u.format(new Date(e))}))}function fn(e,t,n,r,i={}){let a=!!i.compact,o=a?on:an,s={left:o.left,right:Math.max(o.left+1,t-o.right),top:o.top,bottom:Math.max(o.top+1,n-o.bottom)},c=Date.parse(e.start),l=Date.parse(e.end),u=e.forecast?Date.parse(e.forecast.due):null,d=u!==null&&u>l&&e.thresholds!==null,f=d?l+(l-c)*$t:l,[p,m]=ln(e),h=e=>s.left+(e-c)/(f-c)*(s.right-s.left),g=e=>s.bottom-(e-p)/(m-p)*(s.bottom-s.top),ee=e.step*500,te=un(e.points,e.step*1e3*en),_=(e,t)=>`${sn(h(e[0]+ee))} ${sn(g(t))}`,v=te.filter(e=>e.length>1).map(e=>e.map((e,t)=>`${t?`L`:`M`}${_(e,e[1])}`).join(``)).join(``),ne=te.filter(e=>e.length>1).map(e=>`${e.map((e,t)=>`${t?`L`:`M`}${_(e,e[3])}`).join(``)}${[...e].reverse().map(e=>`L${_(e,e[2])}`).join(``)}Z`).join(``),y=[];for(let[e,...t]of te)e&&!t.length&&y.push({x:h(e[0]+ee),y:g(e[1])});let b=e.thresholds,re=b?{top:cn(g(b.high),s.top,s.bottom),bottom:cn(g(b.low),s.top,s.bottom)}:null,ie=m-p<=50?10:20,x=[];for(let e=p;e<=m;e+=ie)x.push({y:g(e),value:e});let ae=h(l),S=null;if(d&&e.forecast&&b&&u!==null){let t=ae,n=g(e.forecast.level),r=h(u),i=g(b.low);r>s.right&&(i=n+(i-n)*(s.right-t)/(r-t),r=s.right),S={x1:t,y1:n,x2:r,y2:i,from:cn(h(Date.parse(e.forecast.earliest)),t,s.right),to:cn(h(Date.parse(e.forecast.latest)),t,s.right)}}return{width:t,height:n,plot:s,domain:{t0:c,t1:f,v0:p,v1:m},x:h,y:g,line:v,envelope:ne,dots:y,band:re,xTicks:dn(c,l,f,r,(s.right-s.left)*Qt/(f-c)).map(e=>({...e,x:h(e.time)})),yTicks:a?[]:x,events:e.events.map(e=>({time:Date.parse(e.ts),type:e.type,source:e.source})).filter(e=>e.time>=c&&e.time<=f).map(e=>({...e,x:h(e.time)})),forecast:S,nowX:ae}}function pn(e,t,n){let r=e.points[0],i=e.points.at(-1);if(!r||!i)return null;let{t0:a,t1:o}=t.domain,{left:s,right:c}=t.plot,l=a+(n-s)/(c-s)*(o-a),u=e.step*1e3;if(l<r[0]||l>i[0]+u)return null;let d=r;for(let t of e.points)Math.abs(t[0]+u/2-l)<Math.abs(d[0]+u/2-l)&&(d=t);return{point:d,x:t.x(d[0]+u/2),y:t.y(d[1])}}var mn=`M0 -5C2.5 -1.6 3.6 0.4 3.6 1.9A3.6 3.6 0 0 1 -3.6 1.9C-3.6 0.4 -2.5 -1.6 0 -5Z`,Y=class extends I{constructor(...e){super(...e),this.language=`en`,this.compact=!1,this.height=180,this.dark=!1,this.width=0,this.hover=null,this.onPointer=e=>{if(!this.data||!this.model)return;let t=e.currentTarget.getBoundingClientRect(),n=pn(this.data,this.model,e.clientX-t.left);this.hover=n?this.data.points.indexOf(n.point):null},this.onLeave=()=>{this.hover=null},this.onKey=e=>{let t=this.data?.points.length??0;if(!t)return;let n=this.hover??t,r=new Map([[`ArrowLeft`,Math.max(0,n-1)],[`ArrowRight`,Math.min(t-1,this.hover===null?t-1:n+1)],[`Home`,0],[`End`,t-1]]).get(e.key);e.key===`Escape`?this.hover=null:r!==void 0&&(e.preventDefault(),this.hover=r)}}connectedCallback(){super.connectedCallback(),this.observer=new ResizeObserver(e=>{let t=Math.round(e[0]?.contentRect.width??0);t!==this.width&&(this.width=t)}),this.observer.observe(this),this.width||=Math.round(this.getBoundingClientRect().width)}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}willUpdate(e){e.has(`data`)&&(this.hover=null),[`data`,`width`,`height`,`compact`,`language`].some(t=>e.has(t))&&(this.model=this.data&&this.width?fn(this.data,this.width,this.height,this.language,{compact:this.compact}):void 0)}t(e,t){return B({language:this.language},e,t)}render(){let e=this.data,t=`height:${this.height}px`;if(!e)return k`<div class="frame" style=${t} aria-busy="true"></div>`;if(!e.points.length){let n=e.thresholds?`chart.empty`:`chart.no_sensor`;return k`<div class="frame empty muted" style=${t}>${this.t(n)}</div>`}let n=this.model,r=this.hover===null?void 0:e.points[this.hover];return k`
      <div
        class="frame"
        style=${t}
        tabindex="0"
        role="img"
        aria-label=${this.summary(e)}
        @keydown=${this.onKey}
      >
        ${n?k`<svg
              width=${n.width}
              height=${n.height}
              viewBox="0 0 ${n.width} ${n.height}"
              aria-hidden="true"
              @pointermove=${this.onPointer}
              @pointerdown=${this.onPointer}
              @pointerleave=${this.onLeave}
            >
              ${this.back(n)} ${this.series(n)} ${this.markers(n)}
              ${r?this.crosshair(n,r,e.step):M}
            </svg>`:M}
        ${n&&r?this.tooltip(n,r,e.step):M}
      </div>
    `}back(e){let{plot:t}=e;return A`
      ${e.band?A`<rect class="band" x=${t.left} y=${e.band.top}
            width=${t.right-t.left} height=${e.band.bottom-e.band.top}></rect>`:M}
      ${e.forecast?A`<rect class="future" x=${e.nowX} y=${t.top}
            width=${t.right-e.nowX} height=${t.bottom-t.top}></rect>`:M}
      ${e.forecast&&e.forecast.to>e.forecast.from?A`<rect class="window" x=${e.forecast.from} y=${t.top}
            width=${e.forecast.to-e.forecast.from} height=${t.bottom-t.top}></rect>`:M}
      ${e.yTicks.map(e=>A`
          <line class="grid" x1=${t.left} x2=${t.right} y1=${e.y} y2=${e.y}></line>
          <text class="label" x=${t.left-6} y=${e.y} text-anchor="end"
            dominant-baseline="middle">${e.value}</text>`)}
      <line class="axis" x1=${t.left} x2=${t.right} y1=${t.bottom} y2=${t.bottom}></line>
      ${e.xTicks.filter(e=>e.x>=t.left&&e.x<=t.right).map(n=>A`
            <line class="axis" x1=${n.x} x2=${n.x} y1=${t.bottom} y2=${t.bottom+3}></line>
            <text class="label" x=${n.x} y=${e.height-4}
              text-anchor="middle">${n.label}</text>`)}
    `}series(e){let t=e.forecast;return A`
      <path class="envelope" d=${e.envelope}></path>
      <path class="line" d=${e.line}></path>
      ${e.dots.map(e=>A`<circle class="dot" cx=${e.x} cy=${e.y} r="2"></circle>`)}
      ${t?A`
          <line class="now" x1=${e.nowX} x2=${e.nowX}
            y1=${e.plot.top} y2=${e.plot.bottom}></line>
          <line class="forecast" x1=${t.x1} y1=${t.y1}
            x2=${t.x2} y2=${t.y2}></line>`:M}
    `}markers(e){let t=e.plot.top+6;return e.events.map(n=>{if(n.type===`watered`){let r=n.source===`auto`;return A`
          <line class="watered-guide" x1=${n.x} x2=${n.x}
            y1=${t} y2=${e.plot.bottom}></line>
          <path class=${r?`drop detected`:`drop`} d=${mn}
            transform="translate(${n.x} ${t})"></path>`}return A`<rect class=${n.type===`fertilized`?`fertilized`:`other`} x=${n.x-3} y=${t-3} width="6" height="6"
        transform="rotate(45 ${n.x} ${t})"></rect>`})}crosshair(e,t,n){let r=e.x(t[0]+n*500);return A`
      <line class="cross" x1=${r} x2=${r} y1=${e.plot.top} y2=${e.plot.bottom}></line>
      <circle class="focus" cx=${r} cy=${e.y(t[1])} r="3.5"></circle>`}tooltip(e,t,n){let r=e.x(t[0]+n*500);return k`<div class="tip" style="top:${e.y(t[1])>e.plot.top+48?e.plot.top:e.plot.bottom-40}px;${r<e.width/3?`left:${Math.max(0,r-16)}px`:r>e.width*2/3?`right:${Math.max(0,e.width-r-16)}px`:`left:${r}px;transform:translateX(-50%)`}">
      <span class="muted"
        >${Qe(new Date(t[0]),new Date(t[0]+n*1e3),this.language)}</span
      >
      <span class="num"
        >${this.t(`chart.point`,{value:Math.round(t[1]),min:Math.round(t[2]),max:Math.round(t[3])})}</span
      >
    </div>`}summary(e){let t=Math.round((Date.parse(e.end)-Date.parse(e.start))/864e5),n=e.points.at(-1),r={days:t,value:n?Math.round(n[1]):`–`,count:e.events.filter(e=>e.type===`watered`).length,low:e.thresholds?.low,high:e.thresholds?.high};return this.t(e.thresholds?`chart.summary`:`chart.summary_plain`,r)}static{this.styles=[H,o`
    :host {
      position: relative;
    }
    .frame {
      position: relative;
      width: 100%;
      border-radius: 8px;
      touch-action: pan-y;
    }
    .frame:focus-visible {
      outline: 2px solid var(--rw-accent);
      outline-offset: 2px;
    }
    .empty {
      display: grid;
      place-items: center;
      background: var(--rw-track);
      font-size: 13px;
    }
    .muted {
      color: var(--rw-text2);
    }
    svg {
      display: block;
      overflow: visible;
    }
    .band {
      fill: var(--rw-accent-soft);
    }
    .future {
      fill: var(--rw-track);
      opacity: 0.5;
    }
    .window {
      fill: var(--rw-water-soft);
    }
    .grid {
      stroke: var(--rw-line);
      stroke-width: 1;
    }
    .axis {
      stroke: var(--rw-line);
    }
    .label {
      fill: var(--rw-text2);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }
    .envelope {
      fill: var(--rw-water-soft);
    }
    .line {
      fill: none;
      stroke: var(--rw-water);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .dot,
    .focus {
      fill: var(--rw-water);
    }
    .focus {
      stroke: var(--ha-card-background, var(--card-background-color, #fff));
      stroke-width: 2;
    }
    .now {
      stroke: var(--rw-text2);
      stroke-dasharray: 2 3;
    }
    .forecast {
      stroke: var(--rw-water);
      stroke-width: 2;
      stroke-dasharray: 5 4;
      stroke-linecap: round;
      opacity: 0.8;
    }
    .watered-guide {
      stroke: var(--rw-water);
      opacity: 0.25;
    }
    .drop {
      fill: var(--rw-water);
    }
    .drop.detected {
      fill: var(--ha-card-background, var(--card-background-color, #fff));
      stroke: var(--rw-water);
      stroke-width: 1.5;
    }
    .fertilized {
      fill: var(--rw-accent);
    }
    .other {
      fill: var(--rw-text2);
    }
    .cross {
      stroke: var(--rw-text2);
      opacity: 0.6;
    }
    .tip {
      position: absolute;
      display: grid;
      gap: 1px;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid var(--rw-line);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      color: var(--rw-text);
      font-size: 12px;
      line-height: 1.35;
      white-space: nowrap;
      pointer-events: none;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
    .num {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
  `]}};U([L({attribute:!1})],Y.prototype,`data`,void 0),U([L()],Y.prototype,`language`,void 0),U([L({type:Boolean})],Y.prototype,`compact`,void 0),U([L({type:Number})],Y.prototype,`height`,void 0),U([L({type:Boolean,reflect:!0})],Y.prototype,`dark`,void 0),U([R()],Y.prototype,`width`,void 0),U([R()],Y.prototype,`hover`,void 0);var X=class extends I{constructor(...e){super(...e),this.plantId=``,this.open=!1,this.dark=!1,this.mode=`choose`,this.note=``,this.saving=!1,this.onClose=()=>{this.reset(),this.dispatchEvent(new CustomEvent(`rootwise-photo-closed`,{bubbles:!0,composed:!0}))},this.startCamera=async()=>{this.error=void 0;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:`environment`},width:{ideal:1920},height:{ideal:1440}},audio:!1})}catch{this.error=this.t(`photo.camera_denied`);return}this.mode=`camera`,await this.updateComplete;let e=this.video;if(!e)return;e.srcObject=this.stream,await e.play().catch(()=>void 0);let[t]=this.stream.getVideoTracks();await t?.applyConstraints({advanced:[{focusMode:`continuous`}]}).catch(()=>void 0)},this.shoot=async()=>{let e=this.stream?.getVideoTracks()[0],t=window.ImageCapture,n=null;e&&t&&(n=await new t(e).takePhoto().catch(()=>null)),!n&&this.video&&(n=await this.frame(this.video)),this.stopCamera(),n?await this.take(n):this.error=this.t(`photo.failed`,{error:`camera`})},this.picked=async e=>{let t=e.target,n=t.files?.[0];t.value=``,n&&await this.take(n)},this.again=()=>{this.preview&&URL.revokeObjectURL(this.preview),this.preview=void 0,this.photo=void 0,this.mode=`choose`},this.save=async()=>{if(this.hass&&this.photo&&!this.saving){this.saving=!0,this.error=void 0;try{let e=await qt(this.hass,this.plantId,this.photo,this.note);this.dispatchEvent(new CustomEvent(`rootwise-photo-added`,{detail:{entry:e},bubbles:!0,composed:!0})),this.dialog?.close()}catch(e){this.error=this.t(`photo.failed`,{error:G(e)})}finally{this.saving=!1}}}}t(e,t){return B(this.hass,e,t)}get live(){return window.isSecureContext&&typeof navigator.mediaDevices?.getUserMedia==`function`}updated(e){e.has(`open`)&&this.dialog&&(this.open&&!this.dialog.open&&this.dialog.showModal(),!this.open&&this.dialog.open&&this.dialog.close())}disconnectedCallback(){super.disconnectedCallback(),this.reset()}reset(){this.stopCamera(),this.preview&&URL.revokeObjectURL(this.preview),this.preview=void 0,this.photo=void 0,this.note=``,this.mode=`choose`,this.error=void 0,this.saving=!1}stopCamera(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}frame(e){let t=document.createElement(`canvas`);return t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`)?.drawImage(e,0,0),new Promise(e=>t.toBlob(e,`image/jpeg`,.92))}async take(e){this.error=void 0;let t;try{t=await Gt(e)}catch{if(e instanceof File&&Ht(e)){this.error=this.t(`photo.heic`);return}t=e}this.preview&&URL.revokeObjectURL(this.preview),this.photo=t,this.preview=URL.createObjectURL(t),this.mode=`preview`}render(){return k`
      <dialog aria-labelledby="title" @close=${this.onClose}>
        <header>
          <h2 id="title">${this.t(`photo.add`)}</h2>
          <button class="icon" aria-label=${this.t(`photo.close`)} @click=${()=>this.dialog?.close()}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </header>
        ${this.mode===`camera`?this.renderCamera():this.mode===`preview`?this.renderPreview():this.renderChoose()}
        ${this.error?k`<p class="error" role="alert">${this.error}</p>`:M}
      </dialog>
    `}renderChoose(){let e=this.live,t=navigator.userAgent,n=/Home Assistant\//.test(t),r=e?null:Wt(this.hass?.config?.external_url,location.pathname,t);return k`
      <div class="choices">
        ${e?k`<button class="choice" @click=${this.startCamera}>
              <ha-icon icon="mdi:camera"></ha-icon>${this.t(`photo.camera`)}
            </button>`:n?M:k`<label class="choice">
                <input type="file" accept="image/*" capture="environment" @change=${this.picked} />
                <ha-icon icon="mdi:camera"></ha-icon>${this.t(`photo.camera`)}
              </label>`}
        <label class="choice">
          <input type="file" accept="image/*" @change=${this.picked} />
          <ha-icon icon="mdi:image-multiple"></ha-icon>${this.t(`photo.gallery`)}
        </label>
      </div>
      ${e?M:k`<p class="hint">
            ${this.t(`photo.https_hint`)}
            ${r?k`<a href=${r}>${this.t(`photo.chrome`)}</a>`:M}
          </p>`}
    `}renderCamera(){return k`
      <div class="viewfinder"><video autoplay playsinline muted></video></div>
      <div class="row">
        <button class="secondary" @click=${this.again}>${this.t(`action.cancel`)}</button>
        <button class="primary" @click=${this.shoot}>
          <ha-icon icon="mdi:camera-iris"></ha-icon>${this.t(`photo.shoot`)}
        </button>
      </div>
    `}renderPreview(){return k`
      <img class="preview" src=${this.preview??``} alt="" />
      <label class="note">
        <span class="muted">${this.t(`photo.note`)}</span>
        <input
          type="text"
          maxlength="500"
          .value=${this.note}
          @input=${e=>this.note=e.target.value}
        />
      </label>
      <div class="row">
        <button class="secondary" ?disabled=${this.saving} @click=${this.again}>${this.t(`photo.retake`)}</button>
        <button class="primary" ?disabled=${this.saving} @click=${this.save}>
          ${this.saving?this.t(`photo.saving`):this.t(`photo.save`)}
        </button>
      </div>
    `}static{this.styles=[H,o`
      :host {
        display: contents;
      }
      dialog {
        width: min(480px, calc(100vw - 24px));
        max-height: calc(100vh - 24px);
        box-sizing: border-box;
        padding: 16px;
        border: 0;
        border-radius: 20px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--rw-text);
        display: none;
        flex-direction: column;
        gap: 12px;
      }
      dialog[open] {
        display: flex;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.55);
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      .icon {
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 50%;
        background: none;
        display: grid;
        place-items: center;
      }
      .choices {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      .choice {
        min-height: 96px;
        border-radius: 16px;
        border: 1px solid var(--rw-line);
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
      }
      .choice ha-icon {
        --mdc-icon-size: 32px;
      }
      .choice input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }
      .choice:focus-within {
        outline: 2px solid var(--rw-accent);
        outline-offset: 2px;
      }
      .hint {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--rw-text2);
      }
      .hint a {
        color: var(--rw-accent);
        font-weight: 500;
      }
      .viewfinder {
        border-radius: 14px;
        overflow: hidden;
        background: #000;
        aspect-ratio: 3 / 4;
        max-height: 60vh;
      }
      video,
      .preview {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .preview {
        max-height: 55vh;
        object-fit: contain;
        border-radius: 14px;
        background: var(--rw-track);
      }
      .note {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }
      .note input {
        font: inherit;
        font-size: 15px;
        min-height: 40px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--rw-line);
        background: transparent;
        color: var(--rw-text);
      }
      .row {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .row button {
        min-height: 44px;
        padding: 0 18px;
        border-radius: 22px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
      .primary {
        border: 0;
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .secondary {
        border: 1px solid var(--rw-line);
        background: none;
      }
      button:disabled {
        opacity: 0.6;
      }
      .error {
        margin: 0;
        color: var(--error-color, #b3261e);
        font-size: 14px;
      }
      .muted {
        color: var(--rw-text2);
      }
    `]}};U([L({attribute:!1})],X.prototype,`hass`,void 0),U([L()],X.prototype,`plantId`,void 0),U([L({type:Boolean})],X.prototype,`open`,void 0),U([L({type:Boolean,reflect:!0})],X.prototype,`dark`,void 0),U([R()],X.prototype,`mode`,void 0),U([R()],X.prototype,`preview`,void 0),U([R()],X.prototype,`note`,void 0),U([R()],X.prototype,`saving`,void 0),U([R()],X.prototype,`error`,void 0),U([Fe(`dialog`)],X.prototype,`dialog`,void 0),U([Fe(`video`)],X.prototype,`video`,void 0);var hn=50,Z=class extends I{constructor(...e){super(...e),this.dark=!1,this.photos=[],this.cover=null,this.viewing=null,this.capturing=!1,this.confirmDelete=!1,this.listKey=``,this.swipeFrom=null,this.closeViewer=()=>{this.viewer?.close()},this.onViewerClosed=()=>{this.viewing=null,this.confirmDelete=!1},this.onKey=e=>{e.key===`ArrowLeft`&&this.step(-1),e.key===`ArrowRight`&&this.step(1)},this.onPointerDown=e=>{this.swipeFrom=e.clientX},this.onPointerUp=e=>{if(this.swipeFrom===null)return;let t=e.clientX-this.swipeFrom;this.swipeFrom=null,Math.abs(t)>=hn&&this.step(t>0?-1:1)}}t(e,t){return B(this.hass,e,t)}capture(){this.capturing=!0}updated(){let e=this.plant;if(!e||!this.hass)return;let t=[e.id,e.photo?.id,e.recent[0]?.id].join(`|`);t!==this.listKey&&(this.listKey=t,this.reload()),this.viewing!==null&&this.viewer&&!this.viewer.open&&this.viewer.showModal()}async reload(){let e=this.plant;if(e&&this.hass)try{let t=await Xt(this.hass,e.id);if(this.plant?.id!==e.id)return;this.photos=t.photos,this.cover=t.cover,this.viewing!==null&&this.viewing>=this.photos.length&&(this.viewing=this.photos.length?this.photos.length-1:null)}catch{this.listKey=``}}date(e){return new Intl.DateTimeFormat(z(this.hass),{dateStyle:`medium`}).format(new Date(e))}view(e){this.confirmDelete=!1,this.message=void 0,this.viewing=e}step(e){this.viewing!==null&&this.photos.length&&this.view((this.viewing+e+this.photos.length)%this.photos.length)}async useAsCover(e){if(this.hass&&this.plant)try{await Zt(this.hass,this.plant.id,e.photo_id),this.cover=e.photo_id,this.message=this.t(`photo.cover_set`)}catch(e){this.message=this.t(`toast.failed`,{error:G(e)})}}async deletePhoto(e){if(this.hass){if(!this.confirmDelete){this.confirmDelete=!0;return}this.confirmDelete=!1;try{await ze(this.hass,e.entry_id),this.photos=this.photos.filter(t=>t.entry_id!==e.entry_id),this.photos.length?this.viewing!==null&&(this.viewing=Math.min(this.viewing,this.photos.length-1)):this.closeViewer()}catch(e){this.message=this.t(`toast.failed`,{error:G(e)})}}}deletable(e){if(!this.hass)return!1;let t={id:e.entry_id,source:`card`,user_id:e.user_id??void 0};return He(this.hass,t)}render(){let e=this.plant;return k`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t(`section.photos`)}</h3>
          <button class="add" @click=${()=>this.capture()}>
            <ha-icon icon="mdi:camera-plus-outline"></ha-icon>${this.t(`photo.add_short`)}
          </button>
        </div>
        ${this.photos.length?k`<div class="grid">${this.photos.map((e,t)=>this.renderThumb(e,t))}</div>`:k`<p class="muted small">${this.t(`photo.empty`)}</p>`}
      </section>
      <rootwise-photo-capture
        .hass=${this.hass}
        plantId=${e?.id??``}
        ?open=${this.capturing}
        ?dark=${this.dark}
        @rootwise-photo-closed=${()=>this.capturing=!1}
        @rootwise-photo-added=${()=>void this.reload()}
      ></rootwise-photo-capture>
      ${this.renderViewer()}
    `}renderThumb(e,t){let n=this.date(e.ts);return k`<button class="thumb" aria-label=${n} @click=${()=>this.view(t)}>
      <rootwise-auth-image
        .hass=${this.hass}
        plantId=${this.plant?.id??``}
        photoId=${e.photo_id}
        size="thumb"
        alt=${n}
      ></rootwise-auth-image>
      ${e.photo_id===this.cover?k`<span class="badge">${this.t(`photo.is_cover`)}</span>`:M}
    </button>`}renderViewer(){let e=this.viewing===null?void 0:this.photos[this.viewing];return k`<dialog
      class="viewer"
      aria-label=${this.t(`section.photos`)}
      @close=${this.onViewerClosed}
      @keydown=${this.onKey}
    >
      ${e?k`
            <div class="bar">
              <span class="counter num">${(this.viewing??0)+1} / ${this.photos.length}</span>
              <span class="when">${this.date(e.ts)}</span>
              <button class="round" aria-label=${this.t(`photo.close`)} @click=${this.closeViewer}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
            <div class="stage" @pointerdown=${this.onPointerDown} @pointerup=${this.onPointerUp}>
              <rootwise-auth-image
                .hass=${this.hass}
                plantId=${this.plant?.id??``}
                photoId=${e.photo_id}
                size="full"
                alt=${this.date(e.ts)}
              ></rootwise-auth-image>
              ${this.photos.length>1?k`<button class="round side prev" aria-label=${this.t(`photo.prev`)} @click=${()=>this.step(-1)}>
                      <ha-icon icon="mdi:chevron-left"></ha-icon>
                    </button>
                    <button class="round side next" aria-label=${this.t(`photo.next`)} @click=${()=>this.step(1)}>
                      <ha-icon icon="mdi:chevron-right"></ha-icon>
                    </button>`:M}
            </div>
            <div class="bar bottom">
              <span class="note">${e.note??``}</span>
              <span class="actions">
                ${e.photo_id===this.cover?k`<span class="pill">${this.t(`photo.is_cover`)}</span>`:k`<button class="pill" @click=${()=>void this.useAsCover(e)}>
                      <ha-icon icon="mdi:star-outline"></ha-icon>${this.t(`photo.cover`)}
                    </button>`}
                ${this.deletable(e)?k`<button class="pill danger" @click=${()=>void this.deletePhoto(e)}>
                      <ha-icon icon="mdi:delete-outline"></ha-icon>${this.confirmDelete?this.t(`photo.delete_confirm`):this.t(`photo.delete`)}
                    </button>`:M}
              </span>
            </div>
            ${this.message?k`<div class="message" role="status">${this.message}</div>`:M}
          `:M}
    </dialog>`}static{this.styles=[H,o`
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .add {
        min-height: 36px;
        padding: 0 14px;
        border-radius: 18px;
        border: 0;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 6px;
      }
      .thumb {
        position: relative;
        padding: 0;
        border: 0;
        border-radius: 10px;
        overflow: hidden;
        aspect-ratio: 1;
        background: none;
      }
      .thumb rootwise-auth-image {
        width: 100%;
        height: 100%;
      }
      .badge {
        position: absolute;
        left: 6px;
        bottom: 6px;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
      }
      .small {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
      }
      .viewer {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        margin: 0;
        padding: 0;
        border: 0;
        background: #000;
        color: #fff;
        display: none;
        flex-direction: column;
      }
      .viewer[open] {
        display: flex;
      }
      .viewer::backdrop {
        background: #000;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 8px;
      }
      .bar.bottom {
        padding: 8px 12px calc(12px + env(safe-area-inset-bottom, 0px));
        flex-wrap: wrap;
      }
      .when {
        flex: 1;
        font-size: 15px;
      }
      .counter {
        font-size: 13px;
        opacity: 0.75;
      }
      .note {
        flex: 1;
        min-width: 140px;
        font-size: 14px;
        opacity: 0.9;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .stage {
        position: relative;
        flex: 1;
        min-height: 0;
        touch-action: pan-y;
      }
      .stage rootwise-auth-image {
        width: 100%;
        height: 100%;
        background: none;
        --rw-image-fit: contain;
      }
      .round {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 0;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        display: grid;
        place-items: center;
      }
      .side {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }
      .prev {
        left: 8px;
      }
      .next {
        right: 8px;
      }
      .pill {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 20px;
        border: 0;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }
      span.pill {
        background: rgba(72, 165, 102, 0.35);
      }
      .pill.danger {
        background: rgba(242, 184, 181, 0.2);
      }
      .message {
        position: absolute;
        left: 50%;
        bottom: 88px;
        transform: translateX(-50%);
        padding: 8px 14px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.9);
        color: #111;
        font-size: 14px;
      }
    `]}};U([L({attribute:!1})],Z.prototype,`hass`,void 0),U([L({attribute:!1})],Z.prototype,`plant`,void 0),U([L({type:Boolean,reflect:!0})],Z.prototype,`dark`,void 0),U([R()],Z.prototype,`photos`,void 0),U([R()],Z.prototype,`cover`,void 0),U([R()],Z.prototype,`viewing`,void 0),U([R()],Z.prototype,`capturing`,void 0),U([R()],Z.prototype,`confirmDelete`,void 0),U([R()],Z.prototype,`message`,void 0),U([Fe(`dialog.viewer`)],Z.prototype,`viewer`,void 0);async function gn(e){document.querySelector(`home-assistant`)&&await customElements.whenDefined(`home-assistant`);for(let[t,n]of e)customElements.get(t)||customElements.define(t,n)}var{I:_n}=De,vn=e=>e.strings===void 0,yn={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},bn=e=>(...t)=>({_$litDirective$:e,values:t}),xn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Q=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),Q(e,t);return!0},Sn=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},Cn=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),En(t)}};function wn(e){this._$AN===void 0?this._$AM=e:(Sn(this),this._$AM=e,Cn(this))}function Tn(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)Q(r[e],!1),Sn(r[e]);else r!=null&&(Q(r,!1),Sn(r))}else Q(this,e)}}var En=e=>{e.type==yn.CHILD&&(e._$AP??=Tn,e._$AQ??=wn)},Dn=class extends xn{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),Cn(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(Q(this,e),Sn(this))}setValue(e){if(vn(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}},On=new WeakMap,kn=bn(class extends Dn{render(e){return M}update(e,[t]){let n=t!==this.G;return n&&this.rt(void 0),(n||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),M}rt(e){if(this.G!==void 0){if(this.isConnected||(e=void 0),typeof this.G==`function`){let t=this.ht??globalThis,n=On.get(t);n===void 0&&(n=new WeakMap,On.set(t,n)),n.get(this.G)!==void 0&&this.G.call(this.ht,void 0),n.set(this.G,e),e!==void 0&&this.G.call(this.ht,e)}else this.G.value=e}}get lt(){return typeof this.G==`function`?On.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),An=new WeakMap;function jn(e){return kn(t=>{if(!t)return;let n=JSON.stringify(e);An.get(t)!==n&&(An.set(t,n),t.setConfig(e))})}var Mn=6e5,Nn={cats:`mdi:cat`,dogs:`mdi:dog`,humans:`mdi:human-child`},Pn=class extends W{constructor(...e){super(...e),this.plantId=``,this.days=14,this.historyKey=``}connectedCallback(){super.connectedCallback(),this.refreshTimer=window.setInterval(()=>{this.historyKey=``,this.requestUpdate()},Mn)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this.refreshTimer)}get plant(){return this.payload?.plants.find(e=>e.id===this.plantId)}updated(e){super.updated(e);let t=this.plant;if(!t||!this.hass)return;let n=[t.id,this.days,t.last_watered,t.recent[0]?.id].join(`|`);n!==this.historyKey&&(e.has(`plantId`)&&(this.history=void 0),this.historyKey=n,this.loadHistory(t.id,this.days))}async loadHistory(e,t){if(this.hass)try{let n=await Ue(this.hass,e,t);this.plantId===e&&this.days===t&&(this.history=n)}catch{this.historyKey=``}}render(){if(!this.payload)return k`<div class="empty muted">…</div>`;let e=this.plant;return e?k`
      ${this.renderHero(e)}
      <rootwise-plant-card
        .hass=${this.hass}
        ${jn({type:`custom:rootwise-plant-card`,plant_id:e.id,show_history:!0,embedded:!0})}
      ></rootwise-plant-card>
      ${e.thresholds||e.measurements.soil_moisture?this.renderChart():M}
      <rootwise-photo-gallery
        .hass=${this.hass}
        .plant=${e}
        ?dark=${!!this.hass?.themes?.darkMode}
      ></rootwise-photo-gallery>
      ${this.renderPot(e)} ${this.renderSpecies(e)}
    `:k`<div class="empty muted">${this.t(`panel.unknown`)}</div>`}renderHero(e){let t=[e.species.common,e.species.scientific].filter((e,t,n)=>!!e&&n.indexOf(e)===t),n=[e.area,e.pot.window===`none`?null:this.t(`window.${e.pot.window}`)];if(e.photo){let r=new Intl.DateTimeFormat(z(this.hass),{day:`numeric`,month:`numeric`}).format(new Date(e.photo.ts));return k`
        <section class="hero big">
          <rootwise-auth-image
            class="cover"
            .hass=${this.hass}
            plantId=${e.id}
            photoId=${e.photo.id}
            size="full"
            alt=${e.name}
          ></rootwise-auth-image>
          <div class="hero-text">
            <h2>${e.name}</h2>
            <div class="muted">${n.filter(Boolean).join(` · `)}</div>
            ${t.length?k`<div class="muted italic">${t.join(` · `)}</div>`:M}
            <div class="muted small">${this.t(`photo.cover_caption`,{date:r})}</div>
          </div>
        </section>
      `}return k`
      <section class="hero">
        <div class="photo">
          ${e.species.image_url?k`<img
                src=${e.species.image_url}
                alt=""
                @error=${e=>e.target.hidden=!0}
              />`:M}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="hero-text">
          <h2>${e.name}</h2>
          <div class="muted">${n.filter(Boolean).join(` · `)}</div>
          ${t.length?k`<div class="muted italic">${t.join(` · `)}</div>`:M}
        </div>
      </section>
    `}renderChart(){let e=this.history?.thresholds;return k`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t(`section.moisture`)}</h3>
          <div class="segments" role="group">
            ${[14,30].map(e=>k`<button
                aria-pressed=${e===this.days?`true`:`false`}
                @click=${()=>this.days=e}
              >
                ${this.t(`panel.days`,{days:e})}
              </button>`)}
          </div>
        </div>
        <rootwise-moisture-chart
          .data=${this.history}
          language=${z(this.hass)}
          ?dark=${!!this.hass?.themes?.darkMode}
          height="200"
        ></rootwise-moisture-chart>
        <div class="legend muted">
          <span><i class="key drop"></i>${this.t(`care.watered`)}</span>
          <span><i class="key dash"></i>${this.t(`chart.forecast`)}</span>
          ${e?k`<span
                ><i class="key band"></i>${this.t(`chart.target`,{low:e.low,high:e.high})}</span
              >`:M}
        </div>
      </section>
    `}renderPot(e){let t=this.hass?Ct(this.hass,e.pot.amount):null;return k`
      <section class="surface">
        <h3>${this.t(`section.pot`)}</h3>
        <div class="row">
          <ha-icon icon="mdi:pot-outline"></ha-icon>
          <span>${this.hass?wt(this.hass,e.pot):``}</span>
        </div>
        ${t&&this.hass?k`<div class="row">
              <ha-icon icon="mdi:cup-water"></ha-icon>
              <span>
                <b>${this.t(`amount.per_watering`,{amount:t})}</b><br />
                <span class="muted">${Tt(this.hass,e.pot)}</span>
              </span>
            </div>`:M}
      </section>
    `}renderSpecies(e){if(!this.hass)return M;let t=Dt(this.hass,e.species),n=Ot(this.hass,e.species);return!t.length&&!n?M:k`
      <section class="surface">
        <h3>${this.t(`section.species`)}</h3>
        ${t.length?k`<dl class="facts">
              ${t.map(e=>k`<dt>${e.label}</dt><dd>${e.text}</dd>`)}
            </dl>`:M}
        ${n?k`<div class="tox">
              <div class="tox-title">${this.t(`species.toxicity`)}</div>
              <div class="badges">
                ${n.badges.map(e=>k`<span class="badge ${e.level}">
                    <ha-icon icon=${Nn[e.key]}></ha-icon>${e.who}: ${e.text}
                  </span>`)}
              </div>
              <p class="muted small">
                ${[n.note,n.source,this.t(`tox.emergency`)].filter(Boolean).join(` `)}
              </p>
            </div>`:M}
      </section>
    `}static{this.styles=[H,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .empty {
        padding: 32px 16px;
        text-align: center;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .hero {
        display: flex;
        gap: 14px;
        align-items: center;
      }
      .hero.big {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      .cover {
        width: 100%;
        aspect-ratio: 4 / 3;
        max-height: 320px;
        border-radius: var(--rw-radius);
      }
      .photo {
        position: relative;
        width: 96px;
        height: 96px;
        flex-shrink: 0;
        border-radius: 20px;
        overflow: hidden;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: grid;
        place-items: center;
      }
      .photo ha-icon {
        --mdc-icon-size: 40px;
      }
      .photo img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hero-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      h2 {
        margin: 0 0 2px;
        font-size: 22px;
        font-weight: 500;
        line-height: 1.2;
      }
      .italic {
        font-style: italic;
      }
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .segments {
        display: flex;
        border: 1px solid var(--rw-line);
        border-radius: 18px;
        overflow: hidden;
      }
      .segments button {
        min-height: 32px;
        padding: 0 12px;
        border: 0;
        background: none;
        font-size: 13px;
      }
      .segments button[aria-pressed="true"] {
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        font-weight: 500;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        font-size: 12px;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .key {
        display: inline-block;
      }
      .key.drop {
        width: 8px;
        height: 8px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: var(--rw-water);
      }
      .key.dash {
        width: 16px;
        border-top: 2px dashed var(--rw-water);
      }
      .key.band {
        width: 14px;
        height: 10px;
        border-radius: 2px;
        background: var(--rw-accent-soft);
        border: 1px solid var(--rw-accent);
      }
      .row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        line-height: 1.4;
      }
      .row ha-icon {
        color: var(--rw-text2);
        margin-top: 1px;
      }
      .facts {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 16px;
        margin: 0;
      }
      dt {
        color: var(--rw-text2);
      }
      dd {
        margin: 0;
      }
      .tox {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 4px;
        border-top: 1px solid var(--rw-line);
      }
      .tox-title {
        color: var(--rw-text2);
        padding-top: 8px;
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 14px;
        font-size: 13px;
        background: var(--rw-track);
      }
      .badge ha-icon {
        --mdc-icon-size: 16px;
      }
      .badge.none {
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
      }
      .badge.mild,
      .badge.moderate {
        background: var(--rw-warn-soft);
        color: var(--rw-warn);
      }
      .badge.severe {
        background: var(--rw-prob-soft);
        color: var(--rw-prob);
      }
      .small {
        font-size: 13px;
        margin: 0;
        line-height: 1.4;
      }
    `]}};U([L()],Pn.prototype,`plantId`,void 0),U([R()],Pn.prototype,`days`,void 0),U([R()],Pn.prototype,`history`,void 0);function Fn(e){let t=/^\/plant\/([^/]+)/.exec(e??``);return t?.[1]?{kind:`plant`,id:decodeURIComponent(t[1])}:{kind:`overview`}}function In(e){let t=new Map;for(let n of e)n.area_id&&n.area&&t.set(n.area_id,n.area);return[...t].map(([e,t])=>({id:e,name:t})).sort((e,t)=>e.name.localeCompare(t.name))}var $=class extends W{constructor(...e){super(...e),this.narrow=!1,this.area=null,this.toggleMenu=()=>{this.dispatchEvent(new CustomEvent(`hass-toggle-menu`,{bubbles:!0,composed:!0}))}}render(){let e=Fn(this.route?.path),t=e.kind===`plant`?this.payload?.plants.find(t=>t.id===e.id):void 0;return k`
      <header class="toolbar">
        ${e.kind===`plant`?k`<button class="icon" aria-label=${this.t(`panel.back`)} @click=${()=>Nt(jt)}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>`:this.narrow?k`<button class="icon" aria-label=${this.t(`panel.menu`)} @click=${this.toggleMenu}>
                <ha-icon icon="mdi:menu"></ha-icon>
              </button>`:M}
        <h1 class="title">${e.kind===`plant`?t?.name??``:this.t(`panel.title`)}</h1>
        ${t?.device_id&&this.hass?.user?.is_admin?k`<button
              class="icon"
              aria-label=${this.t(`panel.settings`)}
              title=${this.t(`panel.settings`)}
              @click=${()=>Nt(`/config/devices/device/${t.device_id}`)}
            >
              <ha-icon icon="mdi:tune-variant"></ha-icon>
            </button>`:M}
      </header>
      <main>${e.kind===`plant`?this.renderPlant(e.id):this.renderOverview()}</main>
    `}renderOverview(){let e=In(this.payload?.plants??[]),t=e.some(e=>e.id===this.area)?this.area:null;return k`
      ${e.length>1?k`<div class="chips" role="group" aria-label=${this.t(`panel.rooms`)}>
            ${[{id:null,name:this.t(`panel.all`)},...e].map(e=>k`<button
                class="chip"
                aria-pressed=${e.id===t?`true`:`false`}
                @click=${()=>this.area=e.id}
              >
                ${e.name}
              </button>`)}
          </div>`:M}
      <rootwise-overview-card
        .hass=${this.hass}
        ${jn({type:`custom:rootwise-overview-card`,area_id:t??void 0,show_tiles:!0})}
      ></rootwise-overview-card>
    `}renderPlant(e){return k`<rootwise-plant-page .hass=${this.hass} .plantId=${e}></rootwise-plant-page>`}static{this.styles=[H,o`
      :host {
        min-height: 100%;
        background: var(--primary-background-color);
      }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 4px;
        height: var(--header-height, 56px);
        padding: 0 4px;
        background: var(--app-header-background-color, var(--primary-background-color));
        color: var(--app-header-text-color, var(--primary-text-color));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--divider-color));
      }
      .title {
        flex: 1;
        margin: 0 0 0 12px;
        font-size: 20px;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .icon {
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 50%;
        background: none;
        display: grid;
        place-items: center;
        color: inherit;
      }
      .icon:hover {
        background: rgba(127, 127, 127, 0.12);
      }
      main {
        max-width: 720px;
        margin: 0 auto;
        padding: 12px 12px 32px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .chips {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 2px 0;
        scrollbar-width: none;
      }
      .chip {
        flex-shrink: 0;
        min-height: 36px;
        padding: 0 14px;
        border-radius: 18px;
        border: 1px solid var(--rw-line);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        font-size: 14px;
      }
      .chip[aria-pressed="true"] {
        background: var(--rw-accent-soft);
        border-color: var(--rw-accent);
        color: var(--rw-accent);
        font-weight: 500;
      }
    `]}};U([L({type:Boolean})],$.prototype,`narrow`,void 0),U([L({attribute:!1})],$.prototype,`route`,void 0),U([L({attribute:!1})],$.prototype,`panel`,void 0),U([R()],$.prototype,`area`,void 0);var Ln={language:document.documentElement.lang||navigator.language};window.customCards=window.customCards??[];for(let e of[`overview`,`plant`])window.customCards.push({type:`rootwise-${e}-card`,name:B(Ln,`picker.${e}.name`),description:B(Ln,`picker.${e}.description`),preview:!0,documentationURL:`https://github.com/michi-walchsi/ha-rootwise`});gn([[`rootwise-auth-image`,J],[`rootwise-moisture-chart`,Y],[`rootwise-photo-capture`,X],[`rootwise-photo-gallery`,Z],[`rootwise-overview-card`,K],[`rootwise-plant-card`,q],[`rootwise-plant-page`,Pn],[`rootwise-panel`,$]]),console.info(`%c ROOTWISE-CARDS %c 0.3.1 `,`background:#2e7d32;color:#fff`,``);