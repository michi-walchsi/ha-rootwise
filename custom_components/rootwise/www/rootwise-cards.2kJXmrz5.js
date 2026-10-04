var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,ee=g?g.emptyScript:``,_=h.reactiveElementPolyfillSupport,v=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?ee:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},b=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=new WeakMap;var S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(v(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?y:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?y:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??b)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:`open`},S[v(`elementProperties`)]=new Map,S[v(`finalized`)]=new Map,_?.({ReactiveElement:S}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var C=globalThis,te=e=>e,w=C.trustedTypes,T=w?w.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,E=`$lit$`,D=`lit$${Math.random().toFixed(9).slice(2)}$`,ne=`?`+D,re=`<${ne}>`,O=document,k=()=>O.createComment(``),A=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ie=Array.isArray,ae=e=>ie(e)||typeof e?.[Symbol.iterator]==`function`,oe=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,se=/-->/g,ce=/>/g,M=RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),le=/'/g,ue=/"/g,de=/^(?:script|style|textarea|title)$/i,fe=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),N=fe(1),P=fe(2),F=Symbol.for(`lit-noChange`),I=Symbol.for(`lit-nothing`),pe=new WeakMap,L=O.createTreeWalker(O,129);function me(e,t){if(!ie(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return T===void 0?t:T.createHTML(t)}var he=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=j;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===j?c[1]===`!--`?o=se:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=M):(de.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=M):o=ce:o===M?c[0]===`>`?(o=i??j,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?M:c[3]===`"`?ue:le):o===ue||o===le?o=M:o===se||o===ce?o=j:(o=M,i=void 0);let d=o===M&&e[t+1].startsWith(`/>`)?` `:``;a+=o===j?n+re:l>=0?(r.push(s),n.slice(0,l)+E+n.slice(l)+D+d):n+D+(l===-2?t:d)}return[me(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},ge=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=he(t,n);if(this.el=e.createElement(l,r),L.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=L.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(E)){let t=u[o++],n=i.getAttribute(e).split(D),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ye:r[1]===`?`?be:r[1]===`@`?xe:z}),i.removeAttribute(e)}else e.startsWith(D)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(de.test(i.tagName)){let e=i.textContent.split(D),t=e.length-1;if(t>0){i.textContent=w?w.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],k()),L.nextNode(),c.push({type:2,index:++a});i.append(e[t],k())}}}else if(i.nodeType===8){if(i.data===ne)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(D,e+1))!==-1;)c.push({type:7,index:a}),e+=D.length-1}}a++}}static createElement(e,t){let n=O.createElement(`template`);return n.innerHTML=e,n}};function R(e,t,n=e,r){if(t===F)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=A(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=R(e,i._$AS(e,t.values),i,r)),t}var _e=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??O).importNode(t,!0);L.currentNode=r;let i=L.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new ve(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Se(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=L.nextNode(),a++)}return L.currentNode=O,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},ve=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=R(this,e,t),A(e)?e===I||e==null||e===``?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==F&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ae(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&A(this._$AH)?this._$AA.nextSibling.data=e:this.T(O.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=ge.createElement(me(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new _e(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=pe.get(e.strings);return t===void 0&&pe.set(e.strings,t=new ge(e)),t}k(t){ie(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(k()),this.O(k()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=te(e).nextSibling;te(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},z=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=R(this,e,t,0),a=!A(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=R(this,r[n+o],t,o),s===F&&(s=this._$AH[o]),a||=!A(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ye=class extends z{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},be=class extends z{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},xe=class extends z{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=R(this,e,t,0)??I)===F)return;let n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Se=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){R(this,e)}},Ce=C.litHtmlPolyfillSupport;Ce?.(ge,ve),(C.litHtmlVersions??=[]).push(`3.3.3`);var we=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new ve(t.insertBefore(k(),e),e,void 0,n??{})}return i._$AI(e),i},Te=globalThis,B=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=we(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};B._$litElement$=!0,B.finalized=!0,Te.litElementHydrateSupport?.({LitElement:B});var Ee=Te.litElementPolyfillSupport;Ee?.({LitElement:B}),(Te.litElementVersions??=[]).push(`4.2.2`);var De={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:b},Oe=(e=De,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function V(e){return(t,n)=>typeof n==`object`?Oe(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function H(e){return V({...e,state:!0,attribute:!1})}var ke=new WeakMap;function Ae(e,t){let n=e.connection,r=ke.get(n);if(!r){let e={listeners:new Set};e.unsubscribe=n.subscribeMessage(t=>{e.last=t,e.listeners.forEach(e=>e(t))},{type:`rootwise/plants/subscribe`}),ke.set(n,e),r=e}let i=r;return i.listeners.add(t),i.last&&t(i.last),()=>{i.listeners.delete(t),i.listeners.size===0&&(ke.delete(n),i.unsubscribe?.then(e=>e()).catch(()=>void 0))}}async function je(e,t,n,r){let i={type:`rootwise/care/log`,plant_id:t,care_type:n};return r&&(i.when=r.toISOString()),(await e.callWS(i)).entry}async function Me(e,t){await e.callWS({type:`rootwise/care/delete`,entry_id:t})}async function Ne(e,t){await e.callWS({type:`call_service`,domain:`button`,service:`press`,target:{entity_id:t}})}async function Pe(e,t){await e.callWS({type:`rootwise/thresholds/reset`,plant_id:t})}function Fe(e,t){let n=e.user;return n?n.is_admin||t.source===`auto`?!0:t.user_id!==void 0&&t.user_id===n.id:!1}var Ie={"status.ok":`All good`,"status.thirsty":`Needs water`,"status.too_wet":`Too wet`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Not watered yet`,"level.dry":`Dry`,"level.drying":`Water soon`,"level.ok":`Just right`,"level.fresh":`Wet, freshly watered`,"level.too_wet":`Too wet`,"m.soil_moisture":`Soil moisture`,"m.temperature":`Temperature`,"m.air_humidity":`Air humidity`,"m.illuminance":`Light`,"m.conductivity":`Fertilizer`,"m.battery":`Battery`,"care.watered":`Watered`,"care.fertilized":`Fertilized`,"care.repotted":`Repotted`,"care.cleaned":`Leaves cleaned`,"care.rotated":`Rotated`,"care.pest_check":`Checked for pests`,"care.pruned":`Pruned`,"care.sensor_moved":`Sensor moved`,"care.note":`Note`,"action.water":`Watered`,"action.undo":`Undo`,"action.snooze":`+1 day`,"action.more":`More`,"action.delete":`Delete`,"action.cancel":`Cancel`,"action.save":`Save`,"when.title":`When did you water?`,"when.now":`Just now`,"when.hours":`A few hours ago`,"when.yesterday":`Yesterday`,"when.pick":`Pick date and time`,"toast.logged":`{type} logged`,"toast.deleted":`Entry deleted`,"toast.failed":`That didn't work: {error}`,last_watered:`Watered {time}`,never_watered:`No watering logged yet`,history:`History`,"history.empty":`Nothing logged yet`,snoozed_until:`Snoozed until {time}`,vacation:`Vacation mode is on`,"reason.below_threshold":`Soil moisture {value} % is below {threshold} %`,"reason.too_wet":`Soil moisture {value} % above {threshold} % for two days`,"reason.sensor_offline":`No data from the soil sensor`,"reason.snoozed":`Snoozed`,"reason.just_watered":`Just watered`,"reason.interval_due":`Due after {days} days`,"reason.no_history":`Log the first watering to start the reminder`,"hint.temperature_low":`Too cold: {value} °C, at least {min} °C`,"hint.temperature_high":`Too warm: {value} °C, at most {max} °C`,"hint.air_humidity_low":`Air too dry: {value} %, at least {min} %`,"hint.air_humidity_high":`Air too humid: {value} %, at most {max} %`,"hint.illuminance_low":`Too dark: {value} lx, at least {min} lx`,"hint.illuminance_high":`Too bright: {value} lx, at most {max} lx`,"hint.conductivity_low":`Little fertilizer: {value} µS/cm, at least {min}`,"hint.conductivity_high":`Too much fertilizer: {value} µS/cm, at most {max}`,"hint.battery_low":`Sensor battery low: {value} %`,"overview.title":`Plants`,"overview.today":`Water today`,"overview.none":`Nobody is thirsty`,"overview.all_done":`Mark all as watered`,"overview.empty":`No plants yet. Add one under Settings → Devices & services → Rootwise.`,not_loaded:`Rootwise is not loaded.`,unknown_plant:`Pick a plant in the card settings.`,"target.range":`target {min}–{max}`,"target.min":`at least {min}`,"target.max":`at most {max}`,no_value:`no value`,"history.moisture":`{value} % soil moisture`,"delete.confirm":`Delete?`,"toast.undone":`Undone`,"more.other_time":`Watered at another time…`,"editor.device_id":`Plant`,"overview.due.one":`1 needs water today`,"overview.due.other":`{count} need water today`,"overview.hints.one":`1 hint`,"overview.hints.other":`{count} hints`,"overview.logged_at":`logged at {time}`,"overview.all_logged":`{count} × watered logged`,"overview.undo_row":`{name}: take back the entry`,"overview.log_row":`Log {name} as watered`,"tile.low":`{measure} low`,"tile.high":`{measure} high`,"tile.never":`never watered`,"editor.area_id":`Room`,"editor.show_tiles":`All plants as tiles`,"picker.overview.name":`Rootwise overview`,"picker.overview.description":`Which plants need water today, with one-tap ticks, and all plants as tiles.`,"picker.plant.name":`Rootwise plant`,"picker.plant.description":`One plant: status, moisture and climate ranges, watering with undo, history.`,"next.in":`Next watering {time}`,"next.in_rough":`Next watering roughly {time}`,"next.interval":`Next watering {time} (usual interval)`,"next.due":`Watering is due`,"next.window":`({from} – {to})`,"next.learning":`Rootwise is still learning: the forecast comes after a few days of readings`,"thresholds.learned_hint":`Learned from your watering: dry {low} %, wet {high} %`,"thresholds.apply":`Use them`,"thresholds.learned":`Thresholds learned from {count} waterings`,"history.detected":`detected`,"history.rise":`{before} → {after} %`,"history.reject":`That wasn't me`,"history.reject_confirm":`Not you?`,"tile.next":`Water {time}`,"toast.thresholds":`Learned thresholds in use`,"editor.title":`Title`,"editor.show_history":`Show history`,"chart.empty":`No readings yet`,"chart.no_sensor":`No soil sensor`,"chart.point":`{value} % ({min}–{max})`,"chart.summary":`Soil moisture over the last {days} days: now {value} %, target {low}–{high} %, watered {count} times`,"chart.summary_plain":`Soil moisture over the last {days} days: now {value} %`},Le={en:Ie,de:{"status.ok":`Alles gut`,"status.thirsty":`Braucht Wasser`,"status.too_wet":`Zu nass`,"status.sensor_offline":`Sensor offline`,"status.no_history":`Noch nicht gegossen`,"level.dry":`Trocken`,"level.drying":`Bald gießen`,"level.ok":`Passt`,"level.fresh":`Nass, frisch gegossen`,"level.too_wet":`Zu nass`,"m.soil_moisture":`Bodenfeuchte`,"m.temperature":`Temperatur`,"m.air_humidity":`Luftfeuchte`,"m.illuminance":`Licht`,"m.conductivity":`Dünger`,"m.battery":`Batterie`,"care.watered":`Gegossen`,"care.fertilized":`Gedüngt`,"care.repotted":`Umgetopft`,"care.cleaned":`Blätter gereinigt`,"care.rotated":`Gedreht`,"care.pest_check":`Auf Schädlinge geprüft`,"care.pruned":`Geschnitten`,"care.sensor_moved":`Sensor umgesteckt`,"care.note":`Notiz`,"action.water":`Gegossen`,"action.undo":`Rückgängig`,"action.snooze":`+1 Tag`,"action.more":`Mehr`,"action.delete":`Löschen`,"action.cancel":`Abbrechen`,"action.save":`Speichern`,"when.title":`Wann hast du gegossen?`,"when.now":`Gerade eben`,"when.hours":`Vor ein paar Stunden`,"when.yesterday":`Gestern`,"when.pick":`Datum und Uhrzeit wählen`,"toast.logged":`{type} eingetragen`,"toast.deleted":`Eintrag gelöscht`,"toast.failed":`Hat nicht geklappt: {error}`,last_watered:`Gegossen {time}`,never_watered:`Noch kein Gießen eingetragen`,history:`Verlauf`,"history.empty":`Noch nichts eingetragen`,snoozed_until:`Pausiert bis {time}`,vacation:`Urlaubsmodus ist an`,"reason.below_threshold":`Bodenfeuchte {value} % unter {threshold} %`,"reason.too_wet":`Bodenfeuchte seit zwei Tagen über {threshold} % ({value} %)`,"reason.sensor_offline":`Keine Daten vom Bodensensor`,"reason.snoozed":`Pausiert`,"reason.just_watered":`Gerade gegossen`,"reason.interval_due":`Fällig nach {days} Tagen`,"reason.no_history":`Trag das erste Gießen ein, dann startet die Erinnerung`,"hint.temperature_low":`Zu kalt: {value} °C, mindestens {min} °C`,"hint.temperature_high":`Zu warm: {value} °C, höchstens {max} °C`,"hint.air_humidity_low":`Luft zu trocken: {value} %, mindestens {min} %`,"hint.air_humidity_high":`Luft zu feucht: {value} %, höchstens {max} %`,"hint.illuminance_low":`Zu dunkel: {value} lx, mindestens {min} lx`,"hint.illuminance_high":`Zu hell: {value} lx, höchstens {max} lx`,"hint.conductivity_low":`Wenig Dünger: {value} µS/cm, mindestens {min}`,"hint.conductivity_high":`Zu viel Dünger: {value} µS/cm, höchstens {max}`,"hint.battery_low":`Sensor-Batterie schwach: {value} %`,"overview.title":`Pflanzen`,"overview.today":`Heute gießen`,"overview.none":`Niemand hat Durst`,"overview.all_done":`Alle als gegossen eintragen`,"overview.empty":`Noch keine Pflanzen. Leg eine an unter Einstellungen → Geräte & Dienste → Rootwise.`,not_loaded:`Rootwise ist nicht geladen.`,unknown_plant:`Wähle in den Karteneinstellungen eine Pflanze.`,"target.range":`Ziel {min}–{max}`,"target.min":`mindestens {min}`,"target.max":`höchstens {max}`,no_value:`kein Wert`,"history.moisture":`{value} % Bodenfeuchte`,"delete.confirm":`Löschen?`,"toast.undone":`Rückgängig gemacht`,"more.other_time":`Zu anderer Zeit gegossen…`,"editor.device_id":`Pflanze`,"overview.due.one":`1 braucht heute Wasser`,"overview.due.other":`{count} brauchen heute Wasser`,"overview.hints.one":`1 Hinweis`,"overview.hints.other":`{count} Hinweise`,"overview.logged_at":`eingetragen um {time}`,"overview.all_logged":`{count} × Gegossen eingetragen`,"overview.undo_row":`{name}: Eintrag zurücknehmen`,"overview.log_row":`{name} als gegossen eintragen`,"tile.low":`{measure} zu niedrig`,"tile.high":`{measure} zu hoch`,"tile.never":`noch nie gegossen`,"editor.area_id":`Raum`,"editor.show_tiles":`Alle Pflanzen als Kacheln`,"picker.overview.name":`Rootwise Übersicht`,"picker.overview.description":`Welche Pflanzen heute Wasser brauchen, zum Abhaken, und alle Pflanzen als Kacheln.`,"picker.plant.name":`Rootwise Pflanze`,"picker.plant.description":`Eine Pflanze: Status, Feuchte und Klima mit Zielbereich, Gießen mit Rückgängig, Verlauf.`,"next.in":`Nächstes Gießen {time}`,"next.in_rough":`Nächstes Gießen ungefähr {time}`,"next.interval":`Nächstes Gießen {time} (übliches Intervall)`,"next.due":`Gießen ist fällig`,"next.window":`({from} – {to})`,"next.learning":`Rootwise lernt noch: die Prognose kommt nach ein paar Tagen Messwerten`,"thresholds.learned_hint":`Gelernt aus deinem Gießen: trocken {low} %, nass {high} %`,"thresholds.apply":`Übernehmen`,"thresholds.learned":`Schwellen gelernt aus {count}× Gießen`,"history.detected":`erkannt`,"history.rise":`{before} → {after} %`,"history.reject":`War ich nicht`,"history.reject_confirm":`Wirklich nicht?`,"tile.next":`Gießen {time}`,"toast.thresholds":`Gelernte Schwellen übernommen`,"editor.title":`Titel`,"editor.show_history":`Verlauf zeigen`,"chart.empty":`Noch keine Messwerte`,"chart.no_sensor":`Kein Bodensensor`,"chart.point":`{value} % ({min}–{max})`,"chart.summary":`Bodenfeuchte der letzten {days} Tage: jetzt {value} %, Ziel {low}–{high} %, {count}× gegossen`,"chart.summary_plain":`Bodenfeuchte der letzten {days} Tage: jetzt {value} %`}};function U(e){let t=(e?.locale?.language??e?.language??`en`).slice(0,2);return t in Le?t:`en`}function W(e,t,n={}){let r=U(e);return(Le[r]?.[t]??Ie[t]??t).replace(/\{(\w+)\}/g,(e,t)=>t in n?ze(n[t],r):e)}function Re(e,t,n){return W(e,`${t}.${new Intl.PluralRules(U(e)).select(n)===`one`?`one`:`other`}`,{count:n})}function ze(e,t){return typeof e==`number`?new Intl.NumberFormat(t,{maximumFractionDigits:1}).format(e):String(e)}var Be=864e5;function G(e,t,n){let r=new Date(e).getTime()-t.getTime(),i=new Intl.RelativeTimeFormat(n,{numeric:`auto`}),a=Math.abs(r);if(a<6e4)return i.format(0,`second`);if(a<36e5)return i.format(Math.round(r/6e4),`minute`);let o=Ve(new Date(e),t);return o===0?i.format(Math.round(r/36e5),`hour`):Math.abs(o)<30?i.format(o,`day`):new Intl.DateTimeFormat(n,{dateStyle:`medium`}).format(new Date(e))}function Ve(e,t){let n=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime();return Math.round((n(e)-n(t))/Be)}function He(e,t){return new Intl.DateTimeFormat(t,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}function Ue(e,t,n){return new Intl.DateTimeFormat(n,{weekday:`short`,day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}).formatRange(e,t)}function We(e,t,n){let r=+(e===`temperature`);return new Intl.NumberFormat(n,{maximumFractionDigits:r,minimumFractionDigits:r}).format(t)}var Ge=[`soil_moisture`,`air_humidity`,`battery`];function Ke(e,t,n,r){let i=e===`illuminance`?e=>Math.log10(Math.max(e,0)+1):e=>e,a,o;if(Ge.includes(e))a=0,o=100;else{let s=i(n??r??t??0),c=i(r??n??t??1),l=Math.max(c-s,e===`illuminance`?1:2);a=e===`illuminance`?0:s-l/4,o=c+l/4,t!==null&&(a=Math.min(a,i(t)),o=Math.max(o,i(t)))}let s=e=>Math.min(100,Math.max(0,(i(e)-a)/(o-a)*100));return{low:n===null?0:s(n),high:r===null?100:s(r),marker:t===null?null:s(t)}}var qe=[`soil_moisture`,`temperature`,`air_humidity`,`illuminance`,`conductivity`];function Je(e,t){if(t.device_id)return e.find(e=>e.device_id===t.device_id);if(t.plant_id)return e.find(e=>e.id===t.plant_id);if(t.plant){let n=t.plant.trim().toLocaleLowerCase();return e.find(e=>e.id===t.plant||e.name.toLocaleLowerCase()===n)}}var Ye=/_(low|high)$/;function K(e){return Ye.test(e.code)}function Xe(e,t){let n=t.reasons.filter(e=>!K(e));if(t.status&&t.status!==`ok`){let t=n.find(e=>e.code!==`snoozed`);return t?W(e,`reason.${t.code}`,t):null}return t.snoozed_until?W(e,`snoozed_until`,{time:new Intl.DateTimeFormat(e.language,{weekday:`short`,hour:`2-digit`,minute:`2-digit`}).format(new Date(t.snoozed_until))}):t.moisture_level?W(e,`level.${t.moisture_level}`):null}function Ze(e,t){return t.reasons.filter(K).map(t=>W(e,`hint.${t.code}`,t))}function Qe(e,t){if(e===`hours`)return new Date(t.getTime()-108e5);if(e===`yesterday`){let e=new Date(t);return e.setDate(e.getDate()-1),e.setHours(18,0,0,0),e}}function $e(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}function et(e){return Object.values(e.entities??{}).find(e=>e.platform===`rootwise`&&e.entity_id.endsWith(`_status`)&&e.device_id)?.device_id}function tt(e,t,n){let r=t.next_watering;if(!r)return t.measurements.soil_moisture?{text:W(e,`next.learning`)}:null;if(new Date(r.due).getTime()<=n.getTime())return{text:W(e,`next.due`)};let i=U(e),a=G(r.due,n,i),o={text:W(e,r.method===`interval`?`next.interval`:r.confidence===`low`?`next.in_rough`:`next.in`,{time:a})};if(r.earliest&&r.latest){let t=e=>new Intl.DateTimeFormat(i,{weekday:`short`}).format(new Date(e)),n=t(r.earliest),a=t(r.latest);n!==a&&(o.window=W(e,`next.window`,{from:n,to:a}))}return o}var nt=3;function rt(e,t){let n=t.thresholds;if(!n?.learned)return null;let[r,i]=n.learned;return n.source===`learned`?{text:W(e,`thresholds.learned`,{count:n.waterings}),canApply:!1}:n.source===`custom`&&(Math.abs(r-n.low)>=nt||Math.abs(i-n.high)>=nt)?{text:W(e,`thresholds.learned_hint`,{low:r,high:i}),canApply:!0}:null}function it(e,t){let n=t.data??{};if(t.source===`auto`){let t=n.settled??n.peak,r=n.before!==void 0&&t!==void 0?W(e,`history.rise`,{before:Math.round(n.before),after:Math.round(t)}):``;return[W(e,`history.detected`),r].filter(Boolean).join(` · `)}return n.moisture===void 0?``:W(e,`history.moisture`,{value:n.moisture})}var at={thirsty:0,too_wet:1,sensor_offline:2,no_history:3,ok:4};function ot(e,t){return t?e.filter(e=>e.area_id===t):e}var st=(e,t)=>e.name.localeCompare(t.name);function ct(e){return e.filter(e=>e.needs_water).sort(st)}function lt(e,t){return e.filter(e=>e.needs_water||t(e)).sort(st)}function ut(e,t){let n=t.measurements.soil_moisture?.value,r=n==null?Xe(e,t):`${We(`soil_moisture`,n,U(e))} %`;return[t.area,r].filter(Boolean).join(` · `)}function dt(e,t){let n=t.filter(e=>e.needs_water).length,r=t.filter(e=>e.reasons.some(K)).length,i=[n?Re(e,`overview.due`,n):W(e,`overview.none`)];return r&&i.push(Re(e,`overview.hints`,r)),i.join(` · `)}function ft(e,t,n){let r=t.status??`no_history`;if(r===`thirsty`)return{color:`var(--rw-warn)`,text:W(e,`status.thirsty`)};if(r===`too_wet`)return{color:`var(--rw-prob)`,text:W(e,`level.too_wet`)};if(r===`sensor_offline`)return{color:`var(--rw-text2)`,text:W(e,`status.sensor_offline`)};let i=t.reasons.find(K);if(i){let[,t,n]=/^(.*)_(low|high)$/.exec(i.code)??[],r=W(e,`m.${t}`);return{color:`var(--rw-warn)`,text:W(e,`tile.${n}`,{measure:r})}}let a=t.next_watering;return a&&new Date(a.due).getTime()>n.getTime()?{color:`var(--rw-accent)`,text:W(e,`tile.next`,{time:G(a.due,n,U(e))})}:t.moisture_level?{color:`var(--rw-accent)`,text:W(e,`level.${t.moisture_level}`)}:t.last_watered?{color:`var(--rw-accent)`,text:G(t.last_watered,n,U(e))}:{color:`var(--rw-text2)`,text:W(e,`tile.never`)}}function pt(e){return[...e].sort((e,t)=>(at[e.status??`ok`]??9)-(at[t.status??`ok`]??9)||Number(t.reasons.some(K))-Number(e.reasons.some(K))||e.name.localeCompare(t.name))}var mt=o`
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
`,ht={ok:`var(--rw-accent)`,thirsty:`var(--rw-warn)`,too_wet:`var(--rw-prob)`,sensor_offline:`var(--rw-text2)`,no_history:`var(--rw-text2)`},gt={soil_moisture:`mdi:water-percent`,temperature:`mdi:thermometer`,air_humidity:`mdi:water-opacity`,illuminance:`mdi:white-balance-sunny`,conductivity:`mdi:sprout-outline`,battery:`mdi:battery-40`,watered:`mdi:watering-can`,fertilized:`mdi:bottle-tonic-plus`,repotted:`mdi:pot-mix`,cleaned:`mdi:leaf`,rotated:`mdi:rotate-3d-variant`,pest_check:`mdi:bug-check`,pruned:`mdi:content-cut`,sensor_moved:`mdi:cursor-move`,note:`mdi:note-text-outline`};function q(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var J=class extends B{connectedCallback(){super.connectedCallback(),this.subscribe()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0}willUpdate(e){e.has(`hass`)&&(this.subscribe(),this.toggleAttribute(`dark`,!!this.hass?.themes?.darkMode))}subscribe(){let e=this.hass;e&&this.isConnected&&e.connection!==this.connection&&(this.unsubscribe?.(),this.connection=e.connection,this.unsubscribe=Ae(e,e=>{this.payload=e}))}t(e,t){return W(this.hass,e,t)}moreInfo(e){e&&this.dispatchEvent(new CustomEvent(`hass-more-info`,{detail:{entityId:e},bubbles:!0,composed:!0}))}};q([V({attribute:!1})],J.prototype,`hass`,void 0),q([H()],J.prototype,`payload`,void 0);function Y(e){return e&&typeof e==`object`&&`message`in e?String(e.message):String(e)}function _t(e){return W({language:document.documentElement.lang||`en`},`editor.${e.name}`)}var vt=36e5,yt=1e4,X=class extends J{constructor(...e){super(...e),this.ticked=new Map,this.busy=new Set}static getConfigForm(){return{schema:[{name:`title`,selector:{text:{}}},{name:`area_id`,selector:{area:{}}},{name:`show_tiles`,selector:{boolean:{}}}],computeLabel:_t}}static getStubConfig(){return{show_tiles:!0}}setConfig(e){this.config={show_tiles:!0,...e}}getCardSize(){return 3+(this.payload?ct(this.payload.plants).length:0)}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer)}async toggle(e){if(!this.hass||this.busy.has(e.id))return;this.busy=new Set(this.busy).add(e.id);let t=this.ticked.get(e.id);try{let n=new Map(this.ticked);t?(await Me(this.hass,t.id),n.delete(e.id)):n.set(e.id,await je(this.hass,e.id,`watered`)),this.ticked=n}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Y(e)})})}finally{let t=new Set(this.busy);t.delete(e.id),this.busy=t}}async allDone(e){let t=this.hass;if(!t)return;let n=e.filter(e=>!this.ticked.has(e.id));try{let e=await Promise.all(n.map(e=>je(t,e.id,`watered`))),r=new Map(this.ticked);n.forEach((t,n)=>r.set(t.id,e[n])),this.ticked=r,this.showToast({text:this.t(`overview.all_logged`,{count:e.length}),undo:e})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Y(e)})})}}async undoAll(e){let t=this.hass;if(t)try{await Promise.all(e.map(e=>Me(t,e.id)));let n=new Map(this.ticked);e.forEach(e=>n.delete(e.plant_id)),this.ticked=n,this.showToast({text:this.t(`toast.undone`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Y(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},yt)}render(){let e=this.hass;if(!this.payload||!e)return N`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return N`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let t=ot(this.payload.plants,this.config?.area_id),n=ct(t),r=Date.now(),i=lt(t,e=>{let t=this.ticked.get(e.id);return t!==void 0&&r-Date.parse(t.ts)<vt}),a=n.filter(e=>!this.ticked.has(e.id));return N`
      <ha-card>
        <div class="head">
          <span class="badge"><ha-icon icon="mdi:sprout"></ha-icon></span>
          <div class="titles">
            <div class="title">${this.config?.title||this.t(`overview.title`)}</div>
            <div class="muted small">${t.length?dt(e,t):``}</div>
          </div>
        </div>
        ${this.payload.vacation?N`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:I}
        ${t.length===0?N`<div class="empty muted">${this.t(`overview.empty`)}</div>`:I}
        ${i.length?N`<ul class="due" aria-label=${this.t(`overview.today`)}>
              ${i.map(e=>this.renderRow(e))}
            </ul>`:I}
        ${a.length>=2?N`<button class="all" @click=${()=>void this.allDone(a)}>
              <ha-icon icon="mdi:check-all"></ha-icon>${this.t(`overview.all_done`)}
            </button>`:I}
        ${this.toast?this.renderToast(this.toast):I}
        ${this.config?.show_tiles&&t.length?N`<div class="tiles">${pt(t).map(e=>this.renderTile(e))}</div>`:I}
      </ha-card>
    `}renderRow(e){let t=this.hass,n=this.ticked.get(e.id),r=n?this.t(`overview.logged_at`,{time:new Intl.DateTimeFormat(U(t),{hour:`2-digit`,minute:`2-digit`}).format(new Date(n.ts))}):t?ut(t,e):``;return N`
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
    `}renderTile(e){let t=this.hass?ft(this.hass,e,new Date):{color:``,text:``};return N`
      <button class="tile" @click=${()=>this.moreInfo(e.entity_ids.status)}>
        <span class="tile-name"><span class="dot" style="background:${t.color}"></span>${e.name}</span>
        <span class="muted tiny">${t.text}</span>
      </button>
    `}renderToast(e){let t=e.undo;return N`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${t?N`<button class="link" @click=${()=>void this.undoAll(t)}>${this.t(`action.undo`)}</button>`:I}
      </div>
    `}static{this.styles=[mt,o`
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
    `]}};q([H()],X.prototype,`config`,void 0),q([H()],X.prototype,`ticked`,void 0),q([H()],X.prototype,`busy`,void 0),q([H()],X.prototype,`toast`,void 0);var bt=10,xt=500,Z=class extends J{constructor(...e){super(...e),this.panel=`none`,this.pickTime=``,this.busy=!1,this.longPressed=!1}static getConfigForm(){return{schema:[{name:`device_id`,required:!0,selector:{device:{filter:[{integration:`rootwise`}]}}},{name:`show_history`,selector:{boolean:{}}}],computeLabel:_t}}static getStubConfig(e){return{device_id:et(e),show_history:!0}}setConfig(e){this.config={show_history:!0,...e}}getCardSize(){return this.config?.show_history?8:5}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.toastTimer),window.clearTimeout(this.confirmTimer)}get plant(){return this.payload&&this.config?Je(this.payload.plants,this.config):void 0}async log(e,t){let n=this.plant;if(n&&this.hass&&!this.busy){this.busy=!0,this.panel=`none`;try{let r=await je(this.hass,n.id,e,t);this.showToast({text:this.t(`toast.logged`,{type:this.t(`care.${e}`)}),undo:r})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Y(e)})})}finally{this.busy=!1}}}async deleteEntry(e,t){if(this.hass)try{await Me(this.hass,e.id),this.showToast({text:t})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Y(e)})})}}showToast(e){this.toast=e,window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>{this.toast=void 0},bt*1e3)}undo(){let e=this.toast?.undo;e&&this.deleteEntry(e,this.t(`toast.undone`))}pressStart(){this.longPressed=!1,window.clearTimeout(this.pressTimer),this.pressTimer=window.setTimeout(()=>{this.longPressed=!0,this.openWhen()},xt)}pressEnd(){window.clearTimeout(this.pressTimer)}waterClick(){if(this.longPressed){this.longPressed=!1;return}this.log(`watered`)}openWhen(){this.pickTime=``,this.panel=`when`}chooseWhen(e){this.log(`watered`,Qe(e,new Date))}savePicked(){this.pickTime&&this.log(`watered`,new Date(this.pickTime))}askDelete(e){if(this.confirmDelete===e.id){this.confirmDelete=void 0,this.deleteEntry(e,this.t(`toast.deleted`));return}this.confirmDelete=e.id,window.clearTimeout(this.confirmTimer),this.confirmTimer=window.setTimeout(()=>{this.confirmDelete=void 0},4e3)}render(){if(!this.payload)return N`<ha-card><div class="empty muted">…</div></ha-card>`;if(!this.payload.loaded)return N`<ha-card><div class="empty muted">${this.t(`not_loaded`)}</div></ha-card>`;let e=this.plant;if(!e)return N`<ha-card><div class="empty muted">${this.t(`unknown_plant`)}</div></ha-card>`;let t=this.hass?Xe(this.hass,e):null,n=this.hass?Ze(this.hass,e):[],r=qe.filter(t=>e.measurements[t]);return N`
      <ha-card>
        ${this.payload.vacation?N`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t(`vacation`)}</div>`:I}
        ${this.renderHead(e)}
        ${t?N`<div class="detail">${t}</div>`:I}
        ${r.length?N`<div class="bars">
              ${r.map(t=>this.renderBar(t,e.measurements[t]))}
            </div>`:I}
        ${n.length?N`<ul class="hints">
              ${n.map(e=>N`<li><ha-icon icon="mdi:information-outline"></ha-icon>${e}</li>`)}
            </ul>`:I}
        ${this.renderLearned(e)}
        <div class="when-block">
          ${this.renderNext(e)}
          <div class="last muted">${this.lastWatered(e)}</div>
        </div>
        ${this.renderActions(e)} ${this.panel===`when`?this.renderWhen():I}
        ${this.panel===`more`?this.renderMore():I}
        ${this.toast?this.renderToast(this.toast):I}
        ${this.config?.show_history?this.renderHistory(e):I}
      </ha-card>
    `}renderHead(e){let t=e.status??`no_history`,n=[e.species.common,e.species.scientific].filter(Boolean).filter((e,t,n)=>n.indexOf(e)===t);return N`
      <div
        class="head"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(e.entity_ids.status)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&this.moreInfo(e.entity_ids.status)}}
      >
        <div class="avatar">
          ${e.species.image_url?N`<img
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
            <span class="dot" style="background:${ht[t]}"></span>
            <span>${this.t(`status.${t}`)}${e.area?` · ${e.area}`:``}</span>
          </div>
          ${n.length?N`<div class="species muted">${n.join(` · `)}</div>`:I}
        </div>
      </div>
    `}renderBar(e,t){let n=U(this.hass),r=Ke(e,t.value,t.min,t.max),i=t.unit??``,a=t.value===null?`–`:`${We(e,t.value,n)}${i?` ${i}`:``}`,o=t.rating===`low`||t.rating===`high`||t.level===`dry`||t.level===`too_wet`,s=t.min!==null&&t.max!==null?this.t(`target.range`,{min:t.min,max:t.max}):t.min===null?t.max===null?``:this.t(`target.max`,{max:t.max}):this.t(`target.min`,{min:t.min}),c=this.t(`m.${e}`),l=`${c} ${t.value===null?this.t(`no_value`):a}${s?`, ${s}`:``}`;return N`
      <div
        class="bar-row ${o?`off`:``}"
        role="button"
        tabindex="0"
        @click=${()=>this.moreInfo(this.plant?.entity_ids[e])}
      >
        <ha-icon icon=${gt[e]??`mdi:gauge`}></ha-icon>
        <span class="label">${c}</span>
        <div class="bar" role="img" aria-label=${l}>
          <div class="zone" style="left:${r.low}%;width:${Math.max(r.high-r.low,0)}%"></div>
          ${e===`soil_moisture`&&r.marker!==null?N`<div class="fill" style="width:${r.marker}%"></div>`:I}
          ${t.min===null?I:N`<div class="tick" style="left:${r.low}%"></div>`}
          ${t.max===null?I:N`<div class="tick" style="left:${r.high}%"></div>`}
          ${r.marker===null?I:N`<div class="marker" style="left:${r.marker}%"></div>`}
        </div>
        <span class="value num">${a}</span>
      </div>
    `}renderNext(e){let t=this.hass?tt(this.hass,e,new Date):null;return t?N`<div class="next">
      <ha-icon icon="mdi:calendar-clock"></ha-icon>
      <span>${t.text}${t.window?N` <span class="muted">${t.window}</span>`:I}</span>
    </div>`:I}renderLearned(e){let t=this.hass?rt(this.hass,e):null;return t?N`<div class="learned muted">
      <ha-icon icon="mdi:school-outline"></ha-icon>
      <span>${t.text}</span>
      ${t.canApply?N`<button class="link" @click=${()=>void this.applyLearned(e)}>
            ${this.t(`thresholds.apply`)}
          </button>`:I}
    </div>`:I}async applyLearned(e){if(this.hass)try{await Pe(this.hass,e.id),this.showToast({text:this.t(`toast.thresholds`)})}catch(e){this.showToast({text:this.t(`toast.failed`,{error:Y(e)})})}}lastWatered(e){return e.last_watered?this.t(`last_watered`,{time:G(e.last_watered,new Date,U(this.hass))}):this.t(`never_watered`)}renderActions(e){let t=e.entity_ids.snooze,n=this.toast?.undo?.type===`watered`;return N`
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
        ${e.needs_water&&t?N`<button class="secondary" @click=${()=>this.hass&&void Ne(this.hass,t)}>
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
    `}renderWhen(){let e=$e(new Date);return N`
      <div class="panel" role="group" aria-label=${this.t(`when.title`)}>
        <div class="panel-title">${this.t(`when.title`)}</div>
        <div class="choices">
          ${[`now`,`hours`,`yesterday`].map(e=>N`<button @click=${()=>this.chooseWhen(e)}>${this.t(`when.${e}`)}</button>`)}
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
    `}renderMore(){return N`
      <div class="panel menu" role="menu">
        <button role="menuitem" @click=${this.openWhen}>
          <ha-icon icon="mdi:clock-edit-outline"></ha-icon>${this.t(`more.other_time`)}
        </button>
        ${[`fertilized`,`sensor_moved`].map(e=>N`<button role="menuitem" @click=${()=>void this.log(e)}>
            <ha-icon icon=${gt[e]??`mdi:plus`}></ha-icon>${this.t(`care.${e}`)}
          </button>`)}
      </div>
    `}renderToast(e){return N`
      <div class="toast" role="status">
        <span>${e.text}</span>
        ${e.undo?N`<button class="link" @click=${this.undo}>${this.t(`action.undo`)}</button>`:I}
      </div>
    `}renderHistory(e){let t=U(this.hass);return N`
      <div class="history">
        <div class="section">${this.t(`history`)}</div>
        ${e.recent.length===0?N`<div class="muted small">${this.t(`history.empty`)}</div>`:N`<ul>
              ${e.recent.map(e=>{let n=this.hass?it(this.hass,e):``,r=this.hass?Fe(this.hass,e):!1,i=this.confirmDelete===e.id,a=e.source===`auto`;return N`<li class=${a?`detected`:``}>
                  <ha-icon icon=${gt[e.type]??`mdi:circle-small`}></ha-icon>
                  <div class="entry">
                    <span>${this.t(`care.${e.type}`)}</span>
                    <span class="muted small">
                      ${He(e.ts,t)}${n?` · ${n}`:``}
                    </span>
                  </div>
                  ${r?N`<button
                        class="delete ${i?`confirm`:``}"
                        aria-label=${this.t(a?`history.reject`:`action.delete`)}
                        title=${this.t(a?`history.reject`:`action.delete`)}
                        @click=${()=>this.askDelete(e)}
                      >
                        ${i?this.t(a?`history.reject_confirm`:`delete.confirm`):N`<ha-icon
                              icon=${a?`mdi:close-circle-outline`:`mdi:delete-outline`}
                            ></ha-icon>`}
                      </button>`:I}
                </li>`})}
            </ul>`}
      </div>
    `}static{this.styles=[mt,o`
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
    `]}};q([H()],Z.prototype,`config`,void 0),q([H()],Z.prototype,`panel`,void 0),q([H()],Z.prototype,`pickTime`,void 0),q([H()],Z.prototype,`toast`,void 0),q([H()],Z.prototype,`confirmDelete`,void 0),q([H()],Z.prototype,`busy`,void 0);var St=864e5,Ct=.25,wt=1.5,Tt=[1,2,7,14,28],Et=36,Dt=64,Ot={left:30,right:8,top:8,bottom:22},kt={left:4,right:4,top:6,bottom:18},At=e=>e.toFixed(1),Q=(e,t,n)=>Math.min(n,Math.max(t,e));function jt(e){let t=[];for(let[,,n,r]of e.points)t.push(n,r);if(e.thresholds&&t.push(e.thresholds.low,e.thresholds.high),e.forecast&&t.push(e.forecast.level),!t.length)return[0,100];let n=Math.max(0,Math.floor((Math.min(...t)-5)/10)*10),r=Math.min(100,Math.ceil((Math.max(...t)+5)/10)*10);return r-n<20&&(r=Math.min(100,n+20),n=Math.max(0,r-20)),[n,r]}function Mt(e,t){let n=[],r=[];for(let i of e){let e=r.at(-1);e&&i[0]-e[0]>t&&(n.push(r),r=[]),r.push(i)}return r.length&&n.push(r),n}function Nt(e,t,n,r,i){let a=Tt.find(e=>e*i>=Et)??28,o=new Date(t);if(o.setHours(0,0,0,0),a>=7)for(;o.getDay()!==1;)o.setDate(o.getDate()-1);let s=[];for(let t=new Date(o);t.getTime()>=e;t.setDate(t.getDate()-a))s.unshift(t.getTime());let c=new Date(o);for(c.setDate(c.getDate()+a);c.getTime()<=n;c.setDate(c.getDate()+a))s.push(c.getTime());let l=a<7&&a*i>=Dt,u=new Intl.DateTimeFormat(r,l?{weekday:`short`,day:`numeric`}:{day:`numeric`,month:`numeric`});return s.map(e=>({time:e,label:u.format(new Date(e))}))}function Pt(e,t,n,r,i={}){let a=!!i.compact,o=a?kt:Ot,s={left:o.left,right:Math.max(o.left+1,t-o.right),top:o.top,bottom:Math.max(o.top+1,n-o.bottom)},c=Date.parse(e.start),l=Date.parse(e.end),u=e.forecast?Date.parse(e.forecast.due):null,d=u!==null&&u>l&&e.thresholds!==null,f=d?l+(l-c)*Ct:l,[p,m]=jt(e),h=e=>s.left+(e-c)/(f-c)*(s.right-s.left),g=e=>s.bottom-(e-p)/(m-p)*(s.bottom-s.top),ee=e.step*500,_=Mt(e.points,e.step*1e3*wt),v=(e,t)=>`${At(h(e[0]+ee))} ${At(g(t))}`,y=_.filter(e=>e.length>1).map(e=>e.map((e,t)=>`${t?`L`:`M`}${v(e,e[1])}`).join(``)).join(``),b=_.filter(e=>e.length>1).map(e=>`${e.map((e,t)=>`${t?`L`:`M`}${v(e,e[3])}`).join(``)}${[...e].reverse().map(e=>`L${v(e,e[2])}`).join(``)}Z`).join(``),x=[];for(let[e,...t]of _)e&&!t.length&&x.push({x:h(e[0]+ee),y:g(e[1])});let S=e.thresholds,C=S?{top:Q(g(S.high),s.top,s.bottom),bottom:Q(g(S.low),s.top,s.bottom)}:null,te=m-p<=50?10:20,w=[];for(let e=p;e<=m;e+=te)w.push({y:g(e),value:e});let T=h(l),E=null;if(d&&e.forecast&&S&&u!==null){let t=T,n=g(e.forecast.level),r=h(u),i=g(S.low);r>s.right&&(i=n+(i-n)*(s.right-t)/(r-t),r=s.right),E={x1:t,y1:n,x2:r,y2:i,from:Q(h(Date.parse(e.forecast.earliest)),t,s.right),to:Q(h(Date.parse(e.forecast.latest)),t,s.right)}}return{width:t,height:n,plot:s,domain:{t0:c,t1:f,v0:p,v1:m},x:h,y:g,line:y,envelope:b,dots:x,band:C,xTicks:Nt(c,l,f,r,(s.right-s.left)*St/(f-c)).map(e=>({...e,x:h(e.time)})),yTicks:a?[]:w,events:e.events.map(e=>({time:Date.parse(e.ts),type:e.type,source:e.source})).filter(e=>e.time>=c&&e.time<=f).map(e=>({...e,x:h(e.time)})),forecast:E,nowX:T}}function Ft(e,t,n){let r=e.points[0],i=e.points.at(-1);if(!r||!i)return null;let{t0:a,t1:o}=t.domain,{left:s,right:c}=t.plot,l=a+(n-s)/(c-s)*(o-a),u=e.step*1e3;if(l<r[0]||l>i[0]+u)return null;let d=r;for(let t of e.points)Math.abs(t[0]+u/2-l)<Math.abs(d[0]+u/2-l)&&(d=t);return{point:d,x:t.x(d[0]+u/2),y:t.y(d[1])}}var It=`M0 -5C2.5 -1.6 3.6 0.4 3.6 1.9A3.6 3.6 0 0 1 -3.6 1.9C-3.6 0.4 -2.5 -1.6 0 -5Z`,$=class extends B{constructor(...e){super(...e),this.language=`en`,this.compact=!1,this.height=180,this.dark=!1,this.width=0,this.hover=null,this.onPointer=e=>{if(!this.data||!this.model)return;let t=e.currentTarget.getBoundingClientRect(),n=Ft(this.data,this.model,e.clientX-t.left);this.hover=n?this.data.points.indexOf(n.point):null},this.onLeave=()=>{this.hover=null},this.onKey=e=>{let t=this.data?.points.length??0;if(!t)return;let n=this.hover??t,r=new Map([[`ArrowLeft`,Math.max(0,n-1)],[`ArrowRight`,Math.min(t-1,this.hover===null?t-1:n+1)],[`Home`,0],[`End`,t-1]]).get(e.key);e.key===`Escape`?this.hover=null:r!==void 0&&(e.preventDefault(),this.hover=r)}}connectedCallback(){super.connectedCallback(),this.observer=new ResizeObserver(e=>{let t=Math.round(e[0]?.contentRect.width??0);t!==this.width&&(this.width=t)}),this.observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}firstUpdated(){this.width||=Math.round(this.getBoundingClientRect().width)}willUpdate(e){e.has(`data`)&&(this.hover=null),[`data`,`width`,`height`,`compact`,`language`].some(t=>e.has(t))&&(this.model=this.data&&this.width?Pt(this.data,this.width,this.height,this.language,{compact:this.compact}):void 0)}t(e,t){return W({language:this.language},e,t)}render(){let e=this.data,t=`height:${this.height}px`;if(!e)return N`<div class="frame" style=${t} aria-busy="true"></div>`;if(!e.points.length){let n=e.thresholds?`chart.empty`:`chart.no_sensor`;return N`<div class="frame empty muted" style=${t}>${this.t(n)}</div>`}let n=this.model,r=this.hover===null?void 0:e.points[this.hover];return N`
      <div
        class="frame"
        style=${t}
        tabindex="0"
        role="img"
        aria-label=${this.summary(e)}
        @keydown=${this.onKey}
      >
        ${n?N`<svg
              width=${n.width}
              height=${n.height}
              viewBox="0 0 ${n.width} ${n.height}"
              aria-hidden="true"
              @pointermove=${this.onPointer}
              @pointerdown=${this.onPointer}
              @pointerleave=${this.onLeave}
            >
              ${this.back(n)} ${this.series(n)} ${this.markers(n)}
              ${r?this.crosshair(n,r,e.step):I}
            </svg>`:I}
        ${n&&r?this.tooltip(n,r,e.step):I}
      </div>
    `}back(e){let{plot:t}=e;return P`
      ${e.band?P`<rect class="band" x=${t.left} y=${e.band.top}
            width=${t.right-t.left} height=${e.band.bottom-e.band.top}></rect>`:I}
      ${e.forecast?P`<rect class="future" x=${e.nowX} y=${t.top}
            width=${t.right-e.nowX} height=${t.bottom-t.top}></rect>`:I}
      ${e.forecast&&e.forecast.to>e.forecast.from?P`<rect class="window" x=${e.forecast.from} y=${t.top}
            width=${e.forecast.to-e.forecast.from} height=${t.bottom-t.top}></rect>`:I}
      ${e.yTicks.map(e=>P`
          <line class="grid" x1=${t.left} x2=${t.right} y1=${e.y} y2=${e.y}></line>
          <text class="label" x=${t.left-6} y=${e.y} text-anchor="end"
            dominant-baseline="middle">${e.value}</text>`)}
      <line class="axis" x1=${t.left} x2=${t.right} y1=${t.bottom} y2=${t.bottom}></line>
      ${e.xTicks.filter(e=>e.x>=t.left&&e.x<=t.right).map(n=>P`
            <line class="axis" x1=${n.x} x2=${n.x} y1=${t.bottom} y2=${t.bottom+3}></line>
            <text class="label" x=${n.x} y=${e.height-4}
              text-anchor="middle">${n.label}</text>`)}
    `}series(e){let t=e.forecast;return P`
      <path class="envelope" d=${e.envelope}></path>
      <path class="line" d=${e.line}></path>
      ${e.dots.map(e=>P`<circle class="dot" cx=${e.x} cy=${e.y} r="2"></circle>`)}
      ${t?P`
          <line class="now" x1=${e.nowX} x2=${e.nowX}
            y1=${e.plot.top} y2=${e.plot.bottom}></line>
          <line class="forecast" x1=${t.x1} y1=${t.y1}
            x2=${t.x2} y2=${t.y2}></line>`:I}
    `}markers(e){let t=e.plot.top+6;return e.events.map(n=>{if(n.type===`watered`){let r=n.source===`auto`;return P`
          <line class="watered-guide" x1=${n.x} x2=${n.x}
            y1=${t} y2=${e.plot.bottom}></line>
          <path class=${r?`drop detected`:`drop`} d=${It}
            transform="translate(${n.x} ${t})"></path>`}return P`<rect class=${n.type===`fertilized`?`fertilized`:`other`} x=${n.x-3} y=${t-3} width="6" height="6"
        transform="rotate(45 ${n.x} ${t})"></rect>`})}crosshair(e,t,n){let r=e.x(t[0]+n*500);return P`
      <line class="cross" x1=${r} x2=${r} y1=${e.plot.top} y2=${e.plot.bottom}></line>
      <circle class="focus" cx=${r} cy=${e.y(t[1])} r="3.5"></circle>`}tooltip(e,t,n){let r=e.x(t[0]+n*500);return N`<div class="tip" style="top:${e.y(t[1])>e.plot.top+48?e.plot.top:e.plot.bottom-40}px;${r<e.width/3?`left:${Math.max(0,r-16)}px`:r>e.width*2/3?`right:${Math.max(0,e.width-r-16)}px`:`left:${r}px;transform:translateX(-50%)`}">
      <span class="muted"
        >${Ue(new Date(t[0]),new Date(t[0]+n*1e3),this.language)}</span
      >
      <span class="num"
        >${this.t(`chart.point`,{value:Math.round(t[1]),min:Math.round(t[2]),max:Math.round(t[3])})}</span
      >
    </div>`}summary(e){let t=Math.round((Date.parse(e.end)-Date.parse(e.start))/864e5),n=e.points.at(-1),r={days:t,value:n?Math.round(n[1]):`–`,count:e.events.filter(e=>e.type===`watered`).length,low:e.thresholds?.low,high:e.thresholds?.high};return this.t(e.thresholds?`chart.summary`:`chart.summary_plain`,r)}static{this.styles=[mt,o`
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
  `]}};q([V({attribute:!1})],$.prototype,`data`,void 0),q([V()],$.prototype,`language`,void 0),q([V({type:Boolean})],$.prototype,`compact`,void 0),q([V({type:Number})],$.prototype,`height`,void 0),q([V({type:Boolean,reflect:!0})],$.prototype,`dark`,void 0),q([H()],$.prototype,`width`,void 0),q([H()],$.prototype,`hover`,void 0);async function Lt(e){document.querySelector(`home-assistant`)&&await customElements.whenDefined(`home-assistant`);for(let[t,n]of e)customElements.get(t)||customElements.define(t,n)}var Rt={language:document.documentElement.lang||navigator.language};window.customCards=window.customCards??[];for(let e of[`overview`,`plant`])window.customCards.push({type:`rootwise-${e}-card`,name:W(Rt,`picker.${e}.name`),description:W(Rt,`picker.${e}.description`),preview:!0,documentationURL:`https://github.com/michi-walchsi/ha-rootwise`});Lt([[`rootwise-moisture-chart`,$],[`rootwise-overview-card`,X],[`rootwise-plant-card`,Z]]),console.info(`%c ROOTWISE-CARDS %c 0.3.1 `,`background:#2e7d32;color:#fff`,``);