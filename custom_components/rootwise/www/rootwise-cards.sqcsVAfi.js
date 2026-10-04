var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,ee=g?g.emptyScript:``,te=h.reactiveElementPolyfillSupport,_=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?ee:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ne=(e,t)=>!l(e,t),re={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=new WeakMap;var y=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=re){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??re}static _$Ei(){if(this.hasOwnProperty(_(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?v:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?v:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ne)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};y.elementStyles=[],y.shadowRootOptions={mode:`open`},y[_(`elementProperties`)]=new Map,y[_(`finalized`)]=new Map,te?.({ReactiveElement:y}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var ie=globalThis,ae=e=>e,b=ie.trustedTypes,oe=b?b.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,C=()=>S.createComment(``),w=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ue=Array.isArray,de=e=>ue(e)||typeof e?.[Symbol.iterator]==`function`,fe=`[ 	
\f\r]`,pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,he=/>/g,T=RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ge=/'/g,_e=/"/g,ve=/^(?:script|style|textarea|title)$/i,ye=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),E=ye(1),D=ye(2),O=Symbol.for(`lit-noChange`),k=Symbol.for(`lit-nothing`),be=new WeakMap,A=S.createTreeWalker(S,129);function xe(e,t){if(!ue(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return oe===void 0?t:oe.createHTML(t)}var Se=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=pe;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===pe?c[1]===`!--`?o=me:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=T):(ve.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=T):o=he:o===T?c[0]===`>`?(o=i??pe,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?T:c[3]===`"`?_e:ge):o===_e||o===ge?o=T:o===me||o===he?o=pe:(o=T,i=void 0);let d=o===T&&e[t+1].startsWith(`/>`)?` `:``;a+=o===pe?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[xe(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ce=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Se(t,n);if(this.el=e.createElement(l,r),A.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=A.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?De:r[1]===`?`?Oe:r[1]===`@`?ke:Ee}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ve.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=b?b.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],C()),A.nextNode(),c.push({type:2,index:++a});i.append(e[t],C())}}}else if(i.nodeType===8){if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function j(e,t,n=e,r){if(t===O)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=w(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=j(e,i._$AS(e,t.values),i,r)),t}var we=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);A.currentNode=r;let i=A.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Te(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ae(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=A.nextNode(),a++)}return A.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Te=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=k,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=j(this,e,t),w(e)?e===k||e==null||e===``?(this._$AH!==k&&this._$AR(),this._$AH=k):e!==this._$AH&&e!==O&&this._(e):e._$litType$===void 0?e.nodeType===void 0?de(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==k&&w(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ce.createElement(xe(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new we(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=be.get(e.strings);return t===void 0&&be.set(e.strings,t=new Ce(e)),t}k(t){ue(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(C()),this.O(C()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ae(e).nextSibling;ae(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ee=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=k,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=k}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=j(this,e,t,0),a=!w(e)||e!==this._$AH&&e!==O,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=j(this,r[n+o],t,o),s===O&&(s=this._$AH[o]),a||=!w(s)||s!==this._$AH[o],s===k?e=k:e!==k&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===k?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},De=class extends Ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===k?void 0:e}},Oe=class extends Ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==k)}},ke=class extends Ee{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=j(this,e,t,0)??k)===O)return;let n=this._$AH,r=e===k&&n!==k||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==k&&(n===k||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ae=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){j(this,e)}},je={M:se,P:x,A:ce,C:1,L:Se,R:we,D:de,V:j,I:Te,H:Ee,N:Oe,U:ke,B:De,F:Ae},Me=ie.litHtmlPolyfillSupport;Me?.(Ce,Te),(ie.litHtmlVersions??=[]).push(`3.3.3`);var Ne=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Te(t.insertBefore(C(),e),e,void 0,n??{})}return i._$AI(e),i},Pe=globalThis,M=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ne(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};M._$litElement$=!0,M.finalized=!0,Pe.litElementHydrateSupport?.({LitElement:M});var Fe=Pe.litElementPolyfillSupport;Fe?.({LitElement:M}),(Pe.litElementVersions??=[]).push(`4.2.2`);var Ie={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:ne},Le=(e=Ie,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function N(e){return(t,n)=>typeof n==`object`?Le(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function P(e){return N({...e,state:!0,attribute:!1})}var Re=(e,t,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof t!=`object`&&Object.defineProperty(e,t,n),n);function ze(e,t){return(n,r,i)=>{let a=t=>t.renderRoot?.querySelector(e)??null;if(t){let{get:e,set:t}=typeof r==`object`?n:i??(()=>{let e=Symbol();return{get(){return this[e]},set(t){this[e]=t}}})();return Re(n,r,{get(){let n=e.call(this);return n===void 0&&(n=a(this),(n!==null||this.hasUpdated)&&t.call(this,n)),n}})}return Re(n,r,{get(){return a(this)}})}}var Be=new WeakMap;function Ve(e,t){let n=e.connection,r=Be.get(n);if(!r){let e={listeners:new Set};e.unsubscribe=n.subscribeMessage(t=>{e.last=t,e.listeners.forEach(e=>e(t))},{type:`rootwise/plants/subscribe`}),Be.set(n,e),r=e}let i=r;return i.listeners.add(t),i.last&&t(i.last),()=>{i.listeners.delete(t),i.listeners.size===0&&(Be.delete(n),i.unsubscribe?.then(e=>e()).catch(()=>void 0))}}async function He(e,t,n,r){let i={type:`rootwise/care/log`,plant_id:t,care_type:n};return r&&(i.when=r.toISOString()),(await e.callWS(i)).entry}async function Ue(e,t){await e.callWS({type:`rootwise/care/delete`,entry_id:t})}async function We(e,t){await e.callWS({type:`call_service`,domain:`button`,service:`press`,target:{entity_id:t}})}async function Ge(e,t){await e.callWS({type:`rootwise/thresholds/reset`,plant_id:t})}function Ke(e,t){let n=e.user;return n?n.is_admin||t.source===`auto`?!0:t.user_id!==void 0&&t.user_id===n.id:!1}function qe(e,t,n){return e.callWS({type:`rootwise/plant/history`,plant_id:t,days:n})}function Je(e,t,n){return e.callWS({type:`rootwise/calibration/${n}`,plant_id:t})}function Ye(e,t,n,r){return e.callWS({type:`rootwise/calibration/apply`,plant_id:t,dry:n,wet:r})}async function Xe(e,t){return(await e.callWS({type:`rootwise/plants/create`,...t})).plant_id}function Ze(e,t){return e.callWS({type:`rootwise/species/search`,query:t})}function Qe(e,t){return e.callWS({type:`rootwise/species/info`,pid:t})}function $e(e,t,n){let r={type:`rootwise/sensors/suggest`};return t&&(r.area_id=t),n&&(r.moisture_sensor=n),e.callWS(r)}var et={"status.ok":`All good`,"status.thirsty":`Needs water`,"status.too_wet":`Too wet`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Not watered yet`,"level.dry":`Dry`,"level.drying":`Water soon`,"level.ok":`Just right`,"level.fresh":`Wet, freshly watered`,"level.too_wet":`Too wet`,"m.soil_moisture":`Soil moisture`,"m.temperature":`Temperature`,"m.air_humidity":`Air humidity`,"m.illuminance":`Light`,"m.conductivity":`Fertilizer`,"m.battery":`Battery`,"care.watered":`Watered`,"care.fertilized":`Fertilized`,"care.repotted":`Repotted`,"care.cleaned":`Leaves cleaned`,"care.rotated":`Rotated`,"care.pest_check":`Checked for pests`,"care.pruned":`Pruned`,"care.sensor_moved":`Sensor moved`,"care.note":`Note`,"action.water":`Watered`,"action.undo":`Undo`,"action.snooze":`+1 day`,"action.more":`More`,"action.delete":`Delete`,"action.cancel":`Cancel`,"action.save":`Save`,"when.title":`When did you water?`,"when.now":`Just now`,"when.hours":`A few hours ago`,"when.yesterday":`Yesterday`,"when.pick":`Pick date and time`,"toast.logged":`{type} logged`,"toast.deleted":`Entry deleted`,"toast.failed":`That didn't work: {error}`,last_watered:`Watered {time}`,never_watered:`No watering logged yet`,history:`History`,"history.empty":`Nothing logged yet`,snoozed_until:`Snoozed until {time}`,vacation:`Vacation mode is on`,"reason.below_threshold":`Soil moisture {value} % is below {threshold} %`,"reason.too_wet":`Soil moisture {value} % above {threshold} % for two days`,"reason.sensor_offline":`No data from the soil sensor`,"reason.snoozed":`Snoozed`,"reason.just_watered":`Just watered`,"reason.interval_due":`Due after {days} days`,"reason.no_history":`Log the first watering to start the reminder`,"hint.temperature_low":`Too cold: {value} °C, at least {min} °C`,"hint.temperature_high":`Too warm: {value} °C, at most {max} °C`,"hint.air_humidity_low":`Air too dry: {value} %, at least {min} %`,"hint.air_humidity_high":`Air too humid: {value} %, at most {max} %`,"hint.illuminance_low":`Too dark: {value} lx, at least {min} lx`,"hint.illuminance_high":`Too bright: {value} lx, at most {max} lx`,"hint.conductivity_low":`Little fertilizer: {value} µS/cm, at least {min}`,"hint.conductivity_high":`Too much fertilizer: {value} µS/cm, at most {max}`,"hint.battery_low":`Sensor battery low: {value} %`,"overview.title":`Plants`,"overview.today":`Water today`,"overview.none":`Nobody is thirsty`,"overview.all_done":`Mark all as watered`,"overview.empty":`No plants yet. Add one under Settings → Devices & services → Rootwise.`,not_loaded:`Rootwise is not loaded.`,unknown_plant:`Pick a plant in the card settings.`,"target.range":`target {min}–{max}`,"target.min":`at least {min}`,"target.max":`at most {max}`,no_value:`no value`,"history.moisture":`{value} % soil moisture`,"delete.confirm":`Delete?`,"toast.undone":`Undone`,"more.other_time":`Watered at another time…`,"editor.device_id":`Plant`,"overview.due.one":`1 needs water today`,"overview.due.other":`{count} need water today`,"overview.hints.one":`1 hint`,"overview.hints.other":`{count} hints`,"overview.logged_at":`logged at {time}`,"overview.all_logged":`{count} × watered logged`,"overview.undo_row":`{name}: take back the entry`,"overview.log_row":`Log {name} as watered`,"tile.low":`{measure} low`,"tile.high":`{measure} high`,"tile.never":`never watered`,"editor.area_id":`Room`,"editor.show_tiles":`All plants as tiles`,"picker.overview.name":`Rootwise overview`,"picker.overview.description":`Which plants need water today, with one-tap ticks, and all plants as tiles.`,"picker.plant.name":`Rootwise plant`,"picker.plant.description":`One plant: status, moisture and climate ranges, watering with undo, history.`,"next.in":`Next watering {time}`,"next.in_rough":`Next watering roughly {time}`,"next.interval":`Next watering {time} (usual interval)`,"next.due":`Watering is due`,"next.window":`({from} – {to})`,"next.learning":`Rootwise is still learning: the forecast comes after a few days of readings`,"thresholds.learned_hint":`Learned from your watering: dry {low} %, wet {high} %`,"thresholds.apply":`Use them`,"thresholds.learned":`Thresholds learned from {count} waterings`,"history.detected":`detected`,"history.rise":`{before} → {after} %`,"history.reject":`That wasn't me`,"history.reject_confirm":`Not you?`,"tile.next":`Water {time}`,"toast.thresholds":`Learned thresholds in use`,"editor.title":`Title`,"editor.show_history":`Show history`,"chart.empty":`No readings yet`,"chart.no_sensor":`No soil sensor`,"chart.point":`{value} % ({min}–{max})`,"chart.summary":`Soil moisture over the last {days} days: now {value} %, target {low}–{high} %, watered {count} times`,"chart.summary_plain":`Soil moisture over the last {days} days: now {value} %`,"panel.title":`Plants`,"panel.back":`Back`,"panel.menu":`Menu`,"panel.settings":`Plant settings`,"panel.all":`All`,"panel.rooms":`Rooms`,"chart.forecast":`Forecast`,"chart.target":`Target {low}–{high} %`,"panel.unknown":`This plant doesn't exist (any more).`,"panel.days":`{days} days`,"section.moisture":`Soil moisture`,"section.species":`Species`,"section.pot":`Pot and watering`,"amount.range":`about {from}–{to} {unit}`,"amount.one":`about {value} {unit}`,"amount.per_watering":`{amount} per watering`,"pot.plastic":`Plastic`,"pot.terracotta":`Terracotta`,"pot.ceramic_glazed":`Glazed ceramic`,"pot.self_watering":`Self-watering`,"pot.no_drainage":`no drainage hole`,"window.n":`North window`,"window.ne":`North-east window`,"window.e":`East window`,"window.se":`South-east window`,"window.s":`South window`,"window.sw":`South-west window`,"window.w":`West window`,"window.nw":`North-west window`,"how.drainage":`Water thoroughly until it runs out at the bottom. Empty the saucer after 15 minutes.`,"how.no_drainage":`No drainage hole: give just this amount, don't water until it runs out.`,"how.self_watering":`Self-watering pot: check the water level and refill the reservoir.`,"range.both":`{min}–{max} {unit}`,"range.min":`from {min} {unit}`,"range.max":`up to {max} {unit}`,"species.watering":`Watering`,"species.light":`Light`,"species.temperature":`Temperature`,"species.humidity":`Air humidity`,"species.fertilize":`Fertilizing`,"species.toxicity":`Toxicity`,"style.dry_out":`Let it dry out almost completely, then water thoroughly`,"style.mostly_dry":`Let the top 3–5 cm dry, then water thoroughly`,"style.slightly_dry":`Let the surface dry`,"style.evenly_moist":`Keep evenly moist, never let it dry out`,"light.dli":`{min}–{max} mol/m² a day`,"fertilize.one":`March to September every week`,"fertilize.other":`March to September every {count} weeks`,"tox.cats":`Cats`,"tox.dogs":`Dogs`,"tox.humans":`Children`,"tox.none":`non-toxic`,"tox.mild":`irritant`,"tox.moderate":`toxic`,"tox.severe":`highly toxic`,"tox.unknown":`unknown`,"tox.note.calcium_oxalate":`Contains calcium oxalate.`,"tox.source.aspca":`Guidance from the ASPCA.`,"tox.source.other":`Guidance from the literature.`,"tox.emergency":`In an emergency call poison control or a vet.`,"care.photo":`Photo`,"section.photos":`Photos`,"photo.add":`Add photo`,"photo.add_short":`Photo`,"photo.camera":`Camera`,"photo.gallery":`Gallery`,"photo.shoot":`Take photo`,"photo.retake":`Retake`,"photo.save":`Save`,"photo.use":`Use it`,"photo.saving":`Saving …`,"photo.note":`Note (optional)`,"photo.close":`Close`,"photo.prev":`Previous photo`,"photo.next":`Next photo`,"photo.https_hint":`The live camera needs Home Assistant's HTTPS address. Take the photo with your camera app and pick it from the gallery.`,"photo.chrome":`Open in Chrome`,"photo.heic":`This photo is HEIC, which the browser can't read. Set the camera to “Most compatible” (JPEG) or pick another photo.`,"photo.camera_denied":`No access to the camera. Allow it in the settings, or use the gallery.`,"photo.failed":`Photo not saved: {error}`,"photo.empty":`No photos yet. One a month shows how the plant grows.`,"photo.cover":`Use as cover`,"photo.is_cover":`Cover`,"photo.cover_set":`Cover photo set`,"photo.delete":`Delete`,"photo.delete_confirm":`Really delete?`,"photo.cover_caption":`Cover photo · {date}`,"calibration.title":`Calibrate sensor`,"calibration.headline":`Two points, an honest scale`,"calibration.intro":`The sensor measures raw values, different in every pot and soil. After calibrating, 0 % means really dry and 100 % freshly watered.`,"calibration.raw":`raw`,"calibration.dry":`dry`,"calibration.wet":`wet`,"calibration.now":`now`,"calibration.raw_value":`{value} % raw`,"calibration.raw_line":`raw {value} % · calibrated`,"calibration.step":`Point {n} of 2`,"calibration.dry_title":`The soil is really dry now`,"calibration.dry_text":`Only save when the soil is dry 5 cm deep, too. The sensor shows {value} % raw right now.`,"calibration.dry_text_none":`The sensor has no value right now.`,"calibration.dry_save":`Save as “dry”`,"calibration.dry_done":`dry = {value} % raw`,"calibration.again":`Measure again`,"calibration.wet_title":`Now water thoroughly`,"calibration.wet_text":`Water until it runs out at the bottom. Rootwise then measures the field capacity: the level the soil keeps once it has drained.`,"calibration.wet_start":`I have watered`,"calibration.draining":`Draining; the measurement starts at {time}.`,"calibration.measuring":`Measuring: {hours} of 4 hours · now {value} % raw`,"calibration.wet_done":`wet = {value} % raw`,"calibration.no_rise":`The sensor barely reacted. Water more thoroughly, until it runs out at the bottom, and start again.`,"calibration.too_close":`Dry and wet are too close together. Measure “dry” when the soil is really dry.`,"calibration.done":`Calibrated`,"calibration.result_dry":`dry (0 %)`,"calibration.result_wet":`wet (100 %)`,"calibration.thresholds":`Water below {low} % · too wet above {high} %`,"calibration.style":`Thresholds from the species' watering style: {style}. You can change them any time.`,"calibration.style_unknown":`unknown, a middle value`,"calibration.custom":`Your own thresholds ({low}–{high} % raw) still apply.`,"calibration.use_style":`Use the species' thresholds`,"calibration.redo":`Calibrate again`,"calibration.outdated":`The sensor was moved or the plant repotted since calibrating. Calibrate again so the scale fits.`,"calibration.suggestion":`Suggestion from your data`,"calibration.suggestion_text":`Learned from {count} watering cycles: dry ≈ {dry}, wet ≈ {wet} % raw. Use it?`,"calibration.suggestion_note":`Never applied by itself. A new sensor or repotting starts over.`,"calibration.apply":`Use it`,"calibration.later":`Later`,"calibration.section":`Calibration`,"calibration.section_none":`Not calibrated yet. With two readings Rootwise shows an honest scale from 0 to 100 %.`,"calibration.section_done":`Calibrated: dry {dry}, wet {wet} % raw`,"calibration.start":`Calibrate`,"calibration.open":`Open`,"calibration.error.no_sensor":`This plant has no soil sensor.`,"calibration.error.no_value":`The sensor has no value right now.`,"calibration.error.too_close":`Dry and wet are too close together.`,"calibration.error.unauthorized":`Only admins can calibrate.`,"panel.add":`Plant`,"wizard.title":`Add plant`,"wizard.step":`Step {n} of 6`,"wizard.steps.photo":`Photo`,"wizard.steps.species":`Species`,"wizard.steps.basics":`Name and room`,"wizard.steps.sensors":`Sensors`,"wizard.steps.pot":`Pot`,"wizard.steps.done":`Done`,"wizard.photo_title":`Take a photo of the plant`,"wizard.photo_text":`It becomes the cover photo. It is shrunk and stored without location data.`,"wizard.photo_take":`Take or pick a photo`,"wizard.photo_done":`Photo ready · at most 1600 px · no GPS`,"wizard.photo_change":`Other photo`,"wizard.species_title":`Which species is it?`,"wizard.species_search":`Search a species, e.g. Monstera`,"wizard.species_hint":`Without a species Rootwise starts with middle values and learns from your watering.`,"wizard.species_none":`Nothing found.`,"wizard.species_opb_failed":`OpenPlantbook doesn't answer right now; the offline list works.`,"wizard.species_chosen":`Chosen: {name}`,"wizard.offline":`offline list`,"wizard.name":`Name`,"wizard.room":`Room`,"wizard.no_room":`No room`,"wizard.sensors_in":`Sensors · {room}`,"wizard.sensors_text":`Suggested by room and kind of reading. Devices not used yet come first.`,"wizard.sensor_none":`– none –`,"wizard.in_use":`used by another plant`,"wizard.no_light":`Light: no sensor. Add one later; Rootwise doesn't make up values.`,"wizard.diameter":`Diameter`,"wizard.size.s":`S · up to 12 cm`,"wizard.size.m":`M · 13–20 cm`,"wizard.size.l":`L · 21–28 cm`,"wizard.size.xl":`XL · over 28 cm`,"wizard.diameter_exact":`Exactly (cm)`,"wizard.material":`Material`,"wizard.place":`Window and place`,"wizard.window":`Window`,"wizard.location":`Place`,"wizard.drainage":`Drainage hole in the pot`,"window.none":`No window`,"location.indoor":`Indoors`,"location.balcony":`Balcony`,"location.outdoor":`Outdoors`,"wizard.done_title":`{name} is added`,"wizard.done_time":`In {seconds} seconds.`,"wizard.done_waterings.one":`In the last 60 days of your sensor Rootwise found {count} watering. The forecast starts now.`,"wizard.done_waterings.other":`In the last 60 days of your sensor Rootwise found {count} waterings. The forecast starts now.`,"wizard.done_reading":`Rootwise is reading the last 60 days of your sensor …`,"wizard.calibrate_wet":`Just watered? Calibrate as “wet”`,"wizard.open":`Open plant`,"wizard.back":`Back`,"wizard.skip":`Skip`,"wizard.next":`Next`,"wizard.create":`Add`,"wizard.creating":`Adding …`,"wizard.photo_upload_failed":`The photo couldn't be uploaded; add it on the plant's page.`,"wizard.sensors.one":`{count} sensor`,"wizard.sensors.other":`{count} sensors`,"wizard.no_sensors":`no sensor`,"wizard.pot":`pot {diameter} cm`,"wizard.error.name_missing":`Give the plant a name.`,"wizard.error.sensor_in_use":`This soil sensor already belongs to another plant.`,"wizard.error.unknown_species":`This species is not in the list.`,"wizard.error.unknown_area":`This room doesn't exist (any more).`,"wizard.error.unknown_sensor":`One of the sensors doesn't exist (any more).`,"wizard.error.opb_failed":`OpenPlantbook doesn't answer right now. Pick the species from the offline list or skip it.`,"wizard.error.unauthorized":`Only admins can add plants.`},tt={en:et,de:{"status.ok":`Alles gut`,"status.thirsty":`Braucht Wasser`,"status.too_wet":`Zu nass`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Noch nicht gegossen`,"level.dry":`Trocken`,"level.drying":`Bald gießen`,"level.ok":`Passt`,"level.fresh":`Nass, frisch gegossen`,"level.too_wet":`Zu nass`,"m.soil_moisture":`Bodenfeuchte`,"m.temperature":`Temperatur`,"m.air_humidity":`Luftfeuchte`,"m.illuminance":`Licht`,"m.conductivity":`Dünger`,"m.battery":`Batterie`,"care.watered":`Gegossen`,"care.fertilized":`Gedüngt`,"care.repotted":`Umgetopft`,"care.cleaned":`Blätter gereinigt`,"care.rotated":`Gedreht`,"care.pest_check":`Auf Schädlinge geprüft`,"care.pruned":`Geschnitten`,"care.sensor_moved":`Sensor umgesteckt`,"care.note":`Notiz`,"action.water":`Gegossen`,"action.undo":`Rückgängig`,"action.snooze":`+1 Tag`,"action.more":`Mehr`,"action.delete":`Löschen`,"action.cancel":`Abbrechen`,"action.save":`Speichern`,"when.title":`Wann hast du gegossen?`,"when.now":`Gerade eben`,"when.hours":`Vor ein paar Stunden`,"when.yesterday":`Gestern`,"when.pick":`Datum und Uhrzeit wählen`,"toast.logged":`{type} eingetragen`,"toast.deleted":`Eintrag gelöscht`,"toast.failed":`Hat nicht geklappt: {error}`,last_watered:`Gegossen {time}`,never_watered:`Noch kein Gießen eingetragen`,history:`Verlauf`,"history.empty":`Noch nichts eingetragen`,snoozed_until:`Pausiert bis {time}`,vacation:`Urlaubsmodus ist an`,"reason.below_threshold":`Bodenfeuchte {value} % unter {threshold} %`,"reason.too_wet":`Bodenfeuchte seit zwei Tagen über {threshold} % ({value} %)`,"reason.sensor_offline":`Keine Daten vom Bodensensor`,"reason.snoozed":`Pausiert`,"reason.just_watered":`Gerade gegossen`,"reason.interval_due":`Fällig nach {days} Tagen`,"reason.no_history":`Trag das erste Gießen ein, dann startet die Erinnerung`,"hint.temperature_low":`Zu kalt: {value} °C, mindestens {min} °C`,"hint.temperature_high":`Zu warm: {value} °C, höchstens {max} °C`,"hint.air_humidity_low":`Luft zu trocken: {value} %, mindestens {min} %`,"hint.air_humidity_high":`Luft zu feucht: {value} %, höchstens {max} %`,"hint.illuminance_low":`Zu dunkel: {value} lx, mindestens {min} lx`,"hint.illuminance_high":`Zu hell: {value} lx, höchstens {max} lx`,"hint.conductivity_low":`Wenig Dünger: {value} µS/cm, mindestens {min}`,"hint.conductivity_high":`Zu viel Dünger: {value} µS/cm, höchstens {max}`,"hint.battery_low":`Sensor-Batterie schwach: {value} %`,"overview.title":`Pflanzen`,"overview.today":`Heute gießen`,"overview.none":`Niemand hat Durst`,"overview.all_done":`Alle als gegossen eintragen`,"overview.empty":`Noch keine Pflanzen. Leg eine an unter Einstellungen → Geräte & Dienste → Rootwise.`,not_loaded:`Rootwise ist nicht geladen.`,unknown_plant:`Wähle in den Karteneinstellungen eine Pflanze.`,"target.range":`Ziel {min}–{max}`,"target.min":`mindestens {min}`,"target.max":`höchstens {max}`,no_value:`kein Wert`,"history.moisture":`{value} % Bodenfeuchte`,"delete.confirm":`Löschen?`,"toast.undone":`Rückgängig gemacht`,"more.other_time":`Zu anderer Zeit gegossen…`,"editor.device_id":`Pflanze`,"overview.due.one":`1 braucht heute Wasser`,"overview.due.other":`{count} brauchen heute Wasser`,"overview.hints.one":`1 Hinweis`,"overview.hints.other":`{count} Hinweise`,"overview.logged_at":`eingetragen um {time}`,"overview.all_logged":`{count} × Gegossen eingetragen`,"overview.undo_row":`{name}: Eintrag zurücknehmen`,"overview.log_row":`{name} als gegossen eintragen`,"tile.low":`{measure} zu niedrig`,"tile.high":`{measure} zu hoch`,"tile.never":`noch nie gegossen`,"editor.area_id":`Raum`,"editor.show_tiles":`Alle Pflanzen als Kacheln`,"picker.overview.name":`Rootwise Übersicht`,"picker.overview.description":`Welche Pflanzen heute Wasser brauchen, zum Abhaken, und alle Pflanzen als Kacheln.`,"picker.plant.name":`Rootwise Pflanze`,"picker.plant.description":`Eine Pflanze: Status, Feuchte und Klima mit Zielbereich, Gießen mit Rückgängig, Verlauf.`,"next.in":`Nächstes Gießen {time}`,"next.in_rough":`Nächstes Gießen ungefähr {time}`,"next.interval":`Nächstes Gießen {time} (übliches Intervall)`,"next.due":`Gießen ist fällig`,"next.window":`({from} – {to})`,"next.learning":`Rootwise lernt noch: die Prognose kommt nach ein paar Tagen Messwerten`,"thresholds.learned_hint":`Gelernt aus deinem Gießen: trocken {low} %, nass {high} %`,"thresholds.apply":`Übernehmen`,"thresholds.learned":`Schwellen gelernt aus {count}× Gießen`,"history.detected":`erkannt`,"history.rise":`{before} → {after} %`,"history.reject":`War ich nicht`,"history.reject_confirm":`Wirklich nicht?`,"tile.next":`Gießen {time}`,"toast.thresholds":`Gelernte Schwellen übernommen`,"editor.title":`Titel`,"editor.show_history":`Verlauf zeigen`,"chart.empty":`Noch keine Messwerte`,"chart.no_sensor":`Kein Bodensensor`,"chart.point":`{value} % ({min}–{max})`,"chart.summary":`Bodenfeuchte der letzten {days} Tage: jetzt {value} %, Ziel {low}–{high} %, {count}× gegossen`,"chart.summary_plain":`Bodenfeuchte der letzten {days} Tage: jetzt {value} %`,"panel.title":`Pflanzen`,"panel.back":`Zurück`,"panel.menu":`Menü`,"panel.settings":`Pflanze einstellen`,"panel.all":`Alle`,"panel.rooms":`Räume`,"chart.forecast":`Prognose`,"chart.target":`Ziel {low}–{high} %`,"panel.unknown":`Diese Pflanze gibt es nicht (mehr).`,"panel.days":`{days} Tage`,"section.moisture":`Bodenfeuchte`,"section.species":`Artinfo`,"section.pot":`Topf und Gießen`,"amount.range":`ca. {from}–{to} {unit}`,"amount.one":`ca. {value} {unit}`,"amount.per_watering":`{amount} pro Gießen`,"pot.plastic":`Kunststoff`,"pot.terracotta":`Terrakotta`,"pot.ceramic_glazed":`Keramik, glasiert`,"pot.self_watering":`Selbstbewässerung`,"pot.no_drainage":`ohne Abzugsloch`,"window.n":`Fenster Nord`,"window.ne":`Fenster Nordost`,"window.e":`Fenster Ost`,"window.se":`Fenster Südost`,"window.s":`Fenster Süd`,"window.sw":`Fenster Südwest`,"window.w":`Fenster West`,"window.nw":`Fenster Nordwest`,"how.drainage":`Durchdringend gießen, bis unten Wasser austritt. Untersetzer nach 15 Minuten leeren.`,"how.no_drainage":`Kein Abzugsloch: nur diese Menge geben, nicht bis zum Austritt gießen.`,"how.self_watering":`Selbstbewässerung: Wasserstand prüfen und den Vorratsbehälter auffüllen.`,"range.both":`{min}–{max} {unit}`,"range.min":`ab {min} {unit}`,"range.max":`bis {max} {unit}`,"species.watering":`Gießen`,"species.light":`Licht`,"species.temperature":`Temperatur`,"species.humidity":`Luftfeuchte`,"species.fertilize":`Düngen`,"species.toxicity":`Giftigkeit`,"style.dry_out":`Fast ganz austrocknen lassen, dann gründlich`,"style.mostly_dry":`Oben 3–5 cm antrocknen lassen, dann gründlich`,"style.slightly_dry":`Oberfläche antrocknen lassen`,"style.evenly_moist":`Gleichmäßig feucht halten, nie austrocknen lassen`,"light.dli":`{min}–{max} mol/m² am Tag`,"fertilize.one":`März bis September jede Woche`,"fertilize.other":`März bis September alle {count} Wochen`,"tox.cats":`Katzen`,"tox.dogs":`Hunde`,"tox.humans":`Kinder`,"tox.none":`ungiftig`,"tox.mild":`reizend`,"tox.moderate":`giftig`,"tox.severe":`stark giftig`,"tox.unknown":`unbekannt`,"tox.note.calcium_oxalate":`Enthält Calciumoxalat.`,"tox.source.aspca":`Richtwerte nach ASPCA.`,"tox.source.other":`Richtwerte aus der Fachliteratur.`,"tox.emergency":`Im Notfall: Vergiftungsinformationszentrale oder Tierarzt.`,"care.photo":`Foto`,"section.photos":`Fotos`,"photo.add":`Foto hinzufügen`,"photo.add_short":`Foto`,"photo.camera":`Kamera`,"photo.gallery":`Galerie`,"photo.shoot":`Auslösen`,"photo.retake":`Neu aufnehmen`,"photo.save":`Speichern`,"photo.use":`Übernehmen`,"photo.saving":`Wird gespeichert …`,"photo.note":`Notiz (optional)`,"photo.close":`Schließen`,"photo.prev":`Vorheriges Foto`,"photo.next":`Nächstes Foto`,"photo.https_hint":`Die Live-Kamera braucht die HTTPS-Adresse von Home Assistant. Mach das Foto mit der Kamera-App und wähle es aus der Galerie.`,"photo.chrome":`In Chrome öffnen`,"photo.heic":`Dieses Foto ist im HEIC-Format, das der Browser nicht lesen kann. Stell die Kamera auf „Maximale Kompatibilität“ (JPEG) oder wähle ein anderes Foto.`,"photo.camera_denied":`Kein Zugriff auf die Kamera. Erlaube ihn in den Einstellungen oder nimm die Galerie.`,"photo.failed":`Foto nicht gespeichert: {error}`,"photo.empty":`Noch keine Fotos. Eines im Monat zeigt, wie die Pflanze wächst.`,"photo.cover":`Als Titelbild`,"photo.is_cover":`Titelbild`,"photo.cover_set":`Titelbild gesetzt`,"photo.delete":`Löschen`,"photo.delete_confirm":`Wirklich löschen?`,"photo.cover_caption":`Titelfoto · {date}`,"calibration.title":`Sensor kalibrieren`,"calibration.headline":`Zwei Punkte, eine ehrliche Skala`,"calibration.intro":`Der Sensor misst roh, in jedem Topf und jeder Erde anders. Nach der Kalibrierung heißt 0 % richtig trocken und 100 % frisch gegossen.`,"calibration.raw":`roh`,"calibration.dry":`trocken`,"calibration.wet":`nass`,"calibration.now":`jetzt`,"calibration.raw_value":`{value} % roh`,"calibration.raw_line":`roh {value} % · kalibriert`,"calibration.step":`Punkt {n} von 2`,"calibration.dry_title":`Erde ist jetzt richtig trocken`,"calibration.dry_text":`Nur speichern, wenn die Erde auch 5 cm tief trocken ist. Der Sensor zeigt gerade {value} % roh.`,"calibration.dry_text_none":`Der Sensor liefert gerade keinen Wert.`,"calibration.dry_save":`Als „trocken“ speichern`,"calibration.dry_done":`trocken = {value} % roh`,"calibration.again":`Neu messen`,"calibration.wet_title":`Jetzt durchdringend gießen`,"calibration.wet_text":`Gieße, bis unten Wasser austritt. Rootwise misst danach die Feldkapazität: den Wert, bei dem die Erde nach dem Abtropfen bleibt.`,"calibration.wet_start":`Ich habe gegossen`,"calibration.draining":`Wasser läuft ab, die Messung beginnt um {time}.`,"calibration.measuring":`Messung läuft: {hours} von 4 Stunden · zurzeit {value} % roh`,"calibration.wet_done":`nass = {value} % roh`,"calibration.no_rise":`Der Sensor hat kaum reagiert. Gieß gründlicher, bis unten Wasser austritt, und starte noch einmal.`,"calibration.too_close":`Trocken und nass liegen zu nah beieinander. Miss „trocken“, wenn die Erde wirklich trocken ist.`,"calibration.done":`Kalibriert`,"calibration.result_dry":`trocken (0 %)`,"calibration.result_wet":`nass (100 %)`,"calibration.thresholds":`Gießen unter {low} % · zu nass über {high} %`,"calibration.style":`Schwellen aus dem Gießstil der Art: {style}. Du kannst sie jederzeit ändern.`,"calibration.style_unknown":`unbekannt, ein mittlerer Wert`,"calibration.custom":`Deine eigenen Schwellen ({low}–{high} % roh) gelten weiter.`,"calibration.use_style":`Art-Schwellen verwenden`,"calibration.redo":`Neu kalibrieren`,"calibration.outdated":`Der Sensor wurde seit der Kalibrierung umgesteckt oder die Pflanze umgetopft. Kalibriere neu, damit die Skala stimmt.`,"calibration.suggestion":`Vorschlag aus deinen Daten`,"calibration.suggestion_text":`Aus {count} Gieß-Zyklen gelernt: trocken ≈ {dry}, nass ≈ {wet} % roh. Übernehmen?`,"calibration.suggestion_note":`Wird nie automatisch übernommen. Ein neuer Sensor oder Umtopfen startet von vorn.`,"calibration.apply":`Übernehmen`,"calibration.later":`Später`,"calibration.section":`Kalibrierung`,"calibration.section_none":`Noch nicht kalibriert. Mit zwei Messpunkten zeigt Rootwise eine ehrliche Skala von 0 bis 100 %.`,"calibration.section_done":`Kalibriert: trocken {dry}, nass {wet} % roh`,"calibration.start":`Kalibrieren`,"calibration.open":`Ansehen`,"calibration.error.no_sensor":`Diese Pflanze hat keinen Bodensensor.`,"calibration.error.no_value":`Der Sensor liefert gerade keinen Wert.`,"calibration.error.too_close":`Trocken und nass liegen zu nah beieinander.`,"calibration.error.unauthorized":`Nur Admins können kalibrieren.`,"panel.add":`Pflanze`,"wizard.title":`Pflanze hinzufügen`,"wizard.step":`Schritt {n} von 6`,"wizard.steps.photo":`Foto`,"wizard.steps.species":`Art`,"wizard.steps.basics":`Name und Raum`,"wizard.steps.sensors":`Sensoren`,"wizard.steps.pot":`Topf`,"wizard.steps.done":`Fertig`,"wizard.photo_title":`Mach ein Foto der Pflanze`,"wizard.photo_text":`Es wird das Titelbild. Das Foto wird verkleinert und ohne Standortdaten gespeichert.`,"wizard.photo_take":`Foto aufnehmen oder auswählen`,"wizard.photo_done":`Foto bereit · höchstens 1600 px · ohne GPS`,"wizard.photo_change":`Anderes Foto`,"wizard.species_title":`Welche Art ist es?`,"wizard.species_search":`Art suchen, z. B. Monstera`,"wizard.species_hint":`Ohne Art nimmt Rootwise mittlere Werte und lernt aus deinem Gießen.`,"wizard.species_none":`Nichts gefunden.`,"wizard.species_opb_failed":`OpenPlantbook antwortet gerade nicht; die Offline-Liste geht.`,"wizard.species_chosen":`Gewählt: {name}`,"wizard.offline":`Offline-Liste`,"wizard.name":`Name`,"wizard.room":`Raum`,"wizard.no_room":`Kein Raum`,"wizard.sensors_in":`Sensoren · {room}`,"wizard.sensors_text":`Vorgeschlagen nach Raum und Messart. Noch nicht zugeordnete Geräte stehen oben.`,"wizard.sensor_none":`– keiner –`,"wizard.in_use":`schon bei einer anderen Pflanze`,"wizard.no_light":`Licht: kein Sensor. Später hinzufügen; Rootwise zeigt dann keine erfundenen Werte.`,"wizard.diameter":`Durchmesser`,"wizard.size.s":`S · bis 12 cm`,"wizard.size.m":`M · 13–20 cm`,"wizard.size.l":`L · 21–28 cm`,"wizard.size.xl":`XL · über 28 cm`,"wizard.diameter_exact":`Genau (cm)`,"wizard.material":`Material`,"wizard.place":`Fenster und Standort`,"wizard.window":`Fenster`,"wizard.location":`Standort`,"wizard.drainage":`Abzugsloch im Topf`,"window.none":`Kein Fenster`,"location.indoor":`Drinnen`,"location.balcony":`Balkon`,"location.outdoor":`Draußen`,"wizard.done_title":`{name} ist angelegt`,"wizard.done_time":`In {seconds} Sekunden.`,"wizard.done_waterings.one":`Aus den letzten 60 Tagen deines Sensors hat Rootwise {count} Gießung gefunden. Die Prognose gilt ab sofort.`,"wizard.done_waterings.other":`Aus den letzten 60 Tagen deines Sensors hat Rootwise {count} Gießungen gefunden. Die Prognose gilt ab sofort.`,"wizard.done_reading":`Rootwise liest die letzten 60 Tage deines Sensors …`,"wizard.calibrate_wet":`Gerade gegossen? Als „nass“ kalibrieren`,"wizard.open":`Zur Pflanze`,"wizard.back":`Zurück`,"wizard.skip":`Überspringen`,"wizard.next":`Weiter`,"wizard.create":`Anlegen`,"wizard.creating":`Wird angelegt …`,"wizard.photo_upload_failed":`Das Foto ließ sich nicht hochladen; füg es auf der Pflanzenseite hinzu.`,"wizard.sensors.one":`{count} Sensor`,"wizard.sensors.other":`{count} Sensoren`,"wizard.no_sensors":`ohne Sensor`,"wizard.pot":`Topf {diameter} cm`,"wizard.error.name_missing":`Gib der Pflanze einen Namen.`,"wizard.error.sensor_in_use":`Dieser Bodensensor gehört schon zu einer anderen Pflanze.`,"wizard.error.unknown_species":`Diese Art steht nicht in der Liste.`,"wizard.error.unknown_area":`Diesen Raum gibt es nicht (mehr).`,"wizard.error.unknown_sensor":`Einen der Sensoren gibt es nicht (mehr).`,"wizard.error.opb_failed":`OpenPlantbook antwortet gerade nicht. Wähle die Art aus der Offline-Liste oder überspring sie.`,"wizard.error.unauthorized":`Nur Admins können Pflanzen anlegen.`}};function F(e){let t=(e?.locale?.language??e?.language??`en`).slice(0,2);return t in tt?t:`en`}function I(e,t,n={}){let r=F(e);return(tt[r]?.[t]??et[t]??t).replace(/\{(\w+)\}/g,(e,t)=>t in n?nt(n[t],r):e)}function L(e,t,n){return I(e,`${t}.${new Intl.PluralRules(F(e)).select(n)===`one`?`one`:`other`}`,{count:n})}function nt(e,t){return typeof e==`number`?new Intl.NumberFormat(t,{maximumFractionDigits:1}).format(e):String(e)}var rt=864e5;function it(e,t,n){let r=new Date(e).getTime()-t.getTime(),i=new Intl.RelativeTimeFormat(n,{numeric:`auto`}),a=Math.abs(r);if(a<6e4)return i.format(0,`second`);if(a<36e5)return i.format(Math.round(r/6e4),`minute`);let o=at(new Date(e),t);return o===0?i.format(Math.round(r/36e5),`hour`):Math.abs(o)<30?i.format(o,`day`):new Intl.DateTimeFormat(n,{dateStyle:`medium`}).format(new Date(e))}function at(e,t){let n=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime();return Math.round((n(e)-n(t))/rt)}function ot(e,t){return new Intl.DateTimeFormat(t,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function st(e,t,n){return new Intl.DateTimeFormat(n,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).formatRange(e,t)}function ct(e,t,n){let r=+(e===`temperature`);return new Intl.NumberFormat(n,{maximumFractionDigits:r,minimumFractionDigits:r}).format(t)}var lt=[`soil_moisture`,`air_humidity`,`battery`];function ut(e,t,n,r){let i=e===`illuminance`?e=>Math.log10(Math.max(e,0)+1):e=>e,a,o;if(lt.includes(e))a=0,o=100;else{let s=i(n??r??t??0),c=i(r??n??t??1),l=Math.max(c-s,e===`illuminance`?1:2);a=e===`illuminance`?0:s-l/4,o=c+l/4,t!==null&&(a=Math.min(a,i(t)),o=Math.max(o,i(t)))}let s=e=>Math.min(100,Math.max(0,(i(e)-a)/(o-a)*100));return{low:n===null?0:s(n),high:r===null?100:s(r),marker:t===null?null:s(t)}}var dt=new Set([`below_threshold`,`too_wet`]);function ft(e,t){return Math.min(110,Math.max(0,(t-e.dry)/(e.wet-e.dry)*100))}var pt=e=>Math.round(e*10)/10;function mt(e,t){if(!dt.has(e.code))return e;let n={...e};for(let r of[`value`,`threshold`]){let i=e[r];typeof i==`number`&&(n[r]=Math.round(ft(t,i)))}return n}function ht(e){let t=e.measurements.soil_moisture;if(!t)return null;let n=e.calibration;if(!n)return{value:t.value,min:t.min,max:t.max,raw:t.value,calibrated:!1};let r=e=>e===null?null:Math.round(ft(n,e));return{value:t.calibrated??r(t.value),min:r(t.min),max:r(t.max),raw:t.value,calibrated:!0}}function gt(e){let t=e.calibration;if(!t)return e;let n=e=>pt(ft(t,e));return{...e,points:e.points.map(([e,t,r,i])=>[e,n(t),n(r),n(i)]),thresholds:e.thresholds?{...e.thresholds,low:n(e.thresholds.low),high:n(e.thresholds.high)}:null,forecast:e.forecast?{...e.forecast,level:n(e.forecast.level)}:null}}var _t=[`soil_moisture`,`temperature`,`air_humidity`,`illuminance`,`conductivity`];function vt(e,t){if(t.device_id)return e.find(e=>e.device_id===t.device_id);if(t.plant_id)return e.find(e=>e.id===t.plant_id);if(t.plant){let n=t.plant.trim().toLocaleLowerCase();return e.find(e=>e.id===t.plant||e.name.toLocaleLowerCase()===n)}}var yt=/_(low|high)$/;function R(e){return yt.test(e.code)}function bt(e,t){let n=t.calibration,r=t.reasons.filter(e=>!R(e)).map(e=>n?mt(e,n):e);if(t.status&&t.status!==`ok`){let t=r.find(e=>e.code!==`snoozed`);return t?I(e,`reason.${t.code}`,t):null}return t.snoozed_until?I(e,`snoozed_until`,{time:new Intl.DateTimeFormat(e.language,{weekday:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(t.snoozed_until))}):t.moisture_level?I(e,`level.${t.moisture_level}`):null}function xt(e,t){return t.reasons.filter(R).map(t=>I(e,`hint.${t.code}`,t))}function St(e,t){if(e===`hours`)return new Date(t.getTime()-108e5);if(e===`yesterday`){let e=new Date(t);return e.setDate(e.getDate()-1),e.setHours(18,0,0,0),e}}function Ct(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}function wt(e){return Object.values(e.entities??{}).find(e=>e.platform===`rootwise`&&e.entity_id.endsWith(`_status`)&&e.device_id)?.device_id}function Tt(e,t,n){let r=t.next_watering;if(!r)return t.measurements.soil_moisture?{text:I(e,`next.learning`)}:null;if(new Date(r.due).getTime()<=n.getTime())return{text:I(e,`next.due`)};let i=F(e),a=it(r.due,n,i),o={text:I(e,r.method===`interval`?`next.interval`:r.confidence===`low`?`next.in_rough`:`next.in`,{time:a})};if(r.earliest&&r.latest){let t=e=>new Intl.DateTimeFormat(i,{weekday:`short`}).format(new Date(e)),n=t(r.earliest),a=t(r.latest);n!==a&&(o.window=I(e,`next.window`,{from:n,to:a}))}return o}var Et=3;function Dt(e,t){let n=t.thresholds;if(!n?.learned||t.calibration)return null;let[r,i]=n.learned;return n.source===`learned`?{text:I(e,`thresholds.learned`,{count:n.waterings}),canApply:!1}:n.source===`custom`&&(Math.abs(r-n.low)>=Et||Math.abs(i-n.high)>=Et)?{text:I(e,`thresholds.learned_hint`,{low:r,high:i}),canApply:!0}:null}function Ot(e,t){let n=t.data??{};if(t.source===`auto`){let t=n.settled??n.peak,r=n.before!==void 0&&t!==void 0?I(e,`history.rise`,{before:Math.round(n.before),after:Math.round(t)}):``;return[I(e,`history.detected`),r].filter(Boolean).join(` · `)}return n.moisture===void 0?``:I(e,`history.moisture`,{value:n.moisture})}var kt={thirsty:0,too_wet:1,sensor_offline:2,no_history:3,ok:4};function At(e,t){return t?e.filter(e=>e.area_id===t):e}var jt=(e,t)=>e.name.localeCompare(t.name);function Mt(e){return e.filter(e=>e.needs_water).sort(jt)}function Nt(e,t){return e.filter(e=>e.needs_water||t(e)).sort(jt)}function Pt(e,t){let n=t.measurements.soil_moisture?.value,r=n==null?bt(e,t):`${ct(`soil_moisture`,n,F(e))} %`;return[t.area,r].filter(Boolean).join(` · `)}function Ft(e,t){let n=t.filter(e=>e.needs_water).length,r=t.filter(e=>e.reasons.some(R)).length,i=[n?L(e,`overview.due`,n):I(e,`overview.none`)];return r&&i.push(L(e,`overview.hints`,r)),i.join(` · `)}function It(e,t,n){let r=t.status??`no_history`;if(r===`thirsty`)return{color:`var(--rw-warn)`,text:I(e,`status.thirsty`)};if(r===`too_wet`)return{color:`var(--rw-prob)`,text:I(e,`level.too_wet`)};if(r===`sensor_offline`)return{color:`var(--rw-text2)`,text:I(e,`status.sensor_offline`)};let i=t.reasons.find(R);if(i){let[,t,n]=/^(.*)_(low|high)$/.exec(i.code)??[],r=I(e,`m.${t}`);return{color:`var(--rw-warn)`,text:I(e,`tile.${n}`,{measure:r})}}let a=t.next_watering;return a&&new Date(a.due).getTime()>n.getTime()?{color:`var(--rw-accent)`,text:I(e,`tile.next`,{time:it(a.due,n,F(e))})}:t.moisture_level?{color:`var(--rw-accent)`,text:I(e,`level.${t.moisture_level}`)}:t.last_watered?{color:`var(--rw-accent)`,text:it(t.last_watered,n,F(e))}:{color:`var(--rw-text2)`,text:I(e,`tile.never`)}}function Lt(e){return[...e].sort((e,t)=>(kt[e.status??`ok`]??9)-(kt[t.status??`ok`]??9)||Number(t.reasons.some(R))-Number(e.reasons.some(R))||e.name.localeCompare(t.name))}function Rt(e,t){if(!t)return null;let[n,r]=t,i=r>=1e3,a=new Intl.NumberFormat(F(e),{maximumFractionDigits:+!!i}),o=e=>a.format(i?e/1e3:e),s=i?`l`:`ml`;return n===r?I(e,`amount.one`,{value:o(n),unit:s}):I(e,`amount.range`,{from:o(n),to:o(r),unit:s})}function zt(e,t){let n=[`${t.diameter} cm`,I(e,`pot.${t.material}`)];return t.window!==`none`&&n.push(I(e,`window.${t.window}`)),t.drainage||n.push(I(e,`pot.no_drainage`)),n.join(` · `)}function Bt(e,t){return t.material===`self_watering`?I(e,`how.self_watering`):I(e,t.drainage?`how.drainage`:`how.no_drainage`)}function Vt(e,t,n){if(!t)return null;let{min:r,max:i}=t;return r!==null&&i!==null?I(e,`range.both`,{min:r,max:i,unit:n}):r===null?i===null?null:I(e,`range.max`,{max:i,unit:n}):I(e,`range.min`,{min:r,unit:n})}function Ht(e,t){let n=[],r=(t,r)=>{r&&n.push({key:t,label:I(e,`species.${t}`),text:r})};return r(`watering`,t.watering_style?I(e,`style.${t.watering_style}`):null),r(`light`,t.dli?I(e,`light.dli`,{min:t.dli.min,max:t.dli.max}):Vt(e,t.ranges.illuminance,`lx`)),r(`temperature`,Vt(e,t.ranges.temperature,`°C`)),r(`humidity`,Vt(e,t.ranges.air_humidity,`%`)),r(`fertilize`,t.fertilize_weeks?L(e,`fertilize`,t.fertilize_weeks):null),n}function Ut(e,t){let n=t.toxicity;return n?{badges:[`cats`,`dogs`,`humans`].map(t=>({key:t,who:I(e,`tox.${t}`),level:n[t],text:I(e,`tox.${n[t]}`)})),note:n.note?I(e,`tox.note.${n.note}`):null,source:I(e,n.source.includes(`aspca.org`)?`tox.source.aspca`:`tox.source.other`)}:null}var z=o`
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
`,Wt={ok:`var(--rw-accent)`,thirsty:`var(--rw-warn)`,too_wet:`var(--rw-prob)`,sensor_offline:`var(--rw-text2)`,no_history:`var(--rw-text2)`},Gt={soil_moisture:`mdi:water-percent`,temperature:`mdi:thermometer`,air_humidity:`mdi:water-opacity`,illuminance:`mdi:white-balance-sunny`,conductivity:`mdi:sprout-outline`,battery:`mdi:battery-40`,watered:`mdi:watering-can`,fertilized:`mdi:bottle-tonic-plus`,repotted:`mdi:pot-mix`,cleaned:`mdi:leaf`,rotated:`mdi:rotate-3d-variant`,pest_check:`mdi:bug-check`,pruned:`mdi:content-cut`,sensor_moved:`mdi:cursor-move`,note:`mdi:note-text-outline`,photo:`mdi:camera`},Kt=`/rootwise`;function qt(e){return`${Kt}/plant/${encodeURIComponent(e)}`}function B(e,t=!1){t?history.replaceState(null,``,e):history.pushState(null,``,e),window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:t}}))}function V(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var H=class extends M{connectedCallback(){super.connectedCallback(),this.subscribe()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0}willUpdate(e){e.has(`hass`)&&(this.subscribe(),this.toggleAttribute(`dark`,!!this.hass?.themes?.darkMode))}subscribe(){let e=this.hass;e&&this.isConnected&&e.connection!==this.connection&&(this.unsubscribe?.(),this.connection=e.connection,this.unsubscribe=Ve(e,e=>{this.payload=e}))}t(e,t){return I(this.hass,e,t)}openPlant(e){B(qt(e.id))}moreInfo(e){e&&this.dispatchEvent(new CustomEvent(`hass-more-info`,{detail:{entityId:e},bubbles:!0,composed:!0}))}};V([N({attribute:!1})],H.prototype,`hass`,void 0),V([P()],H.prototype,`payload`,void 0);function U(e){return e&&typeof e==`object`&&`message`in e?String(e.message):String(e)}function Jt(e){return I({language:document.documentElement.lang||`en`},`editor.${e.name}`)}var Yt=36e5,Xt=1e4,Zt=class extends H{constructor(...e){super(...e),this.ticked=new Map,this.busy=new Set}static getConfigForm(){return{schema:[{name:`title`,selector:{text:{}}},{name:`area_id`,selector:{area:{}}},{name:`show_tiles`,selector:{boolean:{}}}],computeLabel:Jt}}static getStubConfig(){return{show_tiles:!0}}setConfig(e){this.config={show_tiles:!0,...e}}getCardSize(){return 3+(this.payload?Mt(this.payload.plants).length:0)}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer)}async toggle(e){if(!this.hass||this.busy.has(e.id))return;this.busy=new Set(this.busy).add(e.id);let t=this.ticked.get(e.id);try{let n=new Map(this.ticked);t?(await Ue(this.hass,t.id),n.delete(e.id)):n.set(e.id,await He(this.hass,e.id,`watered`)),this.ticked=n}catch(e){this.showToast({text:this.t(`toast.failed`,{error:U(e)})})}finally{let t=new Set(this.busy);t.delete(e.id),this.busy=t}}async allDone(e){let t=this.hass;if(!t)return;let n=e.filter(e=>!this.ticked.has(e.id));try{let e=await Promise.all(n.map(e=>He(t,e.id,`watered`))),r=new Map(this.ticked);n.forEach((t,n)=>r.set(t.id,e[n])),this.ticked=r,this.showToast({text:this.t(`overview.all_logged`,{count:e.length}),undo:e})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:U(e)})})}}async undoAll(e){let t=this.hass;if(t)try{await Promise.all(e.map(e=>Ue(t,e.id)));let n=new Map(this.ticked);e.forEach(e=>n.delete(e.plant_id)),this.ticked=n,this.showToast({text:this.t(`toast.undone`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:U(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},Xt)}render(){let e=this.hass;if(!this.payload||!e)return E`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return E`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let t=At(this.payload.plants,this.config?.area_id),n=Mt(t),r=Date.now(),i=Nt(t,e=>{let t=this.ticked.get(e.id);return t!==void 0&&r-Date.parse(t.ts)<Yt}),a=n.filter(e=>!this.ticked.has(e.id));return E`
      <ha-card>
        <div class="head">
          <span class="badge"><ha-icon icon="mdi:sprout"></ha-icon></span>
          <div class="titles">
            <div class="title">${this.config?.title||this.t(`overview.title`)}</div>
            <div class="muted small">${t.length?Ft(e,t):``}</div>
          </div>
        </div>
        ${this.payload.vacation?E`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:k}
        ${t.length===0?E`<div class="empty muted">${this.t(`overview.empty`)}</div>`:k}
        ${i.length?E`<ul class="due" aria-label=${this.t(`overview.today`)}>
              ${i.map(e=>this.renderRow(e))}
            </ul>`:k}
        ${a.length>=2?E`<button class="all" @click=${()=>void this.allDone(a)}>
              <ha-icon icon="mdi:check-all"></ha-icon>${this.t(`overview.all_done`)}
            </button>`:k}
        ${this.toast?this.renderToast(this.toast):k}
        ${this.config?.show_tiles&&t.length?E`<div class="tiles">${Lt(t).map(e=>this.renderTile(e))}</div>`:k}
      </ha-card>
    `}renderRow(e){let t=this.hass,n=this.ticked.get(e.id),r=t?Rt(t,e.pot.amount):null,i=n?this.t(`overview.logged_at`,{time:new Intl.DateTimeFormat(F(t),{hour:`2-digit`,minute:`2-digit`}).format(new Date(n.ts))}):t?Pt(t,e):``;return E`
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
          ${!n&&r?E`<span class="muted small">${r}</span>`:k}
        </div>
      </li>
    `}renderTile(e){let t=this.hass?It(this.hass,e,new Date):{color:``,text:``};return E`
      <button class="tile" @click=${()=>this.openPlant(e)}>
        <span class="tile-name"><span class="dot" style="background:${t.color}"></span>${e.name}</span>
        <span class="muted tiny">${t.text}</span>
      </button>
    `}renderToast(e){let t=e.undo;return E`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${t?E`<button class="link" @click=${()=>void this.undoAll(t)}>${this.t(`action.undo`)}</button>`:k}
      </div>
    `}static{this.styles=[z,o`
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
    `]}};V([P()],Zt.prototype,`config`,void 0),V([P()],Zt.prototype,`ticked`,void 0),V([P()],Zt.prototype,`busy`,void 0),V([P()],Zt.prototype,`toast`,void 0);var Qt=10,$t=500,W=class extends H{constructor(...e){super(...e),this.panel=`none`,this.pickTime=``,this.busy=!1,this.longPressed=!1}static getConfigForm(){return{schema:[{name:`device_id`,required:!0,selector:{device:{filter:[{integration:`rootwise`}]}}},{name:`show_history`,selector:{boolean:{}}}],computeLabel:Jt}}static getStubConfig(e){return{device_id:wt(e),show_history:!0}}setConfig(e){this.config={show_history:!0,...e}}getCardSize(){return this.config?.show_history?8:5}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer),window.clearTimeout(this.confirmTimer)}get plant(){return this.payload&&this.config?vt(this.payload.plants,this.config):void 0}async log(e,t){let n=this.plant;if(n&&this.hass&&!this.busy){this.busy=!0,this.panel=`none`;try{let r=await He(this.hass,n.id,e,t);this.showToast({text:this.t(`toast.logged`,{type:this.t(`care.${e}`)}),undo:r})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:U(e)})})}finally{this.busy=!1}}}async deleteEntry(e,t){if(this.hass)try{await Ue(this.hass,e.id),this.showToast({text:t})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:U(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},Qt*1e3)}undo(){let e=this.toast?.undo;e&&this.deleteEntry(e,this.t(`toast.undone`))}pressStart(){this.longPressed=!1,window.clearTimeout(this.pressTimer),this.pressTimer=window.setTimeout(()=>{this.longPressed=!0,this.openWhen()},$t)}pressEnd(){window.clearTimeout(this.pressTimer)}waterClick(){if(this.longPressed){this.longPressed=!1;return}this.log(`watered`)}openWhen(){this.pickTime=``,this.panel=`when`}chooseWhen(e){this.log(`watered`,St(e,new Date))}savePicked(){this.pickTime&&this.log(`watered`,new Date(this.pickTime))}askDelete(e){if(this.confirmDelete===e.id){this.confirmDelete=void 0,this.deleteEntry(e,this.t(`toast.deleted`));return}this.confirmDelete=e.id,window.clearTimeout(this.confirmTimer),this.confirmTimer=window.setTimeout(()=>{this.confirmDelete=void 0},4e3)}render(){if(!this.payload)return E`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return E`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let e=this.plant;if(!e)return E`<ha-card><div class="empty muted">${this.t(`unknown_plant`)}</div></ha-card>`;let t=this.hass?bt(this.hass,e):null,n=this.hass?xt(this.hass,e):[],r=_t.filter(t=>e.measurements[t]);return E`
      <ha-card>
        ${this.payload.vacation?E`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:k}
        ${this.config?.embedded?k:this.renderHead(e)}
        ${t?E`<div class="detail">${t}</div>`:k}
        ${r.length?E`<div class="bars">
              ${r.map(t=>this.renderBar(t,this.shown(e,t),e))}
            </div>`:k}
        ${n.length?E`<ul class="hints">
              ${n.map(e=>E`<li><ha-icon icon="mdi:information-outline"></ha-icon>${e}</li>`)}
            </ul>`:k}
        ${this.renderLearned(e)}
        <div class="when-block">
          ${this.renderNext(e)}
          <div class="last muted">${this.lastWatered(e)}</div>
        </div>
        ${this.renderActions(e)} ${this.panel===`when`?this.renderWhen():k}
        ${this.panel===`more`?this.renderMore():k}
        ${this.toast?this.renderToast(this.toast):k}
        ${this.config?.show_history?this.renderHistory(e):k}
      </ha-card>
    `}renderHead(e){let t=e.status??`no_history`,n=[e.species.common,e.species.scientific].filter(Boolean).filter((e,t,n)=>n.indexOf(e)===t);return E`
      <div
        class="head"
        role="button"
        tabindex="0"
        @click=${()=>this.openPlant(e)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&this.openPlant(e)}}
      >
        <div class="avatar">
          ${e.species.image_url?E`<img
                src=${e.species.image_url}
                alt=""
                loading="lazy"
                @error=${e=>e.target.hidden=!0}
              />`:k}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="titles">
          <div class="name">${e.name}</div>
          <div class="status">
            <span class="dot" style="background:${Wt[t]}"></span>
            <span>${this.t(`status.${t}`)}${e.area?` · ${e.area}`:``}</span>
          </div>
          ${n.length?E`<div class="species muted">${n.join(` · `)}</div>`:k}
        </div>
      </div>
    `}shown(e,t){let n=e.measurements[t],r=t===`soil_moisture`?ht(e):null;return r?.calibrated?{...n,value:r.value,min:r.min,max:r.max,unit:`%`}:n}renderBar(e,t,n){let r=F(this.hass),i=ut(e,t.value,t.min,t.max),a=t.unit??``,o=t.value===null?`–`:`${ct(e,t.value,r)}${a?` ${a}`:``}`,s=t.rating===`low`||t.rating===`high`||t.level===`dry`||t.level===`too_wet`,c=t.min!==null&&t.max!==null?this.t(`target.range`,{min:t.min,max:t.max}):t.min===null?t.max===null?``:this.t(`target.max`,{max:t.max}):this.t(`target.min`,{min:t.min}),l=this.t(`m.${e}`),u=`${l} ${t.value===null?this.t(`no_value`):o}${c?`, ${c}`:``}`;return E`
      <div
        class="bar-row ${s?`off`:``}"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(n.entity_ids[e])}
      >
        <ha-icon icon=${Gt[e]??`mdi:gauge`}></ha-icon>
        <span class="label"
          >${l}${e===`soil_moisture`&&n.calibration&&n.measurements.soil_moisture?.value!=null?E`<small class="raw muted"
                >${this.t(`calibration.raw_line`,{value:ct(e,n.measurements.soil_moisture.value,r)})}</small
              >`:k}</span
        >
        <div class="bar" role="img" aria-label=${u}>
          <div class="zone" style="left:${i.low}%;width:${Math.max(i.high-i.low,0)}%"></div>
          ${e===`soil_moisture`&&i.marker!==null?E`<div class="fill" style="width:${i.marker}%"></div>`:k}
          ${t.min===null?k:E`<div class="tick" style="left:${i.low}%"></div>`}
          ${t.max===null?k:E`<div class="tick" style="left:${i.high}%"></div>`}
          ${i.marker===null?k:E`<div class="marker" style="left:${i.marker}%"></div>`}
        </div>
        <span class="value num">${o}</span>
      </div>
    `}renderNext(e){let t=this.hass?Tt(this.hass,e,new Date):null;return t?E`<div class="next">
      <ha-icon icon="mdi:calendar-clock"></ha-icon>
      <span>${t.text}${t.window?E` <span class="muted">${t.window}</span>`:k}</span>
    </div>`:k}renderLearned(e){let t=this.hass?Dt(this.hass,e):null;return t?E`<div class="learned muted">
      <ha-icon icon="mdi:school-outline"></ha-icon>
      <span>${t.text}</span>
      ${t.canApply?E`<button class="link" @click=${()=>void this.applyLearned(e)}>
            ${this.t(`thresholds.apply`)}
          </button>`:k}
    </div>`:k}async applyLearned(e){if(this.hass)try{await Ge(this.hass,e.id),this.showToast({text:this.t(`toast.thresholds`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:U(e)})})}}lastWatered(e){return e.last_watered?this.t(`last_watered`,{time:it(e.last_watered,new Date,F(this.hass))}):this.t(`never_watered`)}renderActions(e){let t=e.entity_ids.snooze,n=this.toast?.undo?.type===`watered`;return E`
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
        ${e.needs_water&&t?E`<button class="secondary" @click=${()=>this.hass&&void We(this.hass,t)}>
              ${this.t(`action.snooze`)}
            </button>`:k}
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
    `}renderWhen(){let e=Ct(new Date);return E`
      <div class="panel" role="group" aria-label=${this.t(`when.title`)}>
        <div class="panel-title">${this.t(`when.title`)}</div>
        <div class="choices">
          ${[`now`,`hours`,`yesterday`].map(e=>E`<button @click=${()=>this.chooseWhen(e)}>${this.t(`when.${e}`)}</button>`)}
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
    `}renderMore(){return E`
      <div class="panel menu" role="menu">
        <button role="menuitem" @click=${this.openWhen}>
          <ha-icon icon="mdi:clock-edit-outline"></ha-icon>${this.t(`more.other_time`)}
        </button>
        ${[`fertilized`,`sensor_moved`].map(e=>E`<button role="menuitem" @click=${()=>void this.log(e)}>
            <ha-icon icon=${Gt[e]??`mdi:plus`}></ha-icon>${this.t(`care.${e}`)}
          </button>`)}
      </div>
    `}renderToast(e){return E`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${e.undo?E`<button class="link" @click=${this.undo}>${this.t(`action.undo`)}</button>`:k}
      </div>
    `}renderHistory(e){let t=F(this.hass);return E`
      <div class="history">
        <div class="section">${this.t(`history`)}</div>
        ${e.recent.length===0?E`<div class="muted small">${this.t(`history.empty`)}</div>`:E`<ul>
              ${e.recent.map(e=>{let n=this.hass?Ot(this.hass,e):``,r=this.hass?Ke(this.hass,e):!1,i=this.confirmDelete===e.id,a=e.source===`auto`;return E`<li class=${a?`detected`:``}>
                  <ha-icon icon=${Gt[e.type]??`mdi:circle-small`}></ha-icon>
                  <div class="entry">
                    <span>${this.t(`care.${e.type}`)}</span>
                    <span class="muted small">
                      ${ot(e.ts,t)}${n?` · ${n}`:``}
                    </span>
                  </div>
                  ${r?E`<button
                        class="delete ${i?`confirm`:``}"
                        aria-label=${this.t(a?`history.reject`:`action.delete`)}
                        title=${this.t(a?`history.reject`:`action.delete`)}
                        @click=${()=>this.askDelete(e)}
                      >
                        ${i?this.t(a?`history.reject_confirm`:`delete.confirm`):E`<ha-icon
                              icon=${a?`mdi:close-circle-outline`:`mdi:delete-outline`}
                            ></ha-icon>`}
                      </button>`:k}
                </li>`})}
            </ul>`}
      </div>
    `}static{this.styles=[z,o`
      .raw {
        display: block;
        font-size: 11px;
        line-height: 1.2;
      }
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
    `]}};V([P()],W.prototype,`config`,void 0),V([P()],W.prototype,`panel`,void 0),V([P()],W.prototype,`pickTime`,void 0),V([P()],W.prototype,`toast`,void 0),V([P()],W.prototype,`confirmDelete`,void 0),V([P()],W.prototype,`busy`,void 0);var en=1600,tn=.82;function nn(e,t,n){let r=Math.min(1,n/Math.max(e,t));return{width:Math.round(e*r),height:Math.round(t*r)}}function rn(e){return/image\/hei[cf]/i.test(e.type)||/\.hei[cf]$/i.test(e.name)}function an(e,t,n){let r=`/api/rootwise/photos/${encodeURIComponent(e)}/${encodeURIComponent(t)}`;return n===`thumb`?`${r}?size=thumb`:r}function on(e,t,n){return!e?.startsWith(`https://`)||!/Android/i.test(n)?null:`intent://${e.slice(8).replace(/\/+$/,``)}${t}#Intent;scheme=https;package=com.android.chrome;end`}async function sn(e){let t=await createImageBitmap(e,{imageOrientation:`from-image`}),{width:n,height:r}=nn(t.width,t.height,en),i=document.createElement(`canvas`);i.width=n,i.height=r;let a=i.getContext(`2d`);if(!a)throw Error(`No canvas`);return a.drawImage(t,0,0,n,r),t.close(),new Promise((e,t)=>{i.toBlob(n=>n?e(n):t(Error(`JPEG`)),`image/jpeg`,tn)})}async function cn(e){try{let t=await e.json();if(t.message)return Error(t.message)}catch{}return Error(`HTTP ${e.status}`)}async function ln(e,t,n,r){let i=new FormData;i.append(`file`,n,`photo.jpg`),r?.trim()&&i.append(`note`,r.trim());let a=await e.fetchWithAuth(`/api/rootwise/photos/${encodeURIComponent(t)}`,{method:`POST`,body:i});if(!a.ok)throw await cn(a);return(await a.json()).entry}var un=new Map;function dn(e,t,n,r){let i=an(t,n,r),a=un.get(i);return a||(a=e.fetchWithAuth(i).then(async e=>{if(!e.ok)throw await cn(e);return URL.createObjectURL(await e.blob())}),a.catch(()=>un.delete(i)),un.set(i,a)),a}async function fn(e,t){return e.callWS({type:`rootwise/photos/list`,plant_id:t})}async function pn(e,t,n){await e.callWS({type:`rootwise/photos/cover`,plant_id:t,photo_id:n})}var G=class extends M{constructor(...e){super(...e),this.plantId=``,this.photoId=``,this.size=`thumb`,this.alt=``,this.failed=!1,this.key=``}willUpdate(){let e=`${this.plantId}/${this.photoId}/${this.size}`;this.hass&&this.plantId&&this.photoId&&e!==this.key&&(this.key=e,this.src=void 0,this.failed=!1,dn(this.hass,this.plantId,this.photoId,this.size).then(t=>{this.key===e&&(this.src=t)},()=>{this.key===e&&(this.failed=!0)}))}render(){return this.src?E`<img src=${this.src} alt=${this.alt} draggable="false" />`:E`<div class="placeholder ${this.failed?`failed`:``}" role="img" aria-label=${this.alt}>
      ${this.failed?E`<ha-icon icon="mdi:image-broken-variant"></ha-icon>`:k}
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
  `}};V([N({attribute:!1})],G.prototype,`hass`,void 0),V([N()],G.prototype,`plantId`,void 0),V([N()],G.prototype,`photoId`,void 0),V([N()],G.prototype,`size`,void 0),V([N()],G.prototype,`alt`,void 0),V([P()],G.prototype,`src`,void 0),V([P()],G.prototype,`failed`,void 0);var mn=864e5,hn=.25,gn=1.5,_n=[1,2,7,14,28],vn=36,yn=64,bn={left:30,right:8,top:8,bottom:22},xn={left:4,right:4,top:6,bottom:18},Sn=e=>e.toFixed(1),Cn=(e,t,n)=>Math.min(n,Math.max(t,e));function wn(e){let t=[];for(let[,,n,r]of e.points)t.push(n,r);if(e.thresholds&&t.push(e.thresholds.low,e.thresholds.high),e.forecast&&t.push(e.forecast.level),!t.length)return[0,100];let n=Math.max(...t)>100?110:100,r=Math.max(0,Math.floor((Math.min(...t)-5)/10)*10),i=Math.min(n,Math.ceil((Math.max(...t)+5)/10)*10);return i-r<20&&(i=Math.min(100,r+20),r=Math.max(0,i-20)),[r,i]}function Tn(e,t){let n=[],r=[];for(let i of e){let e=r.at(-1);e&&i[0]-e[0]>t&&(n.push(r),r=[]),r.push(i)}return r.length&&n.push(r),n}function En(e,t,n,r,i){let a=_n.find(e=>e*i>=vn)??28,o=new Date(t);if(o.setHours(0,0,0,0),a>=7)for(;o.getDay()!==1;)o.setDate(o.getDate()-1);let s=[];for(let t=new Date(o);t.getTime()>=e;t.setDate(t.getDate()-a))s.unshift(t.getTime());let c=new Date(o);for(c.setDate(c.getDate()+a);c.getTime()<=n;c.setDate(c.getDate()+a))s.push(c.getTime());let l=a<7&&a*i>=yn,u=new Intl.DateTimeFormat(r,l?{weekday:`short`,day:`numeric`}:{day:`numeric`,month:`numeric`});return s.map(e=>({time:e,label:u.format(new Date(e))}))}function Dn(e,t,n,r,i={}){let a=!!i.compact,o=a?xn:bn,s={left:o.left,right:Math.max(o.left+1,t-o.right),top:o.top,bottom:Math.max(o.top+1,n-o.bottom)},c=Date.parse(e.start),l=Date.parse(e.end),u=e.forecast?Date.parse(e.forecast.due):null,d=u!==null&&u>l&&e.thresholds!==null,f=d?l+(l-c)*hn:l,[p,m]=wn(e),h=e=>s.left+(e-c)/(f-c)*(s.right-s.left),g=e=>s.bottom-(e-p)/(m-p)*(s.bottom-s.top),ee=e.step*500,te=Tn(e.points,e.step*1e3*gn),_=(e,t)=>`${Sn(h(e[0]+ee))} ${Sn(g(t))}`,v=te.filter(e=>e.length>1).map(e=>e.map((e,t)=>`${t?`L`:`M`}${_(e,e[1])}`).join(``)).join(``),ne=te.filter(e=>e.length>1).map(e=>`${e.map((e,t)=>`${t?`L`:`M`}${_(e,e[3])}`).join(``)}${[...e].reverse().map(e=>`L${_(e,e[2])}`).join(``)}Z`).join(``),re=[];for(let[e,...t]of te)e&&!t.length&&re.push({x:h(e[0]+ee),y:g(e[1])});let y=e.thresholds,ie=y?{top:Cn(g(y.high),s.top,s.bottom),bottom:Cn(g(y.low),s.top,s.bottom)}:null,ae=m-p<=50?10:20,b=[];for(let e=p;e<=m;e+=ae)b.push({y:g(e),value:e});let oe=h(l),se=null;if(d&&e.forecast&&y&&u!==null){let t=oe,n=g(e.forecast.level),r=h(u),i=g(y.low);r>s.right&&(i=n+(i-n)*(s.right-t)/(r-t),r=s.right),se={x1:t,y1:n,x2:r,y2:i,from:Cn(h(Date.parse(e.forecast.earliest)),t,s.right),to:Cn(h(Date.parse(e.forecast.latest)),t,s.right)}}return{width:t,height:n,plot:s,domain:{t0:c,t1:f,v0:p,v1:m},x:h,y:g,line:v,envelope:ne,dots:re,band:ie,xTicks:En(c,l,f,r,(s.right-s.left)*mn/(f-c)).map(e=>({...e,x:h(e.time)})),yTicks:a?[]:b,events:e.events.map(e=>({time:Date.parse(e.ts),type:e.type,source:e.source})).filter(e=>e.time>=c&&e.time<=f).map(e=>({...e,x:h(e.time)})),forecast:se,nowX:oe}}function On(e,t,n){let r=e.points[0],i=e.points.at(-1);if(!r||!i)return null;let{t0:a,t1:o}=t.domain,{left:s,right:c}=t.plot,l=a+(n-s)/(c-s)*(o-a),u=e.step*1e3;if(l<r[0]||l>i[0]+u)return null;let d=r;for(let t of e.points)Math.abs(t[0]+u/2-l)<Math.abs(d[0]+u/2-l)&&(d=t);return{point:d,x:t.x(d[0]+u/2),y:t.y(d[1])}}var kn=`M0 -5C2.5 -1.6 3.6 0.4 3.6 1.9A3.6 3.6 0 0 1 -3.6 1.9C-3.6 0.4 -2.5 -1.6 0 -5Z`,K=class extends M{constructor(...e){super(...e),this.language=`en`,this.compact=!1,this.height=180,this.dark=!1,this.width=0,this.hover=null,this.onPointer=e=>{if(!this.shown||!this.model)return;let t=e.currentTarget.getBoundingClientRect(),n=On(this.shown,this.model,e.clientX-t.left);this.hover=n?this.shown.points.indexOf(n.point):null},this.onLeave=()=>{this.hover=null},this.onKey=e=>{let t=this.shown?.points.length??0;if(!t)return;let n=this.hover??t,r=new Map([[`ArrowLeft`,Math.max(0,n-1)],[`ArrowRight`,Math.min(t-1,this.hover===null?t-1:n+1)],[`Home`,0],[`End`,t-1]]).get(e.key);e.key===`Escape`?this.hover=null:r!==void 0&&(e.preventDefault(),this.hover=r)}}connectedCallback(){super.connectedCallback(),this.observer=new ResizeObserver(e=>{let t=Math.round(e[0]?.contentRect.width??0);t!==this.width&&(this.width=t)}),this.observer.observe(this),this.width||=Math.round(this.getBoundingClientRect().width)}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}willUpdate(e){e.has(`data`)&&(this.hover=null,this.shown=this.data?gt(this.data):void 0),[`data`,`width`,`height`,`compact`,`language`].some(t=>e.has(t))&&(this.model=this.shown&&this.width?Dn(this.shown,this.width,this.height,this.language,{compact:this.compact}):void 0)}t(e,t){return I({language:this.language},e,t)}render(){let e=this.shown,t=`height:${this.height}px`;if(!e)return E`<div class="frame" style=${t} aria-busy="true"></div>`;if(!e.points.length){let n=e.thresholds?`chart.empty`:`chart.no_sensor`;return E`<div class="frame empty muted" style=${t}>${this.t(n)}</div>`}let n=this.model,r=this.hover===null?void 0:e.points[this.hover];return E`
      <div
        class="frame"
        style=${t}
        tabindex="0"
        role="img"
        aria-label=${this.summary(e)}
        @keydown=${this.onKey}
      >
        ${n?E`<svg
              width=${n.width}
              height=${n.height}
              viewBox="0 0 ${n.width} ${n.height}"
              aria-hidden="true"
              @pointermove=${this.onPointer}
              @pointerdown=${this.onPointer}
              @pointerleave=${this.onLeave}
            >
              ${this.back(n)} ${this.series(n)} ${this.markers(n)}
              ${r?this.crosshair(n,r,e.step):k}
            </svg>`:k}
        ${n&&r?this.tooltip(n,r,e.step):k}
      </div>
    `}back(e){let{plot:t}=e;return D`
      ${e.band?D`<rect class="band" x=${t.left} y=${e.band.top}
            width=${t.right-t.left} height=${e.band.bottom-e.band.top}></rect>`:k}
      ${e.forecast?D`<rect class="future" x=${e.nowX} y=${t.top}
            width=${t.right-e.nowX} height=${t.bottom-t.top}></rect>`:k}
      ${e.forecast&&e.forecast.to>e.forecast.from?D`<rect class="window" x=${e.forecast.from} y=${t.top}
            width=${e.forecast.to-e.forecast.from} height=${t.bottom-t.top}></rect>`:k}
      ${e.yTicks.map(e=>D`
          <line class="grid" x1=${t.left} x2=${t.right} y1=${e.y} y2=${e.y}></line>
          <text class="label" x=${t.left-6} y=${e.y} text-anchor="end"
            dominant-baseline="middle">${e.value}</text>`)}
      <line class="axis" x1=${t.left} x2=${t.right} y1=${t.bottom} y2=${t.bottom}></line>
      ${e.xTicks.filter(e=>e.x>=t.left&&e.x<=t.right).map(n=>D`
            <line class="axis" x1=${n.x} x2=${n.x} y1=${t.bottom} y2=${t.bottom+3}></line>
            <text class="label" x=${n.x} y=${e.height-4}
              text-anchor="middle">${n.label}</text>`)}
    `}series(e){let t=e.forecast;return D`
      <path class="envelope" d=${e.envelope}></path>
      <path class="line" d=${e.line}></path>
      ${e.dots.map(e=>D`<circle class="dot" cx=${e.x} cy=${e.y} r="2"></circle>`)}
      ${t?D`
          <line class="now" x1=${e.nowX} x2=${e.nowX}
            y1=${e.plot.top} y2=${e.plot.bottom}></line>
          <line class="forecast" x1=${t.x1} y1=${t.y1}
            x2=${t.x2} y2=${t.y2}></line>`:k}
    `}markers(e){let t=e.plot.top+6;return e.events.map(n=>{if(n.type===`watered`){let r=n.source===`auto`;return D`
          <line class="watered-guide" x1=${n.x} x2=${n.x}
            y1=${t} y2=${e.plot.bottom}></line>
          <path class=${r?`drop detected`:`drop`} d=${kn}
            transform="translate(${n.x} ${t})"></path>`}return D`<rect class=${n.type===`fertilized`?`fertilized`:`other`} x=${n.x-3} y=${t-3} width="6" height="6"
        transform="rotate(45 ${n.x} ${t})"></rect>`})}crosshair(e,t,n){let r=e.x(t[0]+n*500);return D`
      <line class="cross" x1=${r} x2=${r} y1=${e.plot.top} y2=${e.plot.bottom}></line>
      <circle class="focus" cx=${r} cy=${e.y(t[1])} r="3.5"></circle>`}tooltip(e,t,n){let r=e.x(t[0]+n*500);return E`<div class="tip" style="top:${e.y(t[1])>e.plot.top+48?e.plot.top:e.plot.bottom-40}px;${r<e.width/3?`left:${Math.max(0,r-16)}px`:r>e.width*2/3?`right:${Math.max(0,e.width-r-16)}px`:`left:${r}px;transform:translateX(-50%)`}">
      <span class="muted"
        >${st(new Date(t[0]),new Date(t[0]+n*1e3),this.language)}</span
      >
      <span class="num"
        >${this.t(`chart.point`,{value:Math.round(t[1]),min:Math.round(t[2]),max:Math.round(t[3])})}</span
      >
    </div>`}summary(e){let t=Math.round((Date.parse(e.end)-Date.parse(e.start))/864e5),n=e.points.at(-1),r={days:t,value:n?Math.round(n[1]):`–`,count:e.events.filter(e=>e.type===`watered`).length,low:e.thresholds?.low,high:e.thresholds?.high};return this.t(e.thresholds?`chart.summary`:`chart.summary_plain`,r)}static{this.styles=[z,o`
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
  `]}};V([N({attribute:!1})],K.prototype,`data`,void 0),V([N()],K.prototype,`language`,void 0),V([N({type:Boolean})],K.prototype,`compact`,void 0),V([N({type:Number})],K.prototype,`height`,void 0),V([N({type:Boolean,reflect:!0})],K.prototype,`dark`,void 0),V([P()],K.prototype,`width`,void 0),V([P()],K.prototype,`hover`,void 0);var q=class extends M{constructor(...e){super(...e),this.plantId=``,this.open=!1,this.dark=!1,this.local=!1,this.mode=`choose`,this.note=``,this.saving=!1,this.onClose=()=>{this.reset(),this.dispatchEvent(new CustomEvent(`rootwise-photo-closed`,{bubbles:!0,composed:!0}))},this.startCamera=async()=>{this.error=void 0;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:`environment`},width:{ideal:1920},height:{ideal:1440}},audio:!1})}catch{this.error=this.t(`photo.camera_denied`);return}this.mode=`camera`,await this.updateComplete;let e=this.video;if(!e)return;e.srcObject=this.stream,await e.play().catch(()=>void 0);let[t]=this.stream.getVideoTracks();await t?.applyConstraints({advanced:[{focusMode:`continuous`}]}).catch(()=>void 0)},this.shoot=async()=>{let e=this.stream?.getVideoTracks()[0],t=window.ImageCapture,n=null;e&&t&&(n=await new t(e).takePhoto().catch(()=>null)),!n&&this.video&&(n=await this.frame(this.video)),this.stopCamera(),n?await this.take(n):this.error=this.t(`photo.failed`,{error:`camera`})},this.picked=async e=>{let t=e.target,n=t.files?.[0];t.value=``,n&&await this.take(n)},this.again=()=>{this.preview&&URL.revokeObjectURL(this.preview),this.preview=void 0,this.photo=void 0,this.mode=`choose`},this.save=async()=>{if(this.local&&this.photo){this.dispatchEvent(new CustomEvent(`rootwise-photo-taken`,{detail:{photo:this.photo},bubbles:!0,composed:!0})),this.dialog?.close();return}if(this.hass&&this.photo&&!this.saving){this.saving=!0,this.error=void 0;try{let e=await ln(this.hass,this.plantId,this.photo,this.note);this.dispatchEvent(new CustomEvent(`rootwise-photo-added`,{detail:{entry:e},bubbles:!0,composed:!0})),this.dialog?.close()}catch(e){this.error=this.t(`photo.failed`,{error:U(e)})}finally{this.saving=!1}}}}t(e,t){return I(this.hass,e,t)}get live(){return window.isSecureContext&&typeof navigator.mediaDevices?.getUserMedia==`function`}updated(e){e.has(`open`)&&this.dialog&&(this.open&&!this.dialog.open&&this.dialog.showModal(),!this.open&&this.dialog.open&&this.dialog.close())}disconnectedCallback(){super.disconnectedCallback(),this.reset()}reset(){this.stopCamera(),this.preview&&URL.revokeObjectURL(this.preview),this.preview=void 0,this.photo=void 0,this.note=``,this.mode=`choose`,this.error=void 0,this.saving=!1}stopCamera(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}frame(e){let t=document.createElement(`canvas`);return t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`)?.drawImage(e,0,0),new Promise(e=>t.toBlob(e,`image/jpeg`,.92))}async take(e){this.error=void 0;let t;try{t=await sn(e)}catch{if(e instanceof File&&rn(e)){this.error=this.t(`photo.heic`);return}t=e}this.preview&&URL.revokeObjectURL(this.preview),this.photo=t,this.preview=URL.createObjectURL(t),this.mode=`preview`}render(){return E`
      <dialog aria-labelledby="title" @close=${this.onClose}>
        <header>
          <h2 id="title">${this.t(`photo.add`)}</h2>
          <button class="icon" aria-label=${this.t(`photo.close`)} @click=${()=>this.dialog?.close()}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </header>
        ${this.mode===`camera`?this.renderCamera():this.mode===`preview`?this.renderPreview():this.renderChoose()}
        ${this.error?E`<p class="error" role="alert">${this.error}</p>`:k}
      </dialog>
    `}renderChoose(){let e=this.live,t=navigator.userAgent,n=/Home Assistant\//.test(t),r=e?null:on(this.hass?.config?.external_url,location.pathname,t);return E`
      <div class="choices">
        ${e?E`<button class="choice" @click=${this.startCamera}>
              <ha-icon icon="mdi:camera"></ha-icon>${this.t(`photo.camera`)}
            </button>`:n?k:E`<label class="choice">
                <input type="file" accept="image/*" capture="environment" @change=${this.picked} />
                <ha-icon icon="mdi:camera"></ha-icon>${this.t(`photo.camera`)}
              </label>`}
        <label class="choice">
          <input type="file" accept="image/*" @change=${this.picked} />
          <ha-icon icon="mdi:image-multiple"></ha-icon>${this.t(`photo.gallery`)}
        </label>
      </div>
      ${e?k:E`<p class="hint">
            ${this.t(`photo.https_hint`)}
            ${r?E`<a href=${r}>${this.t(`photo.chrome`)}</a>`:k}
          </p>`}
    `}renderCamera(){return E`
      <div class="viewfinder"><video autoplay playsinline muted></video></div>
      <div class="row">
        <button class="secondary" @click=${this.again}>${this.t(`action.cancel`)}</button>
        <button class="primary" @click=${this.shoot}>
          <ha-icon icon="mdi:camera-iris"></ha-icon>${this.t(`photo.shoot`)}
        </button>
      </div>
    `}renderPreview(){return E`
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
          ${this.saving?this.t(`photo.saving`):this.t(this.local?`photo.use`:`photo.save`)}
        </button>
      </div>
    `}static{this.styles=[z,o`
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
    `]}};V([N({attribute:!1})],q.prototype,`hass`,void 0),V([N()],q.prototype,`plantId`,void 0),V([N({type:Boolean})],q.prototype,`open`,void 0),V([N({type:Boolean,reflect:!0})],q.prototype,`dark`,void 0),V([N({type:Boolean})],q.prototype,`local`,void 0),V([P()],q.prototype,`mode`,void 0),V([P()],q.prototype,`preview`,void 0),V([P()],q.prototype,`note`,void 0),V([P()],q.prototype,`saving`,void 0),V([P()],q.prototype,`error`,void 0),V([ze(`dialog`)],q.prototype,`dialog`,void 0),V([ze(`video`)],q.prototype,`video`,void 0);var An=50,J=class extends M{constructor(...e){super(...e),this.dark=!1,this.photos=[],this.cover=null,this.viewing=null,this.capturing=!1,this.confirmDelete=!1,this.listKey=``,this.swipeFrom=null,this.closeViewer=()=>{this.viewer?.close()},this.onViewerClosed=()=>{this.viewing=null,this.confirmDelete=!1},this.onKey=e=>{e.key===`ArrowLeft`&&this.step(-1),e.key===`ArrowRight`&&this.step(1)},this.onPointerDown=e=>{this.swipeFrom=e.clientX},this.onPointerUp=e=>{if(this.swipeFrom===null)return;let t=e.clientX-this.swipeFrom;this.swipeFrom=null,Math.abs(t)>=An&&this.step(t>0?-1:1)}}t(e,t){return I(this.hass,e,t)}capture(){this.capturing=!0}updated(){let e=this.plant;if(!e||!this.hass)return;let t=[e.id,e.photo?.id,e.recent[0]?.id].join(`|`);t!==this.listKey&&(this.listKey=t,this.reload()),this.viewing!==null&&this.viewer&&!this.viewer.open&&this.viewer.showModal()}async reload(){let e=this.plant;if(e&&this.hass)try{let t=await fn(this.hass,e.id);if(this.plant?.id!==e.id)return;this.photos=t.photos,this.cover=t.cover,this.viewing!==null&&this.viewing>=this.photos.length&&(this.viewing=this.photos.length?this.photos.length-1:null)}catch{this.listKey=``}}date(e){return new Intl.DateTimeFormat(F(this.hass),{dateStyle:`medium`}).format(new Date(e))}view(e){this.confirmDelete=!1,this.message=void 0,this.viewing=e}step(e){this.viewing!==null&&this.photos.length&&this.view((this.viewing+e+this.photos.length)%this.photos.length)}async useAsCover(e){if(this.hass&&this.plant)try{await pn(this.hass,this.plant.id,e.photo_id),this.cover=e.photo_id,this.message=this.t(`photo.cover_set`)}catch(e){this.message=this.t(`toast.failed`,{error:U(e)})}}async deletePhoto(e){if(this.hass){if(!this.confirmDelete){this.confirmDelete=!0;return}this.confirmDelete=!1;try{await Ue(this.hass,e.entry_id),this.photos=this.photos.filter(t=>t.entry_id!==e.entry_id),this.photos.length?this.viewing!==null&&(this.viewing=Math.min(this.viewing,this.photos.length-1)):this.closeViewer()}catch(e){this.message=this.t(`toast.failed`,{error:U(e)})}}}deletable(e){if(!this.hass)return!1;let t={id:e.entry_id,source:`card`,user_id:e.user_id??void 0};return Ke(this.hass,t)}render(){let e=this.plant;return E`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t(`section.photos`)}</h3>
          <button class="add" @click=${()=>this.capture()}>
            <ha-icon icon="mdi:camera-plus-outline"></ha-icon>${this.t(`photo.add_short`)}
          </button>
        </div>
        ${this.photos.length?E`<div class="grid">${this.photos.map((e,t)=>this.renderThumb(e,t))}</div>`:E`<p class="muted small">${this.t(`photo.empty`)}</p>`}
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
    `}renderThumb(e,t){let n=this.date(e.ts);return E`<button class="thumb" aria-label=${n} @click=${()=>this.view(t)}>
      <rootwise-auth-image
        .hass=${this.hass}
        plantId=${this.plant?.id??``}
        photoId=${e.photo_id}
        size="thumb"
        alt=${n}
      ></rootwise-auth-image>
      ${e.photo_id===this.cover?E`<span class="badge">${this.t(`photo.is_cover`)}</span>`:k}
    </button>`}renderViewer(){let e=this.viewing===null?void 0:this.photos[this.viewing];return E`<dialog
      class="viewer"
      aria-label=${this.t(`section.photos`)}
      @close=${this.onViewerClosed}
      @keydown=${this.onKey}
    >
      ${e?E`
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
              ${this.photos.length>1?E`<button class="round side prev" aria-label=${this.t(`photo.prev`)} @click=${()=>this.step(-1)}>
                      <ha-icon icon="mdi:chevron-left"></ha-icon>
                    </button>
                    <button class="round side next" aria-label=${this.t(`photo.next`)} @click=${()=>this.step(1)}>
                      <ha-icon icon="mdi:chevron-right"></ha-icon>
                    </button>`:k}
            </div>
            <div class="bar bottom">
              <span class="note">${e.note??``}</span>
              <span class="actions">
                ${e.photo_id===this.cover?E`<span class="pill">${this.t(`photo.is_cover`)}</span>`:E`<button class="pill" @click=${()=>void this.useAsCover(e)}>
                      <ha-icon icon="mdi:star-outline"></ha-icon>${this.t(`photo.cover`)}
                    </button>`}
                ${this.deletable(e)?E`<button class="pill danger" @click=${()=>void this.deletePhoto(e)}>
                      <ha-icon icon="mdi:delete-outline"></ha-icon>${this.confirmDelete?this.t(`photo.delete_confirm`):this.t(`photo.delete`)}
                    </button>`:k}
              </span>
            </div>
            ${this.message?E`<div class="message" role="status">${this.message}</div>`:k}
          `:k}
    </dialog>`}static{this.styles=[z,o`
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
    `]}};V([N({attribute:!1})],J.prototype,`hass`,void 0),V([N({attribute:!1})],J.prototype,`plant`,void 0),V([N({type:Boolean,reflect:!0})],J.prototype,`dark`,void 0),V([P()],J.prototype,`photos`,void 0),V([P()],J.prototype,`cover`,void 0),V([P()],J.prototype,`viewing`,void 0),V([P()],J.prototype,`capturing`,void 0),V([P()],J.prototype,`confirmDelete`,void 0),V([P()],J.prototype,`message`,void 0),V([ze(`dialog.viewer`)],J.prototype,`viewer`,void 0);async function jn(e){document.querySelector(`home-assistant`)&&await customElements.whenDefined(`home-assistant`);for(let[t,n]of e)customElements.get(t)||customElements.define(t,n)}var Mn=6e4,Nn=new Set([`no_sensor`,`no_value`,`too_close`,`unauthorized`]),Y=class extends H{constructor(...e){super(...e),this.plantId=``,this.busy=!1,this.hideSuggestion=!1,this.loadedFor=``}connectedCallback(){super.connectedCallback(),this.poll=window.setInterval(()=>{let e=this.data?.pending?.phase;(e===`draining`||e===`measuring`)&&this.run(`get`)},Mn)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this.poll)}get plant(){return this.payload?.plants.find(e=>e.id===this.plantId)}updated(e){super.updated(e);let t=`${this.plantId}|${this.plant?.calibration?.at??``}`;this.hass&&this.plantId&&t!==this.loadedFor&&(this.loadedFor=t,this.run(`get`))}async run(e){if(this.hass&&!this.busy){this.busy=!0,this.error=void 0;try{this.data=typeof e==`function`?await e():await Je(this.hass,this.plantId,e)}catch(e){let t=e.code;this.error=t&&Nn.has(t)?this.t(`calibration.error.${t}`):this.t(`toast.failed`,{error:U(e)})}finally{this.busy=!1}}}raw(e){return e==null?`?`:new Intl.NumberFormat(F(this.hass),{maximumFractionDigits:1}).format(e)}render(){if(this.hass&&!this.hass.user?.is_admin)return E`<div class="surface muted">${this.t(`calibration.error.unauthorized`)}</div>`;let e=this.data,t=this.plant;if(!e||!t)return E`<div class="surface muted">${this.error??`…`}</div>`;let n=e.calibration;return E`
      <section class="surface">
        <h2>${this.t(`calibration.headline`)}</h2>
        <p class="muted">${this.t(`calibration.intro`)}</p>
        ${this.renderScale(e)}
      </section>
      ${this.error?E`<div class="error" role="alert">${this.error}</div>`:k}
      ${n?.outdated?E`<div class="warn" role="status">${this.t(`calibration.outdated`)}</div>`:k}
      ${n?this.renderResult(e,t):k}
      ${!n&&e.suggestion&&!this.hideSuggestion?this.renderSuggestion(e):k}
      ${this.renderDry(e)} ${this.renderWet(e)}
    `}renderScale(e){let t=e.calibration?.dry??e.pending?.dry??null,n=e.calibration?.wet??e.pending?.wet??null,r=e=>`left:${Math.min(100,Math.max(0,e))}%`;return E`
      <div class="scale" role="img" aria-label=${`${this.t(`calibration.dry`)} ${this.raw(t)}, ${this.t(`calibration.wet`)} ${this.raw(n)}`}>
        <div class="track">
          ${t!==null&&n!==null?E`<div class="span" style="left:${t}%;width:${Math.max(0,n-t)}%"></div>`:k}
          ${t===null?k:E`<div class="mark dry" style=${r(t)}></div>`}
          ${n===null?k:E`<div class="mark wet" style=${r(n)}></div>`}
          ${e.current===null?k:E`<div class="now" style=${r(e.current)}></div>`}
        </div>
        <div class="ends muted"><span>0 % ${this.t(`calibration.raw`)}</span><span>100 %</span></div>
        <div class="legend">
          <span><i class="key dry"></i>${this.t(`calibration.dry`)} ${this.raw(t)}</span>
          <span><i class="key now"></i>${this.t(`calibration.now`)} ${this.t(`calibration.raw_value`,{value:this.raw(e.current)})}</span>
          <span><i class="key wet"></i>${this.t(`calibration.wet`)} ${this.raw(n)}</span>
        </div>
      </div>
    `}renderDry(e){let t=e.pending?.dry??e.calibration?.dry;return E`
      <section class="surface step ${t==null?``:`done`}">
        <div class="step-head">
          <span class="badge">${this.t(`calibration.step`,{n:1})}</span>
          <h3>${this.t(`calibration.dry_title`)}</h3>
        </div>
        ${t==null?E`<p class="muted">
              ${e.current===null?this.t(`calibration.dry_text_none`):this.t(`calibration.dry_text`,{value:this.raw(e.current)})}
            </p>`:E`<p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t(`calibration.dry_done`,{value:this.raw(t)})}</p>`}
        <div class="row">
          <button
            class=${t==null?`primary`:`secondary`}
            ?disabled=${this.busy||e.current===null}
            @click=${()=>void this.run(`dry`)}
          >
            ${t==null?this.t(`calibration.dry_save`):this.t(`calibration.again`)}
          </button>
        </div>
      </section>
    `}renderWet(e){let t=e.pending,n=t?.wet??e.calibration?.wet,r=t?.phase,i;if(r===`draining`&&t?.watered_at){let e=new Date(Date.parse(t.watered_at)+72e5),n=new Intl.DateTimeFormat(F(this.hass),{hour:`2-digit`,minute:`2-digit`}).format(e);i=E`<p class="muted"><ha-icon icon="mdi:water-sync"></ha-icon>${this.t(`calibration.draining`,{time:n})}</p>`}else i=r===`measuring`?E`
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow=${t?.hours??0}>
          <div style="width:${(t?.hours??0)/4*100}%"></div>
        </div>
        <p class="muted">${this.t(`calibration.measuring`,{hours:t?.hours??0,value:this.raw(t?.value)})}</p>
      `:r===`no_rise`?E`<p class="error-text">${this.t(`calibration.no_rise`)}</p>`:n==null?E`<p class="muted">${this.t(`calibration.wet_text`)}</p>`:E`<p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t(`calibration.wet_done`,{value:this.raw(n)})}</p>`;let a=r===`draining`||r===`measuring`;return E`
      <section class="surface step ${n!=null&&!a?`done`:``}">
        <div class="step-head">
          <span class="badge">${this.t(`calibration.step`,{n:2})}</span>
          <h3>${this.t(`calibration.wet_title`)}</h3>
        </div>
        ${i}
        ${a?k:E`<div class="row">
              <button
                class=${n==null?`primary`:`secondary`}
                ?disabled=${this.busy}
                @click=${()=>void this.run(`wet`)}
              >
                <ha-icon icon="mdi:watering-can"></ha-icon>${n==null?this.t(`calibration.wet_start`):this.t(`calibration.again`)}
              </button>
            </div>`}
        ${r===`too_close`?E`<p class="error-text">${this.t(`calibration.too_close`)}</p>`:k}
      </section>
    `}renderResult(e,t){let n=e.calibration;if(!n)return E``;let[r,i]=e.scale,a=e.current===null?null:Math.round(ft(n,e.current)),o=t.thresholds?.source===`custom`,s=e.style?this.t(`style.${e.style}`):this.t(`calibration.style_unknown`);return E`
      <section class="surface result">
        <h3><ha-icon icon="mdi:check-decagram"></ha-icon>${this.t(`calibration.done`)}</h3>
        <dl class="facts">
          <dt>${this.t(`calibration.result_dry`)}</dt><dd>${this.t(`calibration.raw_value`,{value:this.raw(n.dry)})}</dd>
          <dt>${this.t(`calibration.result_wet`)}</dt><dd>${this.t(`calibration.raw_value`,{value:this.raw(n.wet)})}</dd>
          <dt>${this.t(`calibration.now`)}</dt><dd>${a===null?`–`:`${a} %`}</dd>
        </dl>
        <p><b>${this.t(`calibration.thresholds`,{low:r,high:i})}</b></p>
        <p class="muted small">${this.t(`calibration.style`,{style:s})}</p>
        ${o?E`<p class="muted small">
                ${this.t(`calibration.custom`,{low:t.thresholds?.low,high:t.thresholds?.high})}
              </p>
              <div class="row">
                <button class="primary" ?disabled=${this.busy} @click=${()=>void this.useStyle(t)}>
                  ${this.t(`calibration.use_style`)}
                </button>
              </div>`:k}
        <div class="row">
          <button class="secondary" ?disabled=${this.busy} @click=${()=>void this.run(`clear`)}>
            ${this.t(`calibration.redo`)}
          </button>
        </div>
      </section>
    `}renderSuggestion(e){let t=e.suggestion;return t?E`
      <section class="surface suggestion">
        <h3><ha-icon icon="mdi:lightbulb-on-outline"></ha-icon>${this.t(`calibration.suggestion`)}</h3>
        <p>
          ${this.t(`calibration.suggestion_text`,{count:t.waterings,dry:this.raw(t.dry),wet:this.raw(t.wet)})}
        </p>
        <p class="muted small">${this.t(`calibration.suggestion_note`)}</p>
        <div class="row">
          <button class="secondary" @click=${()=>this.hideSuggestion=!0}>${this.t(`calibration.later`)}</button>
          <button
            class="primary"
            ?disabled=${this.busy}
            @click=${()=>{let e=this.hass;e&&this.run(()=>Ye(e,this.plantId,t.dry,t.wet))}}
          >
            ${this.t(`calibration.apply`)}
          </button>
        </div>
      </section>
    `:E``}async useStyle(e){if(this.hass)try{await Ge(this.hass,e.id)}catch(e){this.error=this.t(`toast.failed`,{error:U(e)})}}static{this.styles=[z,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
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
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      p {
        margin: 0;
        line-height: 1.45;
      }
      p ha-icon {
        margin-right: 6px;
        vertical-align: -4px;
      }
      .small {
        font-size: 13px;
      }
      .scale {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-top: 4px;
      }
      .track {
        position: relative;
        height: 14px;
        border-radius: 7px;
        background: var(--rw-track);
      }
      .span {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 7px;
        background: linear-gradient(90deg, var(--rw-warn-soft), var(--rw-water-soft));
      }
      .mark {
        position: absolute;
        top: -4px;
        width: 4px;
        height: 22px;
        margin-left: -2px;
        border-radius: 2px;
      }
      .mark.dry,
      .key.dry {
        background: var(--rw-warn);
      }
      .mark.wet,
      .key.wet {
        background: var(--rw-water);
      }
      .track .now {
        position: absolute;
        top: 1px;
        width: 12px;
        height: 12px;
        margin-left: -6px;
        border-radius: 50%;
        background: var(--rw-text);
        border: 2px solid var(--ha-card-background, var(--card-background-color, #fff));
      }
      .key {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 6px;
      }
      .key.now {
        border-radius: 50%;
        background: var(--rw-text);
      }
      .ends {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 16px;
        font-size: 13px;
      }
      .step-head {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .badge {
        align-self: flex-start;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 12px;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
      }
      .step.done .badge {
        background: var(--rw-accent);
        color: #fff;
      }
      .ok {
        color: var(--rw-accent);
        font-weight: 500;
      }
      .progress {
        height: 8px;
        border-radius: 4px;
        background: var(--rw-track);
        overflow: hidden;
      }
      .progress div {
        height: 100%;
        background: var(--rw-water);
        transition: width 0.4s;
      }
      .row {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
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
        opacity: 0.55;
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
        font-variant-numeric: tabular-nums;
      }
      .result h3 ha-icon {
        color: var(--rw-accent);
      }
      .suggestion h3 ha-icon {
        color: var(--rw-warn);
      }
      .error,
      .warn {
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
      }
      .error {
        background: var(--rw-prob-soft);
        color: var(--rw-prob);
      }
      .warn {
        background: var(--rw-warn-soft);
        color: var(--rw-warn);
      }
      .error-text {
        color: var(--rw-prob);
      }
    `]}};V([N()],Y.prototype,`plantId`,void 0),V([P()],Y.prototype,`data`,void 0),V([P()],Y.prototype,`busy`,void 0),V([P()],Y.prototype,`error`,void 0),V([P()],Y.prototype,`hideSuggestion`,void 0);var{I:Pn}=je,Fn=e=>e.strings===void 0,In={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ln=e=>(...t)=>({_$litDirective$:e,values:t}),Rn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},zn=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),zn(e,t);return!0},Bn=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},Vn=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),Wn(t)}};function Hn(e){this._$AN===void 0?this._$AM=e:(Bn(this),this._$AM=e,Vn(this))}function Un(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)zn(r[e],!1),Bn(r[e]);else r!=null&&(zn(r,!1),Bn(r))}else zn(this,e)}}var Wn=e=>{e.type==In.CHILD&&(e._$AP??=Un,e._$AQ??=Hn)},Gn=class extends Rn{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),Vn(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(zn(this,e),Bn(this))}setValue(e){if(Fn(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}},Kn=new WeakMap,qn=Ln(class extends Gn{render(e){return k}update(e,[t]){let n=t!==this.G;return n&&this.rt(void 0),(n||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),k}rt(e){if(this.G!==void 0){if(this.isConnected||(e=void 0),typeof this.G==`function`){let t=this.ht??globalThis,n=Kn.get(t);n===void 0&&(n=new WeakMap,Kn.set(t,n)),n.get(this.G)!==void 0&&this.G.call(this.ht,void 0),n.set(this.G,e),e!==void 0&&this.G.call(this.ht,e)}else this.G.value=e}}get lt(){return typeof this.G==`function`?Kn.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),Jn=new WeakMap;function Yn(e){return qn(t=>{if(!t)return;let n=JSON.stringify(e);Jn.get(t)!==n&&(Jn.set(t,n),t.setConfig(e))})}var Xn=6e5,Zn={cats:`mdi:cat`,dogs:`mdi:dog`,humans:`mdi:human-child`},Qn=class extends H{constructor(...e){super(...e),this.plantId=``,this.days=14,this.historyKey=``}connectedCallback(){super.connectedCallback(),this.refreshTimer=window.setInterval(()=>{this.historyKey=``,this.requestUpdate()},Xn)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this.refreshTimer)}get plant(){return this.payload?.plants.find(e=>e.id===this.plantId)}updated(e){super.updated(e);let t=this.plant;if(!t||!this.hass)return;let n=[t.id,this.days,t.last_watered,t.recent[0]?.id,t.calibration?.at].join(`|`);n!==this.historyKey&&(e.has(`plantId`)&&(this.history=void 0),this.historyKey=n,this.loadHistory(t.id,this.days))}async loadHistory(e,t){if(this.hass)try{let n=await qe(this.hass,e,t);this.plantId===e&&this.days===t&&(this.history=n)}catch{this.historyKey=``}}render(){if(!this.payload)return E`<div class="empty muted">…</div>`;let e=this.plant;return e?E`
      ${this.renderHero(e)}
      <rootwise-plant-card
        .hass=${this.hass}
        ${Yn({type:`custom:rootwise-plant-card`,plant_id:e.id,show_history:!0,embedded:!0})}
      ></rootwise-plant-card>
      ${e.thresholds||e.measurements.soil_moisture?this.renderChart():k}
      <rootwise-photo-gallery
        .hass=${this.hass}
        .plant=${e}
        ?dark=${!!this.hass?.themes?.darkMode}
      ></rootwise-photo-gallery>
      ${this.renderCalibration(e)} ${this.renderPot(e)} ${this.renderSpecies(e)}
    `:E`<div class="empty muted">${this.t(`panel.unknown`)}</div>`}renderHero(e){let t=[e.species.common,e.species.scientific].filter((e,t,n)=>!!e&&n.indexOf(e)===t),n=[e.area,e.pot.window===`none`?null:this.t(`window.${e.pot.window}`)];if(e.photo){let r=new Intl.DateTimeFormat(F(this.hass),{day:`numeric`,month:`numeric`}).format(new Date(e.photo.ts));return E`
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
            ${t.length?E`<div class="muted italic">${t.join(` · `)}</div>`:k}
            <div class="muted small">${this.t(`photo.cover_caption`,{date:r})}</div>
          </div>
        </section>
      `}return E`
      <section class="hero">
        <div class="photo">
          ${e.species.image_url?E`<img
                src=${e.species.image_url}
                alt=""
                @error=${e=>e.target.hidden=!0}
              />`:k}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="hero-text">
          <h2>${e.name}</h2>
          <div class="muted">${n.filter(Boolean).join(` · `)}</div>
          ${t.length?E`<div class="muted italic">${t.join(` · `)}</div>`:k}
        </div>
      </section>
    `}renderChart(){let e=this.history?gt(this.history).thresholds:null;return E`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t(`section.moisture`)}</h3>
          <div class="segments" role="group">
            ${[14,30].map(e=>E`<button
                aria-pressed=${e===this.days?`true`:`false`}
                @click=${()=>this.days=e}
              >
                ${this.t(`panel.days`,{days:e})}
              </button>`)}
          </div>
        </div>
        <rootwise-moisture-chart
          .data=${this.history}
          language=${F(this.hass)}
          ?dark=${!!this.hass?.themes?.darkMode}
          height="200"
        ></rootwise-moisture-chart>
        <div class="legend muted">
          <span><i class="key drop"></i>${this.t(`care.watered`)}</span>
          <span><i class="key dash"></i>${this.t(`chart.forecast`)}</span>
          ${e?E`<span
                ><i class="key band"></i>${this.t(`chart.target`,{low:Math.round(e.low),high:Math.round(e.high)})}</span
              >`:k}
        </div>
      </section>
    `}renderCalibration(e){if(!e.measurements.soil_moisture||!this.hass?.user?.is_admin)return k;let t=e.calibration;return E`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t(`calibration.section`)}</h3>
          <button class="link" @click=${()=>B(`${qt(e.id)}/calibrate`)}>
            ${this.t(t?`calibration.open`:`calibration.start`)}
          </button>
        </div>
        <p class="muted small">
          ${t?this.t(`calibration.section_done`,{dry:t.dry,wet:t.wet}):this.t(`calibration.section_none`)}
        </p>
        ${t?.outdated?E`<p class="warn small">${this.t(`calibration.outdated`)}</p>`:k}
      </section>
    `}renderPot(e){let t=this.hass?Rt(this.hass,e.pot.amount):null;return E`
      <section class="surface">
        <h3>${this.t(`section.pot`)}</h3>
        <div class="row">
          <ha-icon icon="mdi:pot-outline"></ha-icon>
          <span>${this.hass?zt(this.hass,e.pot):``}</span>
        </div>
        ${t&&this.hass?E`<div class="row">
              <ha-icon icon="mdi:cup-water"></ha-icon>
              <span>
                <b>${this.t(`amount.per_watering`,{amount:t})}</b><br />
                <span class="muted">${Bt(this.hass,e.pot)}</span>
              </span>
            </div>`:k}
      </section>
    `}renderSpecies(e){if(!this.hass)return k;let t=Ht(this.hass,e.species),n=Ut(this.hass,e.species);return!t.length&&!n?k:E`
      <section class="surface">
        <h3>${this.t(`section.species`)}</h3>
        ${t.length?E`<dl class="facts">
              ${t.map(e=>E`<dt>${e.label}</dt><dd>${e.text}</dd>`)}
            </dl>`:k}
        ${n?E`<div class="tox">
              <div class="tox-title">${this.t(`species.toxicity`)}</div>
              <div class="badges">
                ${n.badges.map(e=>E`<span class="badge ${e.level}">
                    <ha-icon icon=${Zn[e.key]}></ha-icon>${e.who}: ${e.text}
                  </span>`)}
              </div>
              <p class="muted small">
                ${[n.note,n.source,this.t(`tox.emergency`)].filter(Boolean).join(` `)}
              </p>
            </div>`:k}
      </section>
    `}static{this.styles=[z,o`
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
      .link {
        border: 0;
        background: none;
        padding: 6px 4px;
        color: var(--rw-accent);
        font-weight: 500;
      }
      .warn {
        color: var(--rw-warn);
      }
    `]}};V([N()],Qn.prototype,`plantId`,void 0),V([P()],Qn.prototype,`days`,void 0),V([P()],Qn.prototype,`history`,void 0);function $n(e){if(e===`/add`)return{kind:`add`};let t=/^\/plant\/([^/]+)(\/calibrate)?/.exec(e??``);if(!t?.[1])return{kind:`overview`};let n=decodeURIComponent(t[1]);return t[2]?{kind:`calibrate`,id:n}:{kind:`plant`,id:n}}function er(e){let t=new Map;for(let n of e)n.area_id&&n.area&&t.set(n.area_id,n.area);return[...t].map(([e,t])=>({id:e,name:t})).sort((e,t)=>e.name.localeCompare(t.name))}var X=class extends H{constructor(...e){super(...e),this.narrow=!1,this.area=null,this.toggleMenu=()=>{this.dispatchEvent(new CustomEvent(`hass-toggle-menu`,{bubbles:!0,composed:!0}))}}render(){let e=$n(this.route?.path),t=e.kind===`plant`||e.kind===`calibrate`?this.payload?.plants.find(t=>t.id===e.id):void 0,n=e.kind===`calibrate`?qt(e.id):Kt,r=e.kind===`overview`?this.t(`panel.title`):e.kind===`add`?this.t(`wizard.title`):e.kind===`calibrate`?this.t(`calibration.title`):t?.name??``;return E`
      <header class="toolbar">
        ${e.kind===`overview`?this.narrow?E`<button class="icon" aria-label=${this.t(`panel.menu`)} @click=${this.toggleMenu}>
                <ha-icon icon="mdi:menu"></ha-icon>
              </button>`:k:E`<button class="icon" aria-label=${this.t(`panel.back`)} @click=${()=>B(n)}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>`}
        <h1 class="title">${r}</h1>
        ${e.kind===`plant`&&t?.device_id&&this.hass?.user?.is_admin?E`<button
              class="icon"
              aria-label=${this.t(`panel.settings`)}
              title=${this.t(`panel.settings`)}
              @click=${()=>B(`/config/devices/device/${t.device_id}`)}
            >
              <ha-icon icon="mdi:tune-variant"></ha-icon>
            </button>`:k}
      </header>
      <main>
        ${e.kind===`overview`?this.renderOverview():e.kind===`add`?E`<rootwise-wizard-page .hass=${this.hass}></rootwise-wizard-page>`:e.kind===`calibrate`?E`<rootwise-calibration-page .hass=${this.hass} .plantId=${e.id}></rootwise-calibration-page>`:this.renderPlant(e.id)}
      </main>
    `}renderOverview(){let e=er(this.payload?.plants??[]),t=e.some(e=>e.id===this.area)?this.area:null;return E`
      ${e.length>1?E`<div class="chips" role="group" aria-label=${this.t(`panel.rooms`)}>
            ${[{id:null,name:this.t(`panel.all`)},...e].map(e=>E`<button
                class="chip"
                aria-pressed=${e.id===t?`true`:`false`}
                @click=${()=>this.area=e.id}
              >
                ${e.name}
              </button>`)}
          </div>`:k}
      <rootwise-overview-card
        .hass=${this.hass}
        ${Yn({type:`custom:rootwise-overview-card`,area_id:t??void 0,show_tiles:!0})}
      ></rootwise-overview-card>
      ${this.hass?.user?.is_admin?E`<button class="fab" @click=${()=>B(`${Kt}/add`)}>
            <ha-icon icon="mdi:plus"></ha-icon>${this.t(`panel.add`)}
          </button>`:k}
    `}renderPlant(e){return E`<rootwise-plant-page .hass=${this.hass} .plantId=${e}></rootwise-plant-page>`}static{this.styles=[z,o`
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
      .fab {
        position: fixed;
        right: calc(16px + env(safe-area-inset-right, 0px));
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        z-index: 3;
        min-height: 56px;
        padding: 0 22px 0 18px;
        border: 0;
        border-radius: 28px;
        background: var(--rw-accent);
        color: #fff;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
      }
      main {
        padding-bottom: 88px;
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
    `]}};V([N({type:Boolean})],X.prototype,`narrow`,void 0),V([N({attribute:!1})],X.prototype,`route`,void 0),V([N({attribute:!1})],X.prototype,`panel`,void 0),V([P()],X.prototype,`area`,void 0);var Z=[`moisture_sensor`,`temperature_sensor`,`humidity_sensor`,`illuminance_sensor`,`conductivity_sensor`,`battery_sensor`],tr=[{key:`s`,diameter:12,upTo:12},{key:`m`,diameter:18,upTo:20},{key:`l`,diameter:24,upTo:28},{key:`xl`,diameter:32,upTo:1/0}];function nr(e){return(tr.find(t=>e<=t.upTo)??tr[tr.length-1])?.key??`m`}function rr(e,t){let n=Object.fromEntries(Z.map(t=>[t,e.suggested[t]??null]));return!n.moisture_sensor&&t&&(n.moisture_sensor=e.candidates.moisture_sensor.find(e=>!e.in_use&&e.area===t)?.entity_id??null),n}function ir(e){return e?e.common||e.label:``}function ar(e,t,n,r){let i=Z.filter(e=>n[e]).length;return[t,i?L(e,`wizard.sensors`,i):I(e,`wizard.no_sensors`),I(e,`wizard.pot`,{diameter:r})].filter(Boolean).join(` · `)}var Q=[`photo`,`species`,`basics`,`sensors`,`pot`,`done`],or=[`plastic`,`terracotta`,`ceramic_glazed`,`self_watering`],sr=[`none`,`n`,`ne`,`e`,`se`,`s`,`sw`,`w`,`nw`],cr=[`indoor`,`balcony`,`outdoor`],lr={moisture_sensor:`soil_moisture`,temperature_sensor:`temperature`,humidity_sensor:`air_humidity`,illuminance_sensor:`illuminance`,conductivity_sensor:`conductivity`,battery_sensor:`battery`},ur=new Set([`name_missing`,`sensor_in_use`,`unknown_species`,`unknown_area`,`unknown_sensor`,`opb_failed`,`unauthorized`]),dr=300,fr=2e4,pr=8e3,mr=()=>Object.fromEntries(Z.map(e=>[e,null])),$=class extends H{constructor(...e){super(...e),this.step=`photo`,this.capturing=!1,this.query=``,this.chosen=null,this.name=``,this.areaId=null,this.picked=mr(),this.diameter=18,this.material=`plastic`,this.drainage=!0,this.window=`none`,this.location=`indoor`,this.placeOpen=!1,this.busy=!1,this.photoFailed=!1,this.nameTouched=!1,this.started=Date.now(),this.createdAt=0,this.next=()=>{let e=Q.indexOf(this.step);this.step===`pot`?this.create():this.go(Q[e+1]??`done`)},this.back=()=>{let e=Q.indexOf(this.step);e<=0?B(Kt):this.go(Q[e-1]??`photo`)},this.photoTaken=e=>{this.photoUrl&&URL.revokeObjectURL(this.photoUrl),this.photo=e.detail.photo,this.photoUrl=URL.createObjectURL(e.detail.photo)},this.onQuery=e=>{this.query=e.target.value,window.clearTimeout(this.searchTimer),this.searchTimer=window.setTimeout(()=>void this.search(),dr)}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.searchTimer),this.photoUrl&&URL.revokeObjectURL(this.photoUrl)}go(e){this.error=void 0,e===`basics`&&!this.nameTouched&&(this.name=ir(this.chosen)),e===`sensors`&&this.loadSensors(),this.step=e,this.renderRoot.querySelector(`main`)?.scrollIntoView({block:`start`})}get areas(){return Object.values(this.hass?.areas??{}).map(e=>({id:e.area_id,name:e.name})).sort((e,t)=>e.name.localeCompare(t.name))}get areaName(){return this.areas.find(e=>e.id===this.areaId)?.name??null}async search(){let e=this.query.trim();if(!this.hass||e.length<2){this.results=void 0;return}try{let t=await Ze(this.hass,e);this.query.trim()===e&&(this.results=t)}catch(e){this.error=this.t(`toast.failed`,{error:U(e)})}}choose(e){if(e.source===`offline`){this.chosen={kind:`offline`,id:e.id,label:e.label,common:e.common};return}this.chosen={kind:`opb`,pid:e.pid,label:e.label,common:null};let t=this.hass;t&&Qe(t,e.pid).then(({info:t})=>{this.chosen?.kind===`opb`&&this.chosen.pid===e.pid&&(this.chosen={...this.chosen,common:t.common??null})},()=>void 0)}async loadSensors(e){if(!this.hass)return;let t=`${this.areaId??``}|${e??``}`;if(!(e===void 0&&this.sensorsFor?.startsWith(`${this.areaId??``}|`))){this.sensorsFor=t;try{let t=await $e(this.hass,this.areaId,e??null),n=rr(t,this.areaName);if(e===void 0&&n.moisture_sensor&&(t=await $e(this.hass,this.areaId,n.moisture_sensor),n={...rr(t,this.areaName),moisture_sensor:n.moisture_sensor}),this.suggestions=t,e===void 0)this.picked=n;else{let e={...this.picked};for(let t of Z)e[t]??=n[t];this.picked=e}}catch(e){this.error=this.t(`toast.failed`,{error:U(e)})}}}pick(e,t){this.picked={...this.picked,[e]:t||null},e===`moisture_sensor`&&t&&this.loadSensors(t)}async create(){let e=this.hass;if(e&&!this.busy){this.busy=!0,this.error=void 0;try{let t=Object.fromEntries(Z.filter(e=>this.picked[e]).map(e=>[e,this.picked[e]])),n=await Xe(e,{name:this.name,area_id:this.areaId,species:this.chosen?.kind===`offline`?this.chosen.id:null,opb_pid:this.chosen?.kind===`opb`?this.chosen.pid:null,sensors:t,pot:{pot_diameter:this.diameter,pot_material:this.material,drainage:this.material===`self_watering`||this.drainage,window:this.window,location:this.location}});await this.appeared(n),this.photo&&await ln(e,n,this.photo).catch(()=>{this.photoFailed=!0}),this.createdId=n,this.createdAt=Date.now(),this.go(`done`)}catch(e){let t=e.code;this.error=t&&ur.has(t)?this.t(`wizard.error.${t}`):this.t(`toast.failed`,{error:U(e)})}finally{this.busy=!1}}}appeared(e){return new Promise(t=>{let n=Date.now()+fr,r=()=>{this.payload?.plants.some(t=>t.id===e)||Date.now()>n?t():window.setTimeout(r,300)};r()})}async calibrateWet(){let e=this.hass,t=this.createdId;if(e&&t)try{await Je(e,t,`wet`),B(`${qt(t)}/calibrate`)}catch(e){this.error=this.t(`toast.failed`,{error:U(e)})}}render(){if(this.hass&&!this.hass.user?.is_admin)return E`<div class="surface muted">${this.t(`wizard.error.unauthorized`)}</div>`;let e=Q.indexOf(this.step);return E`
      <div class="progress" aria-hidden="true"><div style="width:${(e+1)/Q.length*100}%"></div></div>
      <div class="muted small">${this.t(`wizard.step`,{n:e+1})} · ${this.t(`wizard.steps.${this.step}`)}</div>
      <main>${this.renderStep()}</main>
      ${this.error?E`<div class="error" role="alert">${this.error}</div>`:k}
      ${this.step===`done`?k:this.renderNav()}
      <rootwise-photo-capture
        .hass=${this.hass}
        local
        ?open=${this.capturing}
        ?dark=${!!this.hass?.themes?.darkMode}
        @rootwise-photo-closed=${()=>this.capturing=!1}
        @rootwise-photo-taken=${this.photoTaken}
      ></rootwise-photo-capture>
    `}renderNav(){let e=this.step===`photo`?!!this.photo:this.step===`species`?!!this.chosen:this.step!==`basics`||!!this.name.trim(),t=this.step===`photo`||this.step===`species`;return E`
      <nav class="row">
        <button class="secondary" ?disabled=${this.busy} @click=${this.back}>${this.t(`wizard.back`)}</button>
        <span class="grow"></span>
        ${t?E`<button class="secondary" @click=${()=>this.go(Q[Q.indexOf(this.step)+1]??`basics`)}>
              ${this.t(`wizard.skip`)}
            </button>`:k}
        <button class="primary" ?disabled=${!e||this.busy} @click=${this.next}>
          ${this.step===`pot`?this.busy?this.t(`wizard.creating`):this.t(`wizard.create`):this.t(`wizard.next`)}
        </button>
      </nav>
    `}renderStep(){switch(this.step){case`photo`:return this.renderPhoto();case`species`:return this.renderSpecies();case`basics`:return this.renderBasics();case`sensors`:return this.renderSensors();case`pot`:return this.renderPot();default:return this.renderDone()}}renderPhoto(){return E`
      <section class="surface">
        <h2>${this.t(`wizard.photo_title`)}</h2>
        <p class="muted">${this.t(`wizard.photo_text`)}</p>
        ${this.photoUrl?E`<img class="preview" src=${this.photoUrl} alt="" />
              <p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t(`wizard.photo_done`)}</p>`:k}
        <button class="choice" @click=${()=>this.capturing=!0}>
          <ha-icon icon="mdi:camera"></ha-icon>${this.photoUrl?this.t(`wizard.photo_change`):this.t(`wizard.photo_take`)}
        </button>
      </section>
    `}renderSpecies(){let e=this.results;return E`
      <section class="surface">
        <h2>${this.t(`wizard.species_title`)}</h2>
        <label class="search">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            .value=${this.query}
            placeholder=${this.t(`wizard.species_search`)}
            aria-label=${this.t(`wizard.species_search`)}
            @input=${this.onQuery}
          />
        </label>
        ${e?.opb_failed?E`<p class="warn small">${this.t(`wizard.species_opb_failed`)}</p>`:k}
        ${e&&!e.species.length?E`<p class="muted small">${this.t(`wizard.species_none`)}</p>`:k}
        ${e?.species.length?E`<ul class="hits" role="listbox" aria-label=${this.t(`wizard.species_title`)}>
              ${e.species.map(e=>this.renderHit(e))}
            </ul>`:k}
        ${this.chosen?E`<p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t(`wizard.species_chosen`,{name:this.chosen.label})}</p>`:E`<p class="muted small">${this.t(`wizard.species_hint`)}</p>`}
      </section>
    `}renderHit(e){return E`<li>
      <button class="hit" role="option" aria-selected=${e.source===`offline`&&this.chosen?.kind===`offline`&&this.chosen.id===e.id||e.source===`openplantbook`&&this.chosen?.kind===`opb`&&this.chosen.pid===e.pid?`true`:`false`} @click=${()=>this.choose(e)}>
        <span>${e.label}</span>
        <span class="tag">${e.source===`openplantbook`?`OpenPlantbook`:this.t(`wizard.offline`)}</span>
      </button>
    </li>`}renderBasics(){return E`
      <section class="surface">
        <h2>${this.t(`wizard.steps.basics`)}</h2>
        <label class="field">
          <span class="muted">${this.t(`wizard.name`)}</span>
          <input
            type="text"
            maxlength="60"
            .value=${this.name}
            @input=${e=>{this.nameTouched=!0,this.name=e.target.value}}
          />
        </label>
        <div class="field">
          <span class="muted">${this.t(`wizard.room`)}</span>
          <div class="chips" role="group" aria-label=${this.t(`wizard.room`)}>
            ${[{id:null,name:this.t(`wizard.no_room`)},...this.areas].map(e=>E`<button
                class="chip"
                aria-pressed=${e.id===this.areaId?`true`:`false`}
                @click=${()=>{this.areaId=e.id,this.sensorsFor=void 0}}
              >
                ${e.name}
              </button>`)}
          </div>
        </div>
      </section>
    `}renderSensors(){let e=this.suggestions,t=this.areaName;return E`
      <section class="surface">
        <h2>${t?this.t(`wizard.sensors_in`,{room:t}):this.t(`wizard.steps.sensors`)}</h2>
        <p class="muted small">${this.t(`wizard.sensors_text`)}</p>
        ${e?Z.map(t=>this.renderRole(t,e)):E`<p class="muted">…</p>`}
      </section>
    `}renderRole(e,t){let n=t.candidates[e]??[];if(!n.length)return e===`illuminance_sensor`?E`<p class="muted small"><ha-icon icon="mdi:white-balance-sunny"></ha-icon>${this.t(`wizard.no_light`)}</p>`:k;let r=n.find(t=>t.entity_id===this.picked[e]),i=this.t(`m.${lr[e]}`);return E`
      <label class="sensor">
        <span class="sensor-head">
          <span>${i}</span>
          ${r?E`<b class="num">${r.state}${r.unit?` ${r.unit}`:``}</b>`:k}
        </span>
        <select aria-label=${i} @change=${t=>this.pick(e,t.target.value)}>
          <option value="" ?selected=${!this.picked[e]}>${this.t(`wizard.sensor_none`)}</option>
          ${n.map(t=>E`<option value=${t.entity_id} ?selected=${t.entity_id===this.picked[e]} ?disabled=${t.in_use}>
              ${t.name}${t.area?` · ${t.area}`:``}${t.in_use?` (${this.t(`wizard.in_use`)})`:``}
            </option>`)}
        </select>
      </label>
    `}renderPot(){let e=nr(this.diameter);return E`
      <section class="surface">
        <h2>${this.t(`wizard.steps.pot`)}</h2>
        <div class="field">
          <span class="muted">${this.t(`wizard.diameter`)}</span>
          <div class="chips" role="group" aria-label=${this.t(`wizard.diameter`)}>
            ${tr.map(t=>E`<button
                class="chip"
                aria-pressed=${t.key===e?`true`:`false`}
                @click=${()=>this.diameter=t.diameter}
              >
                ${this.t(`wizard.size.${t.key}`)}
              </button>`)}
          </div>
          <label class="inline">
            <span class="muted small">${this.t(`wizard.diameter_exact`)}</span>
            <input
              type="number"
              min="5"
              max="80"
              step="1"
              .value=${String(this.diameter)}
              @input=${e=>{let t=Number(e.target.value);t>=5&&t<=80&&(this.diameter=t)}}
            />
          </label>
        </div>
        <div class="field">
          <span class="muted">${this.t(`wizard.material`)}</span>
          <div class="chips" role="group" aria-label=${this.t(`wizard.material`)}>
            ${or.map(e=>E`<button
                class="chip"
                aria-pressed=${e===this.material?`true`:`false`}
                @click=${()=>this.material=e}
              >
                ${this.t(`pot.${e}`)}
              </button>`)}
          </div>
        </div>
        <button class="toggle" aria-expanded=${this.placeOpen?`true`:`false`} @click=${()=>this.placeOpen=!this.placeOpen}>
          <span>${this.t(`wizard.place`)}</span>
          <span class="muted small">${this.t(`window.${this.window}`)} · ${this.t(`location.${this.location}`)}</span>
          <ha-icon icon=${this.placeOpen?`mdi:chevron-up`:`mdi:chevron-down`}></ha-icon>
        </button>
        ${this.placeOpen?this.renderPlace():k}
      </section>
    `}renderPlace(){return E`
      <label class="field">
        <span class="muted">${this.t(`wizard.window`)}</span>
        <select @change=${e=>this.window=e.target.value}>
          ${sr.map(e=>E`<option value=${e} ?selected=${e===this.window}>${this.t(`window.${e}`)}</option>`)}
        </select>
      </label>
      <div class="field">
        <span class="muted">${this.t(`wizard.location`)}</span>
        <div class="chips" role="group" aria-label=${this.t(`wizard.location`)}>
          ${cr.map(e=>E`<button
              class="chip"
              aria-pressed=${e===this.location?`true`:`false`}
              @click=${()=>this.location=e}
            >
              ${this.t(`location.${e}`)}
            </button>`)}
        </div>
      </div>
      ${this.material===`self_watering`?k:E`<label class="check">
            <input
              type="checkbox"
              .checked=${this.drainage}
              @change=${e=>this.drainage=e.target.checked}
            />
            <span>${this.t(`wizard.drainage`)}</span>
          </label>`}
    `}renderDone(){let e=this.payload?.plants.find(e=>e.id===this.createdId),t=Math.max(1,Math.round((this.createdAt-this.started)/1e3)),n=e?.thresholds?.waterings??0,r=Date.now()-this.createdAt<pr,i=this.createdId;return E`
      <section class="surface done">
        <ha-icon class="big" icon="mdi:check-circle"></ha-icon>
        <h2>${this.t(`wizard.done_title`,{name:this.name.trim()})}</h2>
        <p class="muted">
          ${this.t(`wizard.done_time`,{seconds:new Intl.NumberFormat(F(this.hass)).format(t)})}
          ${this.hass?ar(this.hass,this.areaName,this.picked,this.diameter):``}
        </p>
        ${this.photoFailed?E`<p class="warn small">${this.t(`wizard.photo_upload_failed`)}</p>`:k}
        ${this.picked.moisture_sensor?E`<p class="info">
              <ha-icon icon="mdi:chart-bell-curve-cumulative"></ha-icon>
              ${n?L(this.hass,`wizard.done_waterings`,n):r?this.t(`wizard.done_reading`):k}
            </p>`:k}
        <div class="column">
          ${this.picked.moisture_sensor?E`<button class="secondary wide" @click=${()=>void this.calibrateWet()}>
                <ha-icon icon="mdi:water"></ha-icon>${this.t(`wizard.calibrate_wet`)}
              </button>`:k}
          <button class="primary wide" @click=${()=>i&&B(qt(i))}>${this.t(`wizard.open`)}</button>
        </div>
      </section>
    `}static{this.styles=[z,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      main {
        display: contents;
      }
      .progress {
        height: 6px;
        border-radius: 3px;
        background: var(--rw-track);
        overflow: hidden;
      }
      .progress div {
        height: 100%;
        background: var(--rw-accent);
        transition: width 0.3s;
      }
      .small {
        font-size: 13px;
      }
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      p {
        margin: 0;
        line-height: 1.45;
      }
      p ha-icon {
        margin-right: 6px;
        vertical-align: -4px;
      }
      .preview {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: 14px;
      }
      .choice {
        min-height: 88px;
        border-radius: 16px;
        border: 1px dashed var(--rw-accent);
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 15px;
        font-weight: 500;
      }
      .choice ha-icon {
        --mdc-icon-size: 30px;
      }
      .ok {
        color: var(--rw-accent);
        font-weight: 500;
      }
      .warn {
        color: var(--rw-warn);
      }
      .search {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border-radius: 22px;
        border: 1px solid var(--rw-line);
        min-height: 44px;
      }
      .search input {
        flex: 1;
        border: 0;
        background: none;
        font: inherit;
        font-size: 15px;
        color: var(--rw-text);
        min-width: 0;
        outline: none;
      }
      .hits {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .hit {
        width: 100%;
        min-height: 44px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid var(--rw-line);
        background: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        text-align: left;
      }
      .hit[aria-selected="true"] {
        border-color: var(--rw-accent);
        background: var(--rw-accent-soft);
      }
      .tag {
        flex-shrink: 0;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--rw-track);
        color: var(--rw-text2);
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 14px;
      }
      .field input,
      .field select,
      .sensor select,
      .inline input {
        font: inherit;
        font-size: 15px;
        min-height: 44px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--rw-line);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--rw-text);
      }
      .inline {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .inline input {
        width: 90px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 20px;
        border: 1px solid var(--rw-line);
        background: none;
        font-size: 14px;
      }
      .chip[aria-pressed="true"] {
        background: var(--rw-accent-soft);
        border-color: var(--rw-accent);
        color: var(--rw-accent);
        font-weight: 500;
      }
      .sensor {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sensor-head {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
      }
      .num {
        font-variant-numeric: tabular-nums;
      }
      .toggle {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas: "title icon" "sub icon";
        align-items: center;
        text-align: left;
        border: 0;
        background: none;
        padding: 6px 0;
      }
      .toggle span:first-child {
        grid-area: title;
      }
      .toggle .small {
        grid-area: sub;
      }
      .toggle ha-icon {
        grid-area: icon;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .check input {
        width: 20px;
        height: 20px;
      }
      .row {
        display: flex;
        gap: 10px;
        align-items: center;
        position: sticky;
        bottom: 0;
        padding: 10px 0 calc(10px + env(safe-area-inset-bottom, 0px));
        background: var(--primary-background-color);
      }
      .grow {
        flex: 1;
      }
      .row button,
      .column button {
        min-height: 44px;
        padding: 0 18px;
        border-radius: 22px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
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
        opacity: 0.5;
      }
      .done {
        align-items: center;
        text-align: center;
      }
      .done .big {
        --mdc-icon-size: 56px;
        color: var(--rw-accent);
      }
      .info {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--rw-water-soft);
        text-align: left;
      }
      .column {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-self: stretch;
      }
      .wide {
        width: 100%;
      }
      .error {
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--rw-prob-soft);
        color: var(--rw-prob);
        font-size: 14px;
      }
    `]}};V([P()],$.prototype,`step`,void 0),V([P()],$.prototype,`photo`,void 0),V([P()],$.prototype,`photoUrl`,void 0),V([P()],$.prototype,`capturing`,void 0),V([P()],$.prototype,`query`,void 0),V([P()],$.prototype,`results`,void 0),V([P()],$.prototype,`chosen`,void 0),V([P()],$.prototype,`name`,void 0),V([P()],$.prototype,`areaId`,void 0),V([P()],$.prototype,`suggestions`,void 0),V([P()],$.prototype,`picked`,void 0),V([P()],$.prototype,`diameter`,void 0),V([P()],$.prototype,`material`,void 0),V([P()],$.prototype,`drainage`,void 0),V([P()],$.prototype,`window`,void 0),V([P()],$.prototype,`location`,void 0),V([P()],$.prototype,`placeOpen`,void 0),V([P()],$.prototype,`busy`,void 0),V([P()],$.prototype,`error`,void 0),V([P()],$.prototype,`createdId`,void 0),V([P()],$.prototype,`photoFailed`,void 0);var hr={language:document.documentElement.lang||navigator.language};window.customCards=window.customCards??[];for(let e of[`overview`,`plant`])window.customCards.push({type:`rootwise-${e}-card`,name:I(hr,`picker.${e}.name`),description:I(hr,`picker.${e}.description`),preview:!0,documentationURL:`https://github.com/michi-walchsi/ha-rootwise`});jn([[`rootwise-auth-image`,G],[`rootwise-moisture-chart`,K],[`rootwise-photo-capture`,q],[`rootwise-photo-gallery`,J],[`rootwise-overview-card`,Zt],[`rootwise-plant-card`,W],[`rootwise-plant-page`,Qn],[`rootwise-calibration-page`,Y],[`rootwise-wizard-page`,$],[`rootwise-panel`,X]]),console.info(`%c ROOTWISE-CARDS %c 0.3.1 `,`background:#2e7d32;color:#fff`,``);