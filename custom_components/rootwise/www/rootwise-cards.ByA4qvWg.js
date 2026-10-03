var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,p=f.trustedTypes,re=p?p.emptyScript:``,ie=f.reactiveElementPolyfillSupport,m=(e,t)=>e,h={toAttribute(e,t){switch(t){case Boolean:e=e?re:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},g=(e,t)=>!l(e,t),ae={attribute:!0,type:String,converter:h,reflect:!1,useDefault:!1,hasChanged:g};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ae}static _$Ei(){if(this.hasOwnProperty(m(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?h:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?h:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??g)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:`open`},_[m(`elementProperties`)]=new Map,_[m(`finalized`)]=new Map,ie?.({ReactiveElement:_}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var v=globalThis,oe=e=>e,y=v.trustedTypes,b=y?y.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,C=()=>S.createComment(``),w=e=>e===null||typeof e!=`object`&&typeof e!=`function`,T=Array.isArray,ue=e=>T(e)||typeof e?.[Symbol.iterator]==`function`,E=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,fe=/>/g,O=RegExp(`>|${E}(?:([^\\s"'>=/]+)(${E}*=${E}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),pe=/'/g,me=/"/g,he=/^(?:script|style|textarea|title)$/i,k=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),A=Symbol.for(`lit-noChange`),j=Symbol.for(`lit-nothing`),ge=new WeakMap,M=S.createTreeWalker(S,129);function _e(e,t){if(!T(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return b===void 0?t:b.createHTML(t)}var ve=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=D;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===D?c[1]===`!--`?o=de:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=O):(he.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=O):o=fe:o===O?c[0]===`>`?(o=i??D,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?O:c[3]===`"`?me:pe):o===me||o===pe?o=O:o===de||o===fe?o=D:(o=O,i=void 0);let d=o===O&&e[t+1].startsWith(`/>`)?` `:``;a+=o===D?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[_e(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},N=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ve(t,n);if(this.el=e.createElement(l,r),M.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=M.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?be:r[1]===`?`?xe:r[1]===`@`?Se:I}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(he.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=y?y.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],C()),M.nextNode(),c.push({type:2,index:++a});i.append(e[t],C())}}}else if(i.nodeType===8){if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function P(e,t,n=e,r){if(t===A)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=w(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=P(e,i._$AS(e,t.values),i,r)),t}var ye=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);M.currentNode=r;let i=M.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new F(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ce(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=M.nextNode(),a++)}return M.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},F=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),w(e)?e===j||e==null||e===``?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==A&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ue(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&w(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=N.createElement(_e(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ye(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=ge.get(e.strings);return t===void 0&&ge.set(e.strings,t=new N(e)),t}k(t){T(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(C()),this.O(C()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=oe(e).nextSibling;oe(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},I=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=j}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=P(this,e,t,0),a=!w(e)||e!==this._$AH&&e!==A,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=P(this,r[n+o],t,o),s===A&&(s=this._$AH[o]),a||=!w(s)||s!==this._$AH[o],s===j?e=j:e!==j&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},be=class extends I{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}},xe=class extends I{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}},Se=class extends I{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??j)===A)return;let n=this._$AH,r=e===j&&n!==j||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==j&&(n===j||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ce=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}},we=v.litHtmlPolyfillSupport;we?.(N,F),(v.litHtmlVersions??=[]).push(`3.3.3`);var Te=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new F(t.insertBefore(C(),e),e,void 0,n??{})}return i._$AI(e),i},L=globalThis,R=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Te(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};R._$litElement$=!0,R.finalized=!0,L.litElementHydrateSupport?.({LitElement:R});var Ee=L.litElementPolyfillSupport;Ee?.({LitElement:R}),(L.litElementVersions??=[]).push(`4.2.2`);var De=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Oe={attribute:!0,type:String,converter:h,reflect:!1,hasChanged:g},ke=(e=Oe,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function Ae(e){return(t,n)=>typeof n==`object`?ke(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function z(e){return Ae({...e,state:!0,attribute:!1})}var B=new WeakMap;function je(e,t){let n=e.connection,r=B.get(n);if(!r){let e={listeners:new Set};e.unsubscribe=n.subscribeMessage(t=>{e.last=t,e.listeners.forEach(e=>e(t))},{type:`rootwise/plants/subscribe`}),B.set(n,e),r=e}let i=r;return i.listeners.add(t),i.last&&t(i.last),()=>{i.listeners.delete(t),i.listeners.size===0&&(B.delete(n),i.unsubscribe?.then(e=>e()).catch(()=>void 0))}}async function V(e,t,n,r){let i={type:`rootwise/care/log`,plant_id:t,care_type:n};return r&&(i.when=r.toISOString()),(await e.callWS(i)).entry}async function H(e,t){await e.callWS({type:`rootwise/care/delete`,entry_id:t})}async function Me(e,t){await e.callWS({type:`call_service`,domain:`button`,service:`press`,target:{entity_id:t}})}async function Ne(e,t){await e.callWS({type:`rootwise/thresholds/reset`,plant_id:t})}function Pe(e,t){let n=e.user;return n?n.is_admin||t.source===`auto`?!0:t.user_id!==void 0&&t.user_id===n.id:!1}var Fe={"status.ok":`All good`,"status.thirsty":`Needs water`,"status.too_wet":`Too wet`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Not watered yet`,"level.dry":`Dry`,"level.drying":`Water soon`,"level.ok":`Just right`,"level.fresh":`Wet, freshly watered`,"level.too_wet":`Too wet`,"m.soil_moisture":`Soil moisture`,"m.temperature":`Temperature`,"m.air_humidity":`Air humidity`,"m.illuminance":`Light`,"m.conductivity":`Fertilizer`,"m.battery":`Battery`,"care.watered":`Watered`,"care.fertilized":`Fertilized`,"care.repotted":`Repotted`,"care.cleaned":`Leaves cleaned`,"care.rotated":`Rotated`,"care.pest_check":`Checked for pests`,"care.pruned":`Pruned`,"care.sensor_moved":`Sensor moved`,"care.note":`Note`,"action.water":`Watered`,"action.undo":`Undo`,"action.snooze":`+1 day`,"action.more":`More`,"action.delete":`Delete`,"action.cancel":`Cancel`,"action.save":`Save`,"when.title":`When did you water?`,"when.now":`Just now`,"when.hours":`A few hours ago`,"when.yesterday":`Yesterday`,"when.pick":`Pick date and time`,"toast.logged":`{type} logged`,"toast.deleted":`Entry deleted`,"toast.failed":`That didn't work: {error}`,last_watered:`Watered {time}`,never_watered:`No watering logged yet`,history:`History`,"history.empty":`Nothing logged yet`,snoozed_until:`Snoozed until {time}`,vacation:`Vacation mode is on`,"reason.below_threshold":`Soil moisture {value} % is below {threshold} %`,"reason.too_wet":`Soil moisture {value} % above {threshold} % for two days`,"reason.sensor_offline":`No data from the soil sensor`,"reason.snoozed":`Snoozed`,"reason.just_watered":`Just watered`,"reason.interval_due":`Due after {days} days`,"reason.no_history":`Log the first watering to start the reminder`,"hint.temperature_low":`Too cold: {value} °C, at least {min} °C`,"hint.temperature_high":`Too warm: {value} °C, at most {max} °C`,"hint.air_humidity_low":`Air too dry: {value} %, at least {min} %`,"hint.air_humidity_high":`Air too humid: {value} %, at most {max} %`,"hint.illuminance_low":`Too dark: {value} lx, at least {min} lx`,"hint.illuminance_high":`Too bright: {value} lx, at most {max} lx`,"hint.conductivity_low":`Little fertilizer: {value} µS/cm, at least {min}`,"hint.conductivity_high":`Too much fertilizer: {value} µS/cm, at most {max}`,"hint.battery_low":`Sensor battery low: {value} %`,"overview.title":`Plants`,"overview.today":`Water today`,"overview.none":`Nobody is thirsty`,"overview.all_done":`Mark all as watered`,"overview.empty":`No plants yet. Add one under Settings → Devices & services → Rootwise.`,not_loaded:`Rootwise is not loaded.`,unknown_plant:`Pick a plant in the card settings.`,"target.range":`target {min}–{max}`,"target.min":`at least {min}`,"target.max":`at most {max}`,no_value:`no value`,"history.moisture":`{value} % soil moisture`,"delete.confirm":`Delete?`,"toast.undone":`Undone`,"more.other_time":`Watered at another time…`,"editor.device_id":`Plant`,"overview.due.one":`1 needs water today`,"overview.due.other":`{count} need water today`,"overview.hints.one":`1 hint`,"overview.hints.other":`{count} hints`,"overview.logged_at":`logged at {time}`,"overview.all_logged":`{count} × watered logged`,"overview.undo_row":`{name}: take back the entry`,"overview.log_row":`Log {name} as watered`,"tile.low":`{measure} low`,"tile.high":`{measure} high`,"tile.never":`never watered`,"editor.area_id":`Room`,"editor.show_tiles":`All plants as tiles`,"picker.overview.name":`Rootwise overview`,"picker.overview.description":`Which plants need water today, with one-tap ticks, and all plants as tiles.`,"picker.plant.name":`Rootwise plant`,"picker.plant.description":`One plant: status, moisture and climate ranges, watering with undo, history.`,"next.in":`Next watering {time}`,"next.in_rough":`Next watering roughly {time}`,"next.interval":`Next watering {time} (usual interval)`,"next.due":`Watering is due`,"next.window":`({from} – {to})`,"next.learning":`Rootwise is still learning: the forecast comes after a few days of readings`,"thresholds.learned_hint":`Learned from your watering: dry {low} %, wet {high} %`,"thresholds.apply":`Use them`,"thresholds.learned":`Thresholds learned from {count} waterings`,"history.detected":`detected`,"history.rise":`{before} → {after} %`,"history.reject":`That wasn't me`,"history.reject_confirm":`Not you?`,"tile.next":`Water {time}`,"toast.thresholds":`Learned thresholds in use`,"editor.title":`Title`,"editor.show_history":`Show history`},Ie={en:Fe,de:{"status.ok":`Alles gut`,"status.thirsty":`Braucht Wasser`,"status.too_wet":`Zu nass`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Noch nicht gegossen`,"level.dry":`Trocken`,"level.drying":`Bald gießen`,"level.ok":`Passt`,"level.fresh":`Nass, frisch gegossen`,"level.too_wet":`Zu nass`,"m.soil_moisture":`Bodenfeuchte`,"m.temperature":`Temperatur`,"m.air_humidity":`Luftfeuchte`,"m.illuminance":`Licht`,"m.conductivity":`Dünger`,"m.battery":`Batterie`,"care.watered":`Gegossen`,"care.fertilized":`Gedüngt`,"care.repotted":`Umgetopft`,"care.cleaned":`Blätter gereinigt`,"care.rotated":`Gedreht`,"care.pest_check":`Auf Schädlinge geprüft`,"care.pruned":`Geschnitten`,"care.sensor_moved":`Sensor umgesteckt`,"care.note":`Notiz`,"action.water":`Gegossen`,"action.undo":`Rückgängig`,"action.snooze":`+1 Tag`,"action.more":`Mehr`,"action.delete":`Löschen`,"action.cancel":`Abbrechen`,"action.save":`Speichern`,"when.title":`Wann hast du gegossen?`,"when.now":`Gerade eben`,"when.hours":`Vor ein paar Stunden`,"when.yesterday":`Gestern`,"when.pick":`Datum und Uhrzeit wählen`,"toast.logged":`{type} eingetragen`,"toast.deleted":`Eintrag gelöscht`,"toast.failed":`Hat nicht geklappt: {error}`,last_watered:`Gegossen {time}`,never_watered:`Noch kein Gießen eingetragen`,history:`Verlauf`,"history.empty":`Noch nichts eingetragen`,snoozed_until:`Pausiert bis {time}`,vacation:`Urlaubsmodus ist an`,"reason.below_threshold":`Bodenfeuchte {value} % unter {threshold} %`,"reason.too_wet":`Bodenfeuchte seit zwei Tagen über {threshold} % ({value} %)`,"reason.sensor_offline":`Keine Daten vom Bodensensor`,"reason.snoozed":`Pausiert`,"reason.just_watered":`Gerade gegossen`,"reason.interval_due":`Fällig nach {days} Tagen`,"reason.no_history":`Trag das erste Gießen ein, dann startet die Erinnerung`,"hint.temperature_low":`Zu kalt: {value} °C, mindestens {min} °C`,"hint.temperature_high":`Zu warm: {value} °C, höchstens {max} °C`,"hint.air_humidity_low":`Luft zu trocken: {value} %, mindestens {min} %`,"hint.air_humidity_high":`Luft zu feucht: {value} %, höchstens {max} %`,"hint.illuminance_low":`Zu dunkel: {value} lx, mindestens {min} lx`,"hint.illuminance_high":`Zu hell: {value} lx, höchstens {max} lx`,"hint.conductivity_low":`Wenig Dünger: {value} µS/cm, mindestens {min}`,"hint.conductivity_high":`Zu viel Dünger: {value} µS/cm, höchstens {max}`,"hint.battery_low":`Sensor-Batterie schwach: {value} %`,"overview.title":`Pflanzen`,"overview.today":`Heute gießen`,"overview.none":`Niemand hat Durst`,"overview.all_done":`Alle als gegossen eintragen`,"overview.empty":`Noch keine Pflanzen. Leg eine an unter Einstellungen → Geräte & Dienste → Rootwise.`,not_loaded:`Rootwise ist nicht geladen.`,unknown_plant:`Wähle in den Karteneinstellungen eine Pflanze.`,"target.range":`Ziel {min}–{max}`,"target.min":`mindestens {min}`,"target.max":`höchstens {max}`,no_value:`kein Wert`,"history.moisture":`{value} % Bodenfeuchte`,"delete.confirm":`Löschen?`,"toast.undone":`Rückgängig gemacht`,"more.other_time":`Zu anderer Zeit gegossen…`,"editor.device_id":`Pflanze`,"overview.due.one":`1 braucht heute Wasser`,"overview.due.other":`{count} brauchen heute Wasser`,"overview.hints.one":`1 Hinweis`,"overview.hints.other":`{count} Hinweise`,"overview.logged_at":`eingetragen um {time}`,"overview.all_logged":`{count} × Gegossen eingetragen`,"overview.undo_row":`{name}: Eintrag zurücknehmen`,"overview.log_row":`{name} als gegossen eintragen`,"tile.low":`{measure} zu niedrig`,"tile.high":`{measure} zu hoch`,"tile.never":`noch nie gegossen`,"editor.area_id":`Raum`,"editor.show_tiles":`Alle Pflanzen als Kacheln`,"picker.overview.name":`Rootwise Übersicht`,"picker.overview.description":`Welche Pflanzen heute Wasser brauchen, zum Abhaken, und alle Pflanzen als Kacheln.`,"picker.plant.name":`Rootwise Pflanze`,"picker.plant.description":`Eine Pflanze: Status, Feuchte und Klima mit Zielbereich, Gießen mit Rückgängig, Verlauf.`,"next.in":`Nächstes Gießen {time}`,"next.in_rough":`Nächstes Gießen ungefähr {time}`,"next.interval":`Nächstes Gießen {time} (übliches Intervall)`,"next.due":`Gießen ist fällig`,"next.window":`({from} – {to})`,"next.learning":`Rootwise lernt noch: die Prognose kommt nach ein paar Tagen Messwerten`,"thresholds.learned_hint":`Gelernt aus deinem Gießen: trocken {low} %, nass {high} %`,"thresholds.apply":`Übernehmen`,"thresholds.learned":`Schwellen gelernt aus {count}× Gießen`,"history.detected":`erkannt`,"history.rise":`{before} → {after} %`,"history.reject":`War ich nicht`,"history.reject_confirm":`Wirklich nicht?`,"tile.next":`Gießen {time}`,"toast.thresholds":`Gelernte Schwellen übernommen`,"editor.title":`Titel`,"editor.show_history":`Verlauf zeigen`}};function U(e){let t=(e?.locale?.language??e?.language??`en`).slice(0,2);return t in Ie?t:`en`}function W(e,t,n={}){let r=U(e);return(Ie[r]?.[t]??Fe[t]??t).replace(/\{(\w+)\}/g,(e,t)=>t in n?Re(n[t],r):e)}function Le(e,t,n){return W(e,`${t}.${new Intl.PluralRules(U(e)).select(n)===`one`?`one`:`other`}`,{count:n})}function Re(e,t){return typeof e==`number`?new Intl.NumberFormat(t,{maximumFractionDigits:1}).format(e):String(e)}var ze=864e5;function G(e,t,n){let r=new Date(e).getTime()-t.getTime(),i=new Intl.RelativeTimeFormat(n,{numeric:`auto`}),a=Math.abs(r);if(a<6e4)return i.format(0,`second`);if(a<36e5)return i.format(Math.round(r/6e4),`minute`);let o=Be(new Date(e),t);return o===0?i.format(Math.round(r/36e5),`hour`):Math.abs(o)<30?i.format(o,`day`):new Intl.DateTimeFormat(n,{dateStyle:`medium`}).format(new Date(e))}function Be(e,t){let n=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime();return Math.round((n(e)-n(t))/ze)}function Ve(e,t){return new Intl.DateTimeFormat(t,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function He(e,t,n){let r=+(e===`temperature`);return new Intl.NumberFormat(n,{maximumFractionDigits:r,minimumFractionDigits:r}).format(t)}var Ue=[`soil_moisture`,`air_humidity`,`battery`];function We(e,t,n,r){let i=e===`illuminance`?e=>Math.log10(Math.max(e,0)+1):e=>e,a,o;if(Ue.includes(e))a=0,o=100;else{let s=i(n??r??t??0),c=i(r??n??t??1),l=Math.max(c-s,e===`illuminance`?1:2);a=e===`illuminance`?0:s-l/4,o=c+l/4,t!==null&&(a=Math.min(a,i(t)),o=Math.max(o,i(t)))}let s=e=>Math.min(100,Math.max(0,(i(e)-a)/(o-a)*100));return{low:n===null?0:s(n),high:r===null?100:s(r),marker:t===null?null:s(t)}}var Ge=[`soil_moisture`,`temperature`,`air_humidity`,`illuminance`,`conductivity`];function Ke(e,t){if(t.device_id)return e.find(e=>e.device_id===t.device_id);if(t.plant_id)return e.find(e=>e.id===t.plant_id);if(t.plant){let n=t.plant.trim().toLocaleLowerCase();return e.find(e=>e.id===t.plant||e.name.toLocaleLowerCase()===n)}}var qe=/_(low|high)$/;function K(e){return qe.test(e.code)}function Je(e,t){let n=t.reasons.filter(e=>!K(e));if(t.status&&t.status!==`ok`){let t=n.find(e=>e.code!==`snoozed`);return t?W(e,`reason.${t.code}`,t):null}return t.snoozed_until?W(e,`snoozed_until`,{time:new Intl.DateTimeFormat(e.language,{weekday:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(t.snoozed_until))}):t.moisture_level?W(e,`level.${t.moisture_level}`):null}function Ye(e,t){return t.reasons.filter(K).map(t=>W(e,`hint.${t.code}`,t))}function Xe(e,t){if(e===`hours`)return new Date(t.getTime()-108e5);if(e===`yesterday`){let e=new Date(t);return e.setDate(e.getDate()-1),e.setHours(18,0,0,0),e}}function Ze(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}function Qe(e){return Object.values(e.entities??{}).find(e=>e.platform===`rootwise`&&e.entity_id.endsWith(`_status`)&&e.device_id)?.device_id}function $e(e,t,n){let r=t.next_watering;if(!r)return t.measurements.soil_moisture?{text:W(e,`next.learning`)}:null;if(new Date(r.due).getTime()<=n.getTime())return{text:W(e,`next.due`)};let i=U(e),a=G(r.due,n,i),o={text:W(e,r.method===`interval`?`next.interval`:r.confidence===`low`?`next.in_rough`:`next.in`,{time:a})};if(r.earliest&&r.latest){let t=e=>new Intl.DateTimeFormat(i,{weekday:`short`}).format(new Date(e)),n=t(r.earliest),a=t(r.latest);n!==a&&(o.window=W(e,`next.window`,{from:n,to:a}))}return o}var et=3;function tt(e,t){let n=t.thresholds;if(!n?.learned)return null;let[r,i]=n.learned;return n.source===`learned`?{text:W(e,`thresholds.learned`,{count:n.waterings}),canApply:!1}:n.source===`custom`&&(Math.abs(r-n.low)>=et||Math.abs(i-n.high)>=et)?{text:W(e,`thresholds.learned_hint`,{low:r,high:i}),canApply:!0}:null}function nt(e,t){let n=t.data??{};if(t.source===`auto`){let t=n.settled??n.peak,r=n.before!==void 0&&t!==void 0?W(e,`history.rise`,{before:Math.round(n.before),after:Math.round(t)}):``;return[W(e,`history.detected`),r].filter(Boolean).join(` · `)}return n.moisture===void 0?``:W(e,`history.moisture`,{value:n.moisture})}var rt={thirsty:0,too_wet:1,sensor_offline:2,no_history:3,ok:4};function it(e,t){return t?e.filter(e=>e.area_id===t):e}var at=(e,t)=>e.name.localeCompare(t.name);function q(e){return e.filter(e=>e.needs_water).sort(at)}function ot(e,t){return e.filter(e=>e.needs_water||t(e)).sort(at)}function st(e,t){let n=t.measurements.soil_moisture?.value,r=n==null?Je(e,t):`${He(`soil_moisture`,n,U(e))} %`;return[t.area,r].filter(Boolean).join(` · `)}function ct(e,t){let n=t.filter(e=>e.needs_water).length,r=t.filter(e=>e.reasons.some(K)).length,i=[n?Le(e,`overview.due`,n):W(e,`overview.none`)];return r&&i.push(Le(e,`overview.hints`,r)),i.join(` · `)}function lt(e,t,n){let r=t.status??`no_history`;if(r===`thirsty`)return{color:`var(--rw-warn)`,text:W(e,`status.thirsty`)};if(r===`too_wet`)return{color:`var(--rw-prob)`,text:W(e,`level.too_wet`)};if(r===`sensor_offline`)return{color:`var(--rw-text2)`,text:W(e,`status.sensor_offline`)};let i=t.reasons.find(K);if(i){let[,t,n]=/^(.*)_(low|high)$/.exec(i.code)??[],r=W(e,`m.${t}`);return{color:`var(--rw-warn)`,text:W(e,`tile.${n}`,{measure:r})}}let a=t.next_watering;return a&&new Date(a.due).getTime()>n.getTime()?{color:`var(--rw-accent)`,text:W(e,`tile.next`,{time:G(a.due,n,U(e))})}:t.moisture_level?{color:`var(--rw-accent)`,text:W(e,`level.${t.moisture_level}`)}:t.last_watered?{color:`var(--rw-accent)`,text:G(t.last_watered,n,U(e))}:{color:`var(--rw-text2)`,text:W(e,`tile.never`)}}function ut(e){return[...e].sort((e,t)=>(rt[e.status??`ok`]??9)-(rt[t.status??`ok`]??9)||Number(t.reasons.some(K))-Number(e.reasons.some(K))||e.name.localeCompare(t.name))}var dt=o`
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
`,ft={ok:`var(--rw-accent)`,thirsty:`var(--rw-warn)`,too_wet:`var(--rw-prob)`,sensor_offline:`var(--rw-text2)`,no_history:`var(--rw-text2)`},J={soil_moisture:`mdi:water-percent`,temperature:`mdi:thermometer`,air_humidity:`mdi:water-opacity`,illuminance:`mdi:white-balance-sunny`,conductivity:`mdi:sprout-outline`,battery:`mdi:battery-40`,watered:`mdi:watering-can`,fertilized:`mdi:bottle-tonic-plus`,repotted:`mdi:pot-mix`,cleaned:`mdi:leaf`,rotated:`mdi:rotate-3d-variant`,pest_check:`mdi:bug-check`,pruned:`mdi:content-cut`,sensor_moved:`mdi:cursor-move`,note:`mdi:note-text-outline`};function Y(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var X=class extends R{connectedCallback(){super.connectedCallback(),this.subscribe()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0}willUpdate(e){e.has(`hass`)&&(this.subscribe(),this.toggleAttribute(`dark`,!!this.hass?.themes?.darkMode))}subscribe(){let e=this.hass;e&&this.isConnected&&e.connection!==this.connection&&(this.unsubscribe?.(),this.connection=e.connection,this.unsubscribe=je(e,e=>{this.payload=e}))}t(e,t){return W(this.hass,e,t)}moreInfo(e){e&&this.dispatchEvent(new CustomEvent(`hass-more-info`,{detail:{entityId:e},bubbles:!0,composed:!0}))}};Y([Ae({attribute:!1})],X.prototype,`hass`,void 0),Y([z()],X.prototype,`payload`,void 0);function Z(e){return e&&typeof e==`object`&&`message`in e?String(e.message):String(e)}function pt(e){return W({language:document.documentElement.lang||`en`},`editor.${e.name}`)}var mt=36e5,ht=1e4,Q=class extends X{constructor(...e){super(...e),this.ticked=new Map,this.busy=new Set}static getConfigForm(){return{schema:[{name:`title`,selector:{text:{}}},{name:`area_id`,selector:{area:{}}},{name:`show_tiles`,selector:{boolean:{}}}],computeLabel:pt}}static getStubConfig(){return{show_tiles:!0}}setConfig(e){this.config={show_tiles:!0,...e}}getCardSize(){return 3+(this.payload?q(this.payload.plants).length:0)}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer)}async toggle(e){if(!this.hass||this.busy.has(e.id))return;this.busy=new Set(this.busy).add(e.id);let t=this.ticked.get(e.id);try{let n=new Map(this.ticked);t?(await H(this.hass,t.id),n.delete(e.id)):n.set(e.id,await V(this.hass,e.id,`watered`)),this.ticked=n}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Z(e)})})}finally{let t=new Set(this.busy);t.delete(e.id),this.busy=t}}async allDone(e){let t=this.hass;if(!t)return;let n=e.filter(e=>!this.ticked.has(e.id));try{let e=await Promise.all(n.map(e=>V(t,e.id,`watered`))),r=new Map(this.ticked);n.forEach((t,n)=>r.set(t.id,e[n])),this.ticked=r,this.showToast({text:this.t(`overview.all_logged`,{count:e.length}),undo:e})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Z(e)})})}}async undoAll(e){let t=this.hass;if(t)try{await Promise.all(e.map(e=>H(t,e.id)));let n=new Map(this.ticked);e.forEach(e=>n.delete(e.plant_id)),this.ticked=n,this.showToast({text:this.t(`toast.undone`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Z(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},ht)}render(){let e=this.hass;if(!this.payload||!e)return k`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return k`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let t=it(this.payload.plants,this.config?.area_id),n=q(t),r=Date.now(),i=ot(t,e=>{let t=this.ticked.get(e.id);return t!==void 0&&r-Date.parse(t.ts)<mt}),a=n.filter(e=>!this.ticked.has(e.id));return k`
      <ha-card>
        <div class="head">
          <span class="badge"><ha-icon icon="mdi:sprout"></ha-icon></span>
          <div class="titles">
            <div class="title">${this.config?.title||this.t(`overview.title`)}</div>
            <div class="muted small">${t.length?ct(e,t):``}</div>
          </div>
        </div>
        ${this.payload.vacation?k`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:j}
        ${t.length===0?k`<div class="empty muted">${this.t(`overview.empty`)}</div>`:j}
        ${i.length?k`<ul class="due" aria-label=${this.t(`overview.today`)}>
              ${i.map(e=>this.renderRow(e))}
            </ul>`:j}
        ${a.length>=2?k`<button class="all" @click=${()=>void this.allDone(a)}>
              <ha-icon icon="mdi:check-all"></ha-icon>${this.t(`overview.all_done`)}
            </button>`:j}
        ${this.toast?this.renderToast(this.toast):j}
        ${this.config?.show_tiles&&t.length?k`<div class="tiles">${ut(t).map(e=>this.renderTile(e))}</div>`:j}
      </ha-card>
    `}renderRow(e){let t=this.hass,n=this.ticked.get(e.id),r=n?this.t(`overview.logged_at`,{time:new Intl.DateTimeFormat(U(t),{hour:`2-digit`,minute:`2-digit`}).format(new Date(n.ts))}):t?st(t,e):``;return k`
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
        <div class="row-text" role="button" tabindex="0" @click=${()=>this.moreInfo(e.entity_ids.status)}>
          <span class="name">${e.name}</span>
          <span class="muted small">${r}</span>
        </div>
      </li>
    `}renderTile(e){let t=this.hass?lt(this.hass,e,new Date):{color:``,text:``};return k`
      <button class="tile" @click=${()=>this.moreInfo(e.entity_ids.status)}>
        <span class="tile-name"><span class="dot" style="background:${t.color}"></span>${e.name}</span>
        <span class="muted tiny">${t.text}</span>
      </button>
    `}renderToast(e){let t=e.undo;return k`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${t?k`<button class="link" @click=${()=>void this.undoAll(t)}>${this.t(`action.undo`)}</button>`:j}
      </div>
    `}static{this.styles=[dt,o`
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
    `]}};Y([z()],Q.prototype,`config`,void 0),Y([z()],Q.prototype,`ticked`,void 0),Y([z()],Q.prototype,`busy`,void 0),Y([z()],Q.prototype,`toast`,void 0),Q=Y([De(`rootwise-overview-card`)],Q);var gt=10,_t=500,$=class extends X{constructor(...e){super(...e),this.panel=`none`,this.pickTime=``,this.busy=!1,this.longPressed=!1}static getConfigForm(){return{schema:[{name:`device_id`,required:!0,selector:{device:{filter:[{integration:`rootwise`}]}}},{name:`show_history`,selector:{boolean:{}}}],computeLabel:pt}}static getStubConfig(e){return{device_id:Qe(e),show_history:!0}}setConfig(e){this.config={show_history:!0,...e}}getCardSize(){return this.config?.show_history?8:5}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer),window.clearTimeout(this.confirmTimer)}get plant(){return this.payload&&this.config?Ke(this.payload.plants,this.config):void 0}async log(e,t){let n=this.plant;if(n&&this.hass&&!this.busy){this.busy=!0,this.panel=`none`;try{let r=await V(this.hass,n.id,e,t);this.showToast({text:this.t(`toast.logged`,{type:this.t(`care.${e}`)}),undo:r})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Z(e)})})}finally{this.busy=!1}}}async deleteEntry(e,t){if(this.hass)try{await H(this.hass,e.id),this.showToast({text:t})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Z(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},gt*1e3)}undo(){let e=this.toast?.undo;e&&this.deleteEntry(e,this.t(`toast.undone`))}pressStart(){this.longPressed=!1,window.clearTimeout(this.pressTimer),this.pressTimer=window.setTimeout(()=>{this.longPressed=!0,this.openWhen()},_t)}pressEnd(){window.clearTimeout(this.pressTimer)}waterClick(){if(this.longPressed){this.longPressed=!1;return}this.log(`watered`)}openWhen(){this.pickTime=``,this.panel=`when`}chooseWhen(e){this.log(`watered`,Xe(e,new Date))}savePicked(){this.pickTime&&this.log(`watered`,new Date(this.pickTime))}askDelete(e){if(this.confirmDelete===e.id){this.confirmDelete=void 0,this.deleteEntry(e,this.t(`toast.deleted`));return}this.confirmDelete=e.id,window.clearTimeout(this.confirmTimer),this.confirmTimer=window.setTimeout(()=>{this.confirmDelete=void 0},4e3)}render(){if(!this.payload)return k`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return k`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let e=this.plant;if(!e)return k`<ha-card><div class="empty muted">${this.t(`unknown_plant`)}</div></ha-card>`;let t=this.hass?Je(this.hass,e):null,n=this.hass?Ye(this.hass,e):[],r=Ge.filter(t=>e.measurements[t]);return k`
      <ha-card>
        ${this.payload.vacation?k`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:j}
        ${this.renderHead(e)}
        ${t?k`<div class="detail">${t}</div>`:j}
        ${r.length?k`<div class="bars">
              ${r.map(t=>this.renderBar(t,e.measurements[t]))}
            </div>`:j}
        ${n.length?k`<ul class="hints">
              ${n.map(e=>k`<li><ha-icon icon="mdi:information-outline"></ha-icon>${e}</li>`)}
            </ul>`:j}
        ${this.renderLearned(e)}
        <div class="when-block">
          ${this.renderNext(e)}
          <div class="last muted">${this.lastWatered(e)}</div>
        </div>
        ${this.renderActions(e)} ${this.panel===`when`?this.renderWhen():j}
        ${this.panel===`more`?this.renderMore():j}
        ${this.toast?this.renderToast(this.toast):j}
        ${this.config?.show_history?this.renderHistory(e):j}
      </ha-card>
    `}renderHead(e){let t=e.status??`no_history`,n=[e.species.common,e.species.scientific].filter(Boolean).filter((e,t,n)=>n.indexOf(e)===t);return k`
      <div
        class="head"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(e.entity_ids.status)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&this.moreInfo(e.entity_ids.status)}}
      >
        <div class="avatar">
          ${e.species.image_url?k`<img
                src=${e.species.image_url}
                alt=""
                loading="lazy"
                @error=${e=>e.target.hidden=!0}
              />`:j}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="titles">
          <div class="name">${e.name}</div>
          <div class="status">
            <span class="dot" style="background:${ft[t]}"></span>
            <span>${this.t(`status.${t}`)}${e.area?` · ${e.area}`:``}</span>
          </div>
          ${n.length?k`<div class="species muted">${n.join(` · `)}</div>`:j}
        </div>
      </div>
    `}renderBar(e,t){let n=U(this.hass),r=We(e,t.value,t.min,t.max),i=t.unit??``,a=t.value===null?`–`:`${He(e,t.value,n)}${i?` ${i}`:``}`,o=t.rating===`low`||t.rating===`high`||t.level===`dry`||t.level===`too_wet`,s=t.min!==null&&t.max!==null?this.t(`target.range`,{min:t.min,max:t.max}):t.min===null?t.max===null?``:this.t(`target.max`,{max:t.max}):this.t(`target.min`,{min:t.min}),c=this.t(`m.${e}`),l=`${c} ${t.value===null?this.t(`no_value`):a}${s?`, ${s}`:``}`;return k`
      <div
        class="bar-row ${o?`off`:``}"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(this.plant?.entity_ids[e])}
      >
        <ha-icon icon=${J[e]??`mdi:gauge`}></ha-icon>
        <span class="label">${c}</span>
        <div class="bar" role="img" aria-label=${l}>
          <div class="zone" style="left:${r.low}%;width:${Math.max(r.high-r.low,0)}%"></div>
          ${e===`soil_moisture`&&r.marker!==null?k`<div class="fill" style="width:${r.marker}%"></div>`:j}
          ${t.min===null?j:k`<div class="tick" style="left:${r.low}%"></div>`}
          ${t.max===null?j:k`<div class="tick" style="left:${r.high}%"></div>`}
          ${r.marker===null?j:k`<div class="marker" style="left:${r.marker}%"></div>`}
        </div>
        <span class="value num">${a}</span>
      </div>
    `}renderNext(e){let t=this.hass?$e(this.hass,e,new Date):null;return t?k`<div class="next">
      <ha-icon icon="mdi:calendar-clock"></ha-icon>
      <span>${t.text}${t.window?k` <span class="muted">${t.window}</span>`:j}</span>
    </div>`:j}renderLearned(e){let t=this.hass?tt(this.hass,e):null;return t?k`<div class="learned muted">
      <ha-icon icon="mdi:school-outline"></ha-icon>
      <span>${t.text}</span>
      ${t.canApply?k`<button class="link" @click=${()=>void this.applyLearned(e)}>
            ${this.t(`thresholds.apply`)}
          </button>`:j}
    </div>`:j}async applyLearned(e){if(this.hass)try{await Ne(this.hass,e.id),this.showToast({text:this.t(`toast.thresholds`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Z(e)})})}}lastWatered(e){return e.last_watered?this.t(`last_watered`,{time:G(e.last_watered,new Date,U(this.hass))}):this.t(`never_watered`)}renderActions(e){let t=e.entity_ids.snooze,n=this.toast?.undo?.type===`watered`;return k`
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
        ${e.needs_water&&t?k`<button class="secondary" @click=${()=>this.hass&&void Me(this.hass,t)}>
              ${this.t(`action.snooze`)}
            </button>`:j}
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
    `}renderWhen(){let e=Ze(new Date);return k`
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
            <ha-icon icon=${J[e]??`mdi:plus`}></ha-icon>${this.t(`care.${e}`)}
          </button>`)}
      </div>
    `}renderToast(e){return k`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${e.undo?k`<button class="link" @click=${this.undo}>${this.t(`action.undo`)}</button>`:j}
      </div>
    `}renderHistory(e){let t=U(this.hass);return k`
      <div class="history">
        <div class="section">${this.t(`history`)}</div>
        ${e.recent.length===0?k`<div class="muted small">${this.t(`history.empty`)}</div>`:k`<ul>
              ${e.recent.map(e=>{let n=this.hass?nt(this.hass,e):``,r=this.hass?Pe(this.hass,e):!1,i=this.confirmDelete===e.id,a=e.source===`auto`;return k`<li class=${a?`detected`:``}>
                  <ha-icon icon=${J[e.type]??`mdi:circle-small`}></ha-icon>
                  <div class="entry">
                    <span>${this.t(`care.${e.type}`)}</span>
                    <span class="muted small">
                      ${Ve(e.ts,t)}${n?` · ${n}`:``}
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
                      </button>`:j}
                </li>`})}
            </ul>`}
      </div>
    `}static{this.styles=[dt,o`
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
    `]}};Y([z()],$.prototype,`config`,void 0),Y([z()],$.prototype,`panel`,void 0),Y([z()],$.prototype,`pickTime`,void 0),Y([z()],$.prototype,`toast`,void 0),Y([z()],$.prototype,`confirmDelete`,void 0),Y([z()],$.prototype,`busy`,void 0),$=Y([De(`rootwise-plant-card`)],$);var vt={language:document.documentElement.lang||navigator.language};window.customCards=window.customCards??[];for(let e of[`overview`,`plant`])window.customCards.push({type:`rootwise-${e}-card`,name:W(vt,`picker.${e}.name`),description:W(vt,`picker.${e}.description`),preview:!0,documentationURL:`https://github.com/michi-walchsi/ha-rootwise`});console.info(`%c ROOTWISE-CARDS %c 0.2.1 `,`background:#2e7d32;color:#fff`,``);