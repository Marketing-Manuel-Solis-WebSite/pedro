import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const office = searchParams.get("office") || "texas";
  const phone = (searchParams.get("phone") || process.env.NEXT_PUBLIC_WA_NUMBER_TEXAS || "").replace(/[^+\d]/g, "");
  const lang = searchParams.get("lang") || "es";
  const firm = searchParams.get("firm") || process.env.NEXT_PUBLIC_FIRM_NAME || "";
  const platformUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const privacyUrl = searchParams.get("privacy_url") || "";
  const consentVersion = process.env.NEXT_PUBLIC_CONSENT_TEXT_VERSION || "consent-microcopy-es-v1.0";
  const privacyVersion = process.env.NEXT_PUBLIC_PRIVACY_POLICY_VERSION || "v1.0";

  const consentTextEs = "Al continuar, nos autorizas a responderte por WhatsApp para atender tu solicitud. Consulta nuestro Aviso de Privacidad. Puedes dejar de recibir mensajes escribiendo BAJA en cualquier momento.";
  const consentTextEn = "By continuing, you authorize us to respond via WhatsApp regarding your inquiry. See our Privacy Policy. You can stop receiving messages by texting STOP at any time.";
  const consentText = lang === "en" ? consentTextEn : consentTextEs;

  const prefilledEs = "Hola, vengo del sitio web y quiero información sobre sus servicios.";
  const prefilledEn = "Hi, I came from the website and would like information about your services.";
  const prefilled = lang === "en" ? prefilledEn : prefilledEs;

  const buttonTextEs = "Escríbenos por WhatsApp";
  const buttonTextEn = "Message us on WhatsApp";
  const buttonText = lang === "en" ? buttonTextEn : buttonTextEs;

  const js = `(function(){
'use strict';
if(document.getElementById('wa-lead-widget'))return;
var C={
office:${JSON.stringify(office)},
phone:${JSON.stringify(phone)},
lang:${JSON.stringify(lang)},
firm:${JSON.stringify(firm)},
url:${JSON.stringify(platformUrl)},
pu:${JSON.stringify(privacyUrl)},
ct:${JSON.stringify(consentText)},
cv:${JSON.stringify(consentVersion)},
pv:${JSON.stringify(privacyVersion)},
pf:${JSON.stringify(prefilled)},
bt:${JSON.stringify(buttonText)}
};
function utms(){var p=new URLSearchParams(window.location.search);return{utm_source:p.get('utm_source')||'',utm_medium:p.get('utm_medium')||'',utm_campaign:p.get('utm_campaign')||'',utm_content:p.get('utm_content')||'',utm_term:p.get('utm_term')||''};}
function uuid(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});}
function consent(cb){var u=utms(),d={consent_event_id:uuid(),phone:C.phone,consent_type:'whatsapp_initial',consent_method:'button_click',source_url:window.location.href,source_page_title:document.title,campaign:u.utm_campaign||C.office,utm_source:u.utm_source,utm_medium:u.utm_medium,utm_campaign:u.utm_campaign,utm_content:u.utm_content,utm_term:u.utm_term,legal_text_shown:C.ct,legal_text_version:C.cv,privacy_policy_url:C.pu||window.location.origin+'/'+(C.lang==='en'?'privacy':'privacidad'),privacy_policy_version:C.pv,destination_phone:C.phone,language:C.lang,device_fingerprint:''};var x=new XMLHttpRequest();x.open('POST',C.url+'/api/consent',true);x.setRequestHeader('Content-Type','application/json');x.timeout=2000;x.onloadend=function(){cb();};x.ontimeout=function(){cb();};x.onerror=function(){try{localStorage.setItem('wa_consent_retry',JSON.stringify(d));}catch(e){}cb();};x.send(JSON.stringify(d));}
function ga(){if(typeof gtag==='function'){gtag('event','whatsapp_click',{event_category:'lead_capture',event_label:C.office});}}
function open(){window.open('https://wa.me/'+C.phone.replace('+','')+'?text='+encodeURIComponent(C.pf),'_blank');}
function click(){ga();consent(function(){open();});}
var s=document.createElement('style');
s.textContent='#wa-lead-widget{position:fixed;bottom:24px;right:24px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}#wa-lead-widget .wa-btn{display:flex;align-items:center;gap:8px;background:#25D366;color:#fff;border:none;border-radius:28px;padding:12px 20px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(37,211,102,.3);transition:transform .2s,box-shadow .2s;line-height:1}#wa-lead-widget .wa-btn:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(37,211,102,.4)}#wa-lead-widget .wa-btn svg{width:22px;height:22px;flex-shrink:0}#wa-lead-widget .wa-consent{position:absolute;bottom:100%;right:0;margin-bottom:8px;background:#fff;color:#4a5568;font-size:11px;line-height:1.4;padding:10px 12px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.12);max-width:280px;opacity:0;pointer-events:none;transition:opacity .2s}#wa-lead-widget .wa-btn:hover+.wa-consent,#wa-lead-widget .wa-consent:hover{opacity:1;pointer-events:auto}#wa-lead-widget .wa-consent a{color:#2b6cb0;text-decoration:underline}@media(max-width:640px){#wa-lead-widget .wa-btn span{display:none}#wa-lead-widget .wa-btn{padding:14px;border-radius:50%}#wa-lead-widget .wa-consent{display:none}}';
document.head.appendChild(s);
var w=document.createElement('div');w.id='wa-lead-widget';
var pl=C.pu?'<a href="'+C.pu+'" target="_blank">'+(C.lang==='en'?'Privacy Policy':'Aviso de Privacidad')+'</a>':(C.lang==='en'?'Privacy Policy':'Aviso de Privacidad');
var ch=C.ct.replace(C.lang==='en'?'Privacy Policy':'Aviso de Privacidad',pl);
w.innerHTML='<button class="wa-btn" aria-label="'+C.bt+'"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span>'+C.bt+'</span></button><div class="wa-consent">'+ch+'</div>';
w.querySelector('.wa-btn').addEventListener('click',click);
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(w);});}else{document.body.appendChild(w);}
try{var r=localStorage.getItem('wa_consent_retry');if(r){var x=new XMLHttpRequest();x.open('POST',C.url+'/api/consent',true);x.setRequestHeader('Content-Type','application/json');x.onload=function(){if(x.status===200)localStorage.removeItem('wa_consent_retry');};x.send(r);}}catch(e){}
})();`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
