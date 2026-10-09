import {products,categories,subcategories,money,byId,sceneTones,collectionTones} from './catalog.js';
import {initMotion} from './motion.js';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const storage={read(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let storedBag=storage.read('vara-bag',[]),storedWishlist=storage.read('vara-wishlist',[]);
let bag=Array.isArray(storedBag)?storedBag.filter(x=>x&&byId(x.id)&&Number.isInteger(x.quantity)&&x.quantity>0).map(x=>({...x,quantity:Math.min(x.quantity,20)})):[];
let wishlist=Array.isArray(storedWishlist)?storedWishlist.filter(id=>byId(id)):[];
let currentCategory='All',currentSub='',wishlistOnly=false,activeProduct=null,quantity=1,toastTimer;
const shop=$('#shop-dialog'),productDialog=$('#product-dialog'),bagDialog=$('#bag-dialog');

function notify(message){const el=$('.toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function sync(){storage.write('vara-bag',bag);storage.write('vara-wishlist',wishlist);$('#bag-count').textContent=bag.reduce((n,x)=>n+x.quantity,0);$('#wish-count').textContent=wishlist.length||'';$$('[data-wish]').forEach(el=>{const saved=wishlist.includes(el.dataset.wish);el.classList.toggle('saved',saved);el.setAttribute('aria-pressed',String(saved));el.setAttribute('aria-label',`${saved?'Remove from':'Add to'} wishlist`);el.textContent=saved?'♥':'♡'});}
function openDialog(dialog){if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');}
function closeDialog(dialog){dialog.close();if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');}
function closeAll(){for(const d of $$('dialog[open]'))closeDialog(d)}
for(const dialog of $$('dialog')){dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open')});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog)}});}

function productCard(p){return `<article class="product-card"><button class="product-image" data-product="${p.id}" aria-label="View ${p.name}"><img src="assets/${p.image}.webp" alt="${p.name}, ${p.colour} ${p.weave} saree" loading="lazy"></button><button class="wish-button" data-wish="${p.id}" aria-label="Add to wishlist" aria-pressed="false">♡</button><div class="product-card-title"><button data-product="${p.id}"><h3>${p.name}</h3></button><span>${money(p.price)}</span></div><div class="product-card-sub"><span>${p.weave.toUpperCase()} / ${p.colour.toUpperCase()}</span><button data-product="${p.id}">VIEW ↗</button></div></article>`;}
function renderShop(){
 shop.style.background=collectionTones[currentCategory]||collectionTones.All;
 const search=$('#search-input').value.trim().toLowerCase();
 let results=products.filter(p=>(!wishlistOnly||wishlist.includes(p.id))&&(currentCategory==='All'||p.tags.includes(currentCategory))&&(!currentSub||p.tags.some(t=>t.toLowerCase()===currentSub.toLowerCase()))&&(!search||`${p.name} ${p.subtitle} ${p.weave} ${p.colour} ${p.material} ${p.tags.join(' ')}`.toLowerCase().includes(search)));
 const sort=$('#sort-select').value;if(sort!=='featured')results=[...results].sort((a,b)=>sort==='low'?a.price-b.price:b.price-a.price);
 $('#category-tabs').innerHTML=categories.map(c=>`<button data-category="${c}" class="${c===currentCategory?'active':''}" aria-pressed="${c===currentCategory}">${c==='All'?'All sarees':c}</button>`).join('');
 $('#subcategories').innerHTML=(subcategories[currentCategory]||[]).map(c=>`<button data-sub="${c}" class="${c===currentSub?'active':''}" aria-pressed="${c===currentSub}">${c}</button>`).join('');
 $('#shop-title').innerHTML=wishlistOnly?'Your saved <em>stories.</em>':currentCategory==='All'?'The complete <em>edit.</em>':`${currentCategory==='New arrivals'?'The new':currentCategory} <em>edit.</em>`;
 $('#shop-eyebrow').textContent=wishlistOnly?'KEEP THE ONES YOU LOVE':'FIND YOUR DRAPE';
 $('#result-count').textContent=`${results.length.toString().padStart(2,'0')} ${results.length===1?'DRAPE':'DRAPES'}`;
 $('#shop-products').innerHTML=results.length?results.map(productCard).join(''):`<div class="empty-state"><h3>${wishlistOnly?'Your next favourite awaits.':'A new story is on its way.'}</h3><p>${search?'No sarees match that search. Try a colour, material, or name.':wishlistOnly?'Tap the heart on a saree to keep it here.':'This part of the concept edit has no designs yet. Explore the current collection.'}</p><button class="text-link" data-shop="All">Explore all sarees <span>↗</span></button></div>`;
 sync();
}
function openShop(category='All',wish=false,searchFocus=false){closeAll();currentCategory=category;currentSub='';wishlistOnly=wish;$('#search-input').value='';$('#sort-select').value='featured';renderShop();openDialog(shop);shop.scrollTop=0;if(searchFocus)setTimeout(()=>$('#search-input').focus(),60)}
function toggleWishlist(id){if(!byId(id))return;const saved=wishlist.includes(id);wishlist=saved?wishlist.filter(x=>x!==id):[...wishlist,id];sync();if(wishlistOnly&&shop.open)renderShop();if(activeProduct?.id===id){const el=$('.product-save');if(el)el.textContent=wishlist.includes(id)?'♥ Saved to your wishlist':'♡ Save to your wishlist'}notify(saved?'Removed from your wishlist':'Saved to your wishlist');}

function openProduct(id,origin=null){
 const p=byId(id);if(!p)return;activeProduct=p;quantity=1;
 const sourceImage=origin?.querySelector('img');
 const sourceRect=(sourceImage||origin)?.getBoundingClientRect();
 const previousTone=productDialog.open?getComputedStyle(productDialog).backgroundColor:getComputedStyle(document.body).backgroundColor;
 $('#product-content').innerHTML=`<div class="product-scene-nav"><button data-close>← Back to the edit</button><span>VĀRA / ${p.weave.toUpperCase()}</span><span>0${products.indexOf(p)+1} — 08</span></div><div class="product-layout"><div class="product-gallery"><img src="assets/${p.image}.webp" alt="${p.name} saree in ${p.colour}" tabindex="0" role="button" aria-label="Zoom product image"><span class="zoom-label">SELECT IMAGE TO LOOK CLOSER +</span></div><div class="product-support"><figure class="product-support-top"><img src="assets/${p.image}.webp" alt="${p.name} editorial view"><figcaption>${p.colour.toUpperCase()} / ${p.weave.toUpperCase()}</figcaption></figure><figure class="product-support-detail"><img src="assets/${p.image}.webp" alt="${p.name} drape and border detail"><figcaption>THE DRAPE / A CLOSER LOOK</figcaption></figure></div><div class="product-details"><span class="eyebrow">THE ${p.category.toUpperCase()} EDIT / 0${products.indexOf(p)+1}</span><h2>${p.name}</h2><p class="product-subtitle">${p.subtitle}</p><p class="product-price">${money(p.price)}</p><p class="product-concept">Illustrative concept price</p><p class="product-description">${p.description}</p><div class="product-meta"><div><span>WEAVE INSPIRATION</span>${p.weave}</div><div><span>COLOUR</span>${p.colour}</div><div><span>MATERIAL DIRECTION</span>${p.material}</div><div><span>DRAPE</span>Unstitched saree</div></div><div class="product-options"><span>Quantity</span><div class="quantity"><button data-quantity="-1" aria-label="Decrease quantity">−</button><span id="product-quantity">1</span><button data-quantity="1" aria-label="Increase quantity">+</button></div></div><button class="primary-button" id="add-to-bag">Add to bag <span>${money(p.price)} ↗</span></button><button class="product-save" data-save-product="${p.id}">${wishlist.includes(p.id)?'♥ Saved to your wishlist':'♡ Save to your wishlist'}</button><details><summary>The details</summary><p>This is an illustrative design for the VĀRA brand concept. Material composition, dimensions, blouse inclusions and stock would be confirmed for a live product.</p></details><details><summary>Saree care</summary><p>For a real garment, always follow its care label. Delicate silk, embroidery and zari typically need specialist care. Store clean and dry, away from direct sunlight.</p></details><details><summary>Delivery & returns</summary><p>This concept store does not accept payments or place orders. Delivery and return terms will be available when a real catalogue is launched.</p></details></div></div>`;
 productDialog.getAnimations().forEach(a=>a.cancel());
 productDialog.style.setProperty('--product-tone',sceneTones[p.id]);
 productDialog.style.background=sceneTones[p.id];
 openDialog(productDialog);productDialog.scrollTop=0;
 animateProductOpening(p,sourceRect,previousTone);
}
let openingSequence=0;
function animateProductOpening(p,sourceRect,previousTone){
 const sequence=++openingSequence;
 for(const old of productDialog.querySelectorAll('.opening-plane'))old.remove();
 const gallery=productDialog.querySelector('.product-gallery');
 const support=productDialog.querySelector('.product-support');
 const details=productDialog.querySelector('.product-details');
 const nav=productDialog.querySelector('.product-scene-nav');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const target=gallery.getBoundingClientRect();
 const w=innerWidth,h=innerHeight,mobile=w<=700;
 const source=sourceRect&&sourceRect.width>1?sourceRect:{left:w*.43,top:h*.38,width:w*.14,height:h*.25};
 const centre={left:w*(mobile?.37:.45),top:h*.35,width:w*(mobile?.26:.12),height:h*.3};
 const box=r=>({left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
 gallery.style.visibility='hidden';support.style.opacity='0';details.style.opacity='0';nav.style.opacity='0';
 productDialog.animate([{backgroundColor:previousTone},{backgroundColor:sceneTones[p.id]}],{duration:1200,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
 const planes=[];
 for(let i=2;i>=0;i--){
  const plane=document.createElement('div');plane.className='opening-plane';
  plane.innerHTML=`<img src="assets/${p.image}.webp" alt="">`;
  plane.style.zIndex=String(80-i);productDialog.append(plane);planes.push(plane);
  if(i===0){
   const anim=plane.animate([{...box(source),offset:0},{...box(centre),offset:.33},{...box(centre),offset:.49},{...box(target),offset:1}],{duration:1350,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
   anim.finished.then(()=>{if(sequence!==openingSequence)return;gallery.style.visibility='';plane.remove();}).catch(()=>{});
  }else{
   const destination=i===1?support.querySelector('.product-support-top').getBoundingClientRect():support.querySelector('.product-support-detail').getBoundingClientRect();
   plane.animate([{...box(source),opacity:0,offset:0},{...box({...centre,top:centre.top+i*55}),opacity:1,offset:.34},{...box({...centre,top:centre.top+i*75}),opacity:1,offset:.53},{...box(destination),opacity:1,offset:.93},{...box(destination),opacity:0,offset:1}],{duration:1450+i*60,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}).finished.then(()=>plane.remove()).catch(()=>{});
  }
 }
 const fadeIn=(el,delay)=>{el.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});el.style.opacity='';};
 fadeIn(support,1100);fadeIn(details,1000);fadeIn(nav,1000);
}
function addToBag(){if(!activeProduct)return;const item=bag.find(x=>x.id===activeProduct.id);if(item)item.quantity=Math.min(20,item.quantity+quantity);else bag.push({id:activeProduct.id,quantity});sync();closeDialog(productDialog);renderBag();openDialog(bagDialog);}
function renderBag(){
 const total=bag.reduce((n,x)=>n+byId(x.id).price*x.quantity,0);$('#bag-title-count').textContent=`(${bag.reduce((n,x)=>n+x.quantity,0)})`;
 $('#bag-content').innerHTML=bag.length?bag.map(x=>{const p=byId(x.id);return `<article class="bag-item"><button data-product="${p.id}" aria-label="View ${p.name}"><img src="assets/${p.image}.webp" alt="${p.name}"></button><div><h3>${p.name}</h3><p>${p.weave} / ${p.colour}</p><p>${money(p.price*x.quantity)}</p><div class="bag-item-controls"><div class="quantity"><button data-bag-change="${p.id}" data-delta="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${x.quantity}</span><button data-bag-change="${p.id}" data-delta="1" aria-label="Increase ${p.name} quantity">+</button></div><button data-remove="${p.id}">Remove</button></div></div></article>`}).join('')+`<div class="bag-total"><span>Subtotal</span><span>${money(total)}</span></div><p class="bag-note">Illustrative prices. This is a concept store; no payment or order will be processed.</p><button class="primary-button" data-action="checkout">Review your selection <span>↗</span></button><button class="product-save" data-shop="All">Continue exploring</button>`:`<div class="bag-empty"><span class="eyebrow">A STORY WAITING TO BE WORN</span><h3>Your bag is empty.</h3><p>Find a drape that feels like you.</p><button class="primary-button" data-shop="All">Explore the collection <span>↗</span></button></div>`;
 sync();
}
function showInfo(type){
 const content={
  care:['CARE, WITH INTENTION','A little care.<br>A lasting story.','Always follow the care label supplied with your garment. A real silk, zari or embroidered saree may require specialist cleaning.','Store garments clean and dry, away from direct sunlight. For specific cleaning and ironing instructions, consult the garment maker.'],
  delivery:['DELIVERY & RETURNS','The details,<br>before the drape.','VĀRA is an independent brand concept. Its catalogue, imagery and prices are illustrative. No stock, shipping, returns or payment service is connected.','The bag and wishlist let you explore the shopping experience. Nothing you add here places a real order.'],
  concept:['THE VĀRA CONCEPT','Rooted in India.<br>Woven for the world.','VĀRA is a proposed Indian saree house, created as an interactive fashion experience. It celebrates silk, cotton, festive colour and contemporary draping.','This is an illustrative catalogue with AI-generated editorial imagery and example prices. Regional weave names describe the creative direction; no material authenticity, provenance or inventory is certified.'],
  checkout:['YOUR CURATED SELECTION','A beautiful<br>beginning.','Your selection is saved in this browser. This concept is ready to demonstrate the shopping journey, but purchases are not enabled.','No payment has been collected and no order has been placed.']
 }[type];if(!content)return;
 $('#info-content').innerHTML=`<span class="eyebrow">${content[0]}</span><h2>${content[1]}</h2><p>${content[2]}</p><p>${content[3]}</p>${type==='checkout'?`<div class="bag-total"><span>${bag.reduce((n,x)=>n+x.quantity,0)} drapes</span><span>${money(bag.reduce((n,x)=>n+byId(x.id).price*x.quantity,0))}</span></div>`:''}<button class="text-link" data-close>Back to exploring <span>↗</span></button>`;openDialog($('#info-dialog'));
}
document.addEventListener('click',e=>{
 const el=e.target.closest('button,a');if(!el)return;
 if(el.hasAttribute('data-close')){const dialog=el.closest('dialog');if(dialog)closeDialog(dialog);return;}
 if(el.dataset.shop!==undefined){openShop(el.dataset.shop);return;}
 if(el.dataset.product){openProduct(el.dataset.product,el);return;}
 if(el.dataset.wish){toggleWishlist(el.dataset.wish);return;}
 if(el.dataset.saveProduct){toggleWishlist(el.dataset.saveProduct);return;}
 if(el.dataset.category){currentCategory=el.dataset.category;currentSub='';renderShop();return;}
 if(el.dataset.sub){currentSub=currentSub===el.dataset.sub?'':el.dataset.sub;renderShop();return;}
 if(el.dataset.quantity){quantity=Math.min(20,Math.max(1,quantity+Number(el.dataset.quantity)));$('#product-quantity').textContent=quantity;$('#add-to-bag span').textContent=money(activeProduct.price*quantity)+' ↗';return;}
 if(el.dataset.bagChange){const item=bag.find(x=>x.id===el.dataset.bagChange);if(item){item.quantity=Math.min(20,item.quantity+Number(el.dataset.delta));bag=bag.filter(x=>x.quantity>0);renderBag()}return;}
 if(el.dataset.remove){bag=bag.filter(x=>x.id!==el.dataset.remove);renderBag();return;}
 if(el.dataset.info){showInfo(el.dataset.info);return;}
 switch(el.dataset.action){case 'search':openShop('All',false,true);break;case 'wishlist':openShop('All',true);break;case 'bag':renderBag();openDialog(bagDialog);break;case 'menu':openDialog($('#menu-dialog'));break;case 'checkout':showInfo('checkout');break;}
 if(el.id==='add-to-bag')addToBag();
});
$('#search-input').addEventListener('input',renderShop);$('#sort-select').addEventListener('change',renderShop);
$('#clear-filters').addEventListener('click',()=>{currentCategory='All';currentSub='';$('#search-input').value='';$('#sort-select').value='featured';renderShop()});
productDialog.addEventListener('click',e=>{if(e.target.matches('.product-gallery>img'))e.target.parentElement.classList.toggle('zoomed')});
productDialog.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.product-gallery>img')){e.preventDefault();e.target.parentElement.classList.toggle('zoomed')}});
sync();initMotion();
